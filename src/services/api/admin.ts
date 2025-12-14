// Admin API Service - Backend Integration
// This service integrates with the backend APIs

import type { 
  Event, 
  Ticket, 
  User, 
  Vendor, 
  Payment, 
  AdminStats,
  EventFormData,
  FilterOptions 
} from '../../types/admin';
import { eventServiceAPI, type EventDTO, type PageResponse } from './eventService';
import { userServiceAPI, type ResponseDTO } from './userService';
import { reservationServiceAPI, type ReservationDTO, type ReservationQueryParams, type EventCancelRequestDTO } from './reservationService';
import { paymentServiceAPI, type PaymentDTO, type PaymentHistoryQueryParams } from './paymentService';

// Base URL for other services (tickets, vendors, payments, stats)
// These endpoints need to be implemented in the backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Helper function to convert EventDTO to Event
function convertEventDTOToEvent(dto: EventDTO): Event {
  // Calculate total tickets and available tickets
  const totalTickets = dto.vipTicketLimit + dto.premiumTicketLimit + dto.generalTicketLimit;
  // For available tickets, we'll use total for now (backend should provide this)
  const availableTickets = totalTickets;
  
  // Use general ticket price as default price
  const price = dto.generalTicketPrice || 0;
  
  // Map event status
  const statusMap: Record<string, 'draft' | 'published' | 'cancelled'> = {
    'DRAFT': 'draft',
    'PUBLISHED': 'published',
    'CANCELLED': 'cancelled',
  };
  const status = statusMap[dto.eventStatus?.toUpperCase()] || 'draft';

  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description,
    date: dto.date,
    time: dto.startTime,
    location: dto.location,
    price: price,
    imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    category: dto.eventCategory || 'General',
    availableTickets: availableTickets,
    totalTickets: totalTickets,
    status: status,
    vendorId: dto.vendorId ? String(dto.vendorId) : '',
    createdAt: dto.createdAt || new Date().toISOString(),
    updatedAt: dto.updatedAt || new Date().toISOString(),
  };
}

// Helper function to convert EventFormData to EventRequest
function convertEventFormDataToRequest(data: EventFormData): {
  name: string;
  slug: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  vipTicketLimit: number;
  premiumTicketLimit: number;
  generalTicketLimit: number;
  vipTicketPrice: number;
  premiumTicketPrice: number;
  generalTicketPrice: number;
  eventCategory: string;
  eventStatus: string;
} {
  // Generate slug from name
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Map status
  const statusMap: Record<string, string> = {
    'draft': 'DRAFT',
    'published': 'PUBLISHED',
    'cancelled': 'CANCELLED',
  };

  return {
    name: data.name,
    slug: slug,
    description: data.description,
    location: data.location,
    date: data.date,
    startTime: data.time,
    vipTicketLimit: 0, // These should come from form data in future
    premiumTicketLimit: 0,
    generalTicketLimit: data.availableTickets,
    vipTicketPrice: 0,
    premiumTicketPrice: 0,
    generalTicketPrice: data.price,
    eventCategory: data.category,
    eventStatus: statusMap[data.status] || 'DRAFT',
  };
}

// Helper function for authenticated requests
async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ResponseDTO<T>> {
  try {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data: ResponseDTO<T>;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error. Please check your connection and API server.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// API Functions
export const adminApi = {
  // Dashboard Stats
  // TODO: Replace with actual backend endpoint when available
  async getStats(): Promise<AdminStats> {
    try {
      // Try to get stats from backend if endpoint exists
      // For now, we'll aggregate from available data
      const eventsResponse = await eventServiceAPI.getAllEvents({ page: 0, size: 100 });
      const events = eventsResponse.data?.content || [];
      
      // Calculate stats from events
      const publishedEvents = events.filter(e => e.eventStatus === 'PUBLISHED');
      
      // TODO: Get tickets, users, payments from backend when endpoints are available
      // For now, return mock stats structure
      return {
        totalEvents: publishedEvents.length,
        ticketsSold: 0, // TODO: Get from tickets endpoint
        totalRevenue: 0, // TODO: Get from payments endpoint
        activeUsers: 0, // TODO: Get from users endpoint
        recentBookings: [], // TODO: Get from tickets endpoint
        upcomingEvents: publishedEvents
          .slice(0, 5)
          .map(convertEventDTOToEvent)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        revenueByMonth: [
          { month: 'Jan', revenue: 0 },
          { month: 'Feb', revenue: 0 },
          { month: 'Mar', revenue: 0 },
          { month: 'Apr', revenue: 0 },
          { month: 'May', revenue: 0 },
          { month: 'Jun', revenue: 0 },
        ],
        ticketsByStatus: [
          { status: 'Confirmed', count: 0 },
          { status: 'Pending', count: 0 },
          { status: 'Used', count: 0 },
          { status: 'Cancelled', count: 0 },
        ],
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Return empty stats on error
      return {
        totalEvents: 0,
        ticketsSold: 0,
        totalRevenue: 0,
        activeUsers: 0,
        recentBookings: [],
        upcomingEvents: [],
        revenueByMonth: [],
        ticketsByStatus: [],
      };
    }
  },

  // Events - Using Event Service API
  async getEvents(filters?: FilterOptions): Promise<Event[]> {
    try {
      const params = {
        page: filters?.page || 0,
        size: filters?.limit || 20,
        sortBy: 'date',
        direction: 'DESC' as const,
        ...(filters?.category && { category: filters.category }),
        ...(filters?.search && { text: filters.search }),
        ...(filters?.dateFrom && { start: filters.dateFrom }),
        ...(filters?.dateTo && { end: filters.dateTo }),
      };

      let response: ResponseDTO<PageResponse<EventDTO>>;
      
      if (filters?.search || filters?.dateFrom || filters?.dateTo) {
        // Use advanced search if filters are provided
        response = await eventServiceAPI.advancedSearchEvents(params);
      } else {
        // Use regular get all
        response = await eventServiceAPI.getAllEvents(params);
      }

      let events = response.data?.content || [];

      // Apply status filter if provided
      if (filters?.status) {
        const statusMap: Record<string, string> = {
          'draft': 'DRAFT',
          'published': 'PUBLISHED',
          'cancelled': 'CANCELLED',
        };
        const backendStatus = statusMap[filters.status];
        if (backendStatus) {
          events = events.filter(e => e.eventStatus === backendStatus);
        }
      }

      return events.map(convertEventDTOToEvent);
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  async getEvent(id: string): Promise<Event | null> {
    try {
      const eventId = parseInt(id, 10);
      if (isNaN(eventId)) {
        throw new Error('Invalid event ID');
      }
      const response = await eventServiceAPI.getEventById(eventId);
      if (response.data) {
        return convertEventDTOToEvent(response.data);
      }
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  },

  async createEvent(data: EventFormData): Promise<Event> {
    try {
      const requestData = convertEventFormDataToRequest(data);
      const response = await eventServiceAPI.createEvent(requestData);
      if (!response.data) {
        throw new Error('Failed to create event');
      }
      return convertEventDTOToEvent(response.data);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  async updateEvent(id: string, data: Partial<EventFormData>): Promise<Event> {
    try {
      const eventId = parseInt(id, 10);
      if (isNaN(eventId)) {
        throw new Error('Invalid event ID');
      }

      // Get existing event first to merge data
      const existingEvent = await this.getEvent(id);
      if (!existingEvent) {
        throw new Error('Event not found');
      }

      // Merge with existing data
      const mergedData: EventFormData = {
        name: data.name ?? existingEvent.name,
        description: data.description ?? existingEvent.description,
        date: data.date ?? existingEvent.date,
        time: data.time ?? existingEvent.time,
        location: data.location ?? existingEvent.location,
        price: data.price ?? existingEvent.price,
        imageUrl: data.imageUrl ?? existingEvent.imageUrl,
        category: data.category ?? existingEvent.category,
        availableTickets: data.availableTickets ?? existingEvent.availableTickets,
        status: data.status ?? existingEvent.status,
      };

      const requestData = convertEventFormDataToRequest(mergedData);
      const response = await eventServiceAPI.updateEvent(eventId, requestData);
      if (!response.data) {
        throw new Error('Failed to update event');
      }
      return convertEventDTOToEvent(response.data);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  async deleteEvent(id: string): Promise<void> {
    // TODO: Implement delete endpoint in backend
    // For now, we'll throw an error
    throw new Error('Delete event endpoint not yet implemented in backend');
  },

  // Tickets
  // TODO: Replace with actual backend endpoint when available
  async getTickets(filters?: FilterOptions): Promise<Ticket[]> {
    try {
      // TODO: Replace with actual tickets endpoint
      // const response = await authenticatedRequest<Ticket[]>('/api/v1/admin/tickets', {
      //   method: 'GET',
      // });
      // return response.data || [];
      
      // Placeholder - return empty array until backend endpoint is available
      console.warn('Tickets endpoint not yet implemented in backend');
      return [];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  },

  async updateTicketStatus(id: string, status: Ticket['status']): Promise<Ticket> {
    // TODO: Implement ticket status update endpoint
    throw new Error('Update ticket status endpoint not yet implemented in backend');
  },

  // Users
  // TODO: Replace with actual backend endpoint when available
  async getUsers(filters?: FilterOptions): Promise<User[]> {
    try {
      // TODO: Replace with actual users endpoint
      // const response = await authenticatedRequest<User[]>('/api/v1/admin/users', {
      //   method: 'GET',
      // });
      // return response.data || [];
      
      console.warn('Users endpoint not yet implemented in backend');
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async updateUserStatus(id: string, status: User['status']): Promise<User> {
    // TODO: Implement user status update endpoint
    throw new Error('Update user status endpoint not yet implemented in backend');
  },

  // Vendors
  // TODO: Replace with actual backend endpoint when available
  async getVendors(filters?: FilterOptions): Promise<Vendor[]> {
    try {
      // TODO: Replace with actual vendors endpoint
      // const response = await authenticatedRequest<Vendor[]>('/api/v1/admin/vendors', {
      //   method: 'GET',
      // });
      // return response.data || [];
      
      console.warn('Vendors endpoint not yet implemented in backend');
      return [];
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
  },

  async updateVendorStatus(id: string, status: Vendor['status']): Promise<Vendor> {
    // TODO: Implement vendor status update endpoint
    throw new Error('Update vendor status endpoint not yet implemented in backend');
  },

  // Payments
  // TODO: Replace with actual backend endpoint when available
  async getPayments(filters?: FilterOptions): Promise<Payment[]> {
    try {
      // TODO: Replace with actual payments endpoint
      // const response = await authenticatedRequest<Payment[]>('/api/v1/admin/payments', {
      //   method: 'GET',
      // });
      // return response.data || [];
      
      console.warn('Payments endpoint not yet implemented in backend');
      return [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  },

  async refundPayment(id: string, amount: number): Promise<Payment> {
    // TODO: Implement refund endpoint
    throw new Error('Refund payment endpoint not yet implemented in backend');
  },

  // Reservations (Admin endpoints)
  /**
   * Get Refund Available Reservations
   * GET /api/v1/reservation/refund-available
   * Authorization: Requires ADMIN role
   */
  async getRefundAvailableReservations(params?: ReservationQueryParams): Promise<ReservationDTO[]> {
    try {
      const response = await reservationServiceAPI.getRefundAvailableReservations(params);
      return response.data?.content || [];
    } catch (error) {
      console.error('Error fetching refund available reservations:', error);
      throw error;
    }
  },

  /**
   * Cancel Event
   * POST /api/v1/reservation/event-cancel
   * Authorization: Requires ADMIN role
   */
  async cancelEvent(data: EventCancelRequestDTO): Promise<string> {
    try {
      const response = await reservationServiceAPI.cancelEvent(data);
      return response.message || 'Event cancelled successfully';
    } catch (error) {
      console.error('Error cancelling event:', error);
      throw error;
    }
  },

  // Payment History (can be used by admin to view user payments)
  /**
   * Get Payment History
   * GET /api/v1/payment/payment-history
   * Authorization: Requires USER role (but can be used by admin if logged in as user)
   */
  async getPaymentHistory(params?: PaymentHistoryQueryParams): Promise<PaymentDTO[]> {
    try {
      const response = await paymentServiceAPI.getPaymentHistory(params);
      return response.data?.content || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },
};
