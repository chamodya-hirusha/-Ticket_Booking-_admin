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
import { paymentServiceAPI, type PaymentDTO, type PaymentHistoryQueryParams } from './paymentService';
import { userServiceAPI, type ResponseDTO } from './userService';
import { reservationServiceAPI, type ReservationDTO, type ReservationQueryParams, type EventCancelRequestDTO } from './reservationService';
import { toast } from 'sonner@2.0.3';

// Base URL for other services (tickets, vendors, payments, stats)
// These endpoints need to be implemented in the backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Helper function to convert EventDTO to Event
function convertEventDTOToEvent(dto: EventDTO): Event {
  // Calculate total tickets and available tickets
  const vipLimit = dto.vipTicketLimit ?? 0;
  const premiumLimit = dto.premiumTicketLimit ?? 0;
  const generalLimit = dto.generalTicketLimit ?? 0;
  const totalTickets = vipLimit + premiumLimit + generalLimit;
  // Use general ticket limit as available tickets if provided, otherwise fallback to total
  const availableTickets = generalLimit || totalTickets;
  
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
    // Preserve tiered ticket data for editing
    vipTicketLimit: vipLimit,
    premiumTicketLimit: premiumLimit,
    generalTicketLimit: generalLimit,
    vipTicketPrice: dto.vipTicketPrice ?? 0,
    premiumTicketPrice: dto.premiumTicketPrice ?? 0,
    generalTicketPrice: dto.generalTicketPrice ?? 0,
  };
}

// Helper to convert PaymentDTO to Payment
function convertPaymentDTOToPayment(dto: PaymentDTO): Payment {
  // Map backend status to frontend status
  const statusMap: Record<string, Payment['status']> = {
    'PENDING': 'pending',
    'COMPLETED': 'completed',
    'FAILED': 'failed',
    'REFUNDED': 'refunded',
  };

  const status = statusMap[dto.status?.toUpperCase()] || 'pending';

  return {
    id: String(dto.id),
    ticketId: dto.reservationId ? String(dto.reservationId) : '',
    userId: '', // backend does not provide userId in PaymentDTO
    amount: dto.amount,
    status,
    paymentMethod: dto.paymentMethod || 'unknown',
    transactionDate: dto.transactionDate || new Date().toISOString(),
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
    // Use tiered ticket fields from the form; fall back to legacy single-tier values if needed
    vipTicketLimit: data.vipTicketLimit ?? 0,
    premiumTicketLimit: data.premiumTicketLimit ?? 0,
    generalTicketLimit: data.generalTicketLimit ?? data.availableTickets,
    vipTicketPrice: data.vipTicketPrice ?? 0,
    premiumTicketPrice: data.premiumTicketPrice ?? 0,
    generalTicketPrice: data.generalTicketPrice ?? data.price,
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
      const errorMsg = text || `HTTP ${response.status}: ${response.statusText}`;
      toast.error(errorMsg);
      return {
        success: false,
        message: errorMsg,
        error: errorMsg,
      } as ResponseDTO<T>;
    }

    if (!response.ok) {
      const errorMsg = data.message || data.error || `Request failed with status ${response.status}`;
      toast.error(errorMsg);
      return {
        success: false,
        message: errorMsg,
        error: errorMsg,
        data: data.data,
      } as ResponseDTO<T>;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        const networkError = 'Network error. Please check your connection and API server.';
        toast.error(networkError);
        return {
          success: false,
          message: networkError,
          error: networkError,
        } as ResponseDTO<T>;
      }
      toast.error(error.message || 'An error occurred');
      return {
        success: false,
        message: error.message || 'An error occurred',
        error: error.message || 'An error occurred',
      } as ResponseDTO<T>;
    }
    const unexpectedError = 'An unexpected error occurred';
    toast.error(unexpectedError);
    return {
      success: false,
      message: unexpectedError,
      error: unexpectedError,
    } as ResponseDTO<T>;
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
      
      // Get real data from backend
      return {
        totalEvents: publishedEvents.length,
        ticketsSold: 0,
        totalRevenue: 0,
        activeUsers: 0,
        recentBookings: [],
        upcomingEvents: publishedEvents
          .slice(0, 5)
          .map(convertEventDTOToEvent)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        revenueByMonth: [],
        ticketsByStatus: [],
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

      console.log('Fetching events with filters:', filters);
      let response: ResponseDTO<PageResponse<EventDTO>>;
      
      if (filters?.search || filters?.dateFrom || filters?.dateTo) {
        // Use advanced search if filters are provided
        response = await eventServiceAPI.advancedSearchEvents(params);
      } else {
        // Use regular get all
        response = await eventServiceAPI.getAllEvents(params);
      }

      console.log('Events API response:', response);

      // Handle API response structure - check both response.data and response.content
      let pageData: PageResponse<EventDTO> | undefined;
      
      // Check if data is in response.data (standard ResponseDTO)
      if (response.data) {
        pageData = response.data;
        console.log('Found page data in response.data');
      }
      // Check if data is directly in response (actual API structure after conversion)
      else if ((response as any).content && typeof (response as any).content === 'object') {
        // The content might be the PageResponse itself
        if ((response as any).content.content) {
          pageData = (response as any).content as PageResponse<EventDTO>;
          console.log('Found page data in response.content (paginated)');
        } else {
          // Single object, wrap it
          pageData = {
            content: [(response as any).content as EventDTO],
            totalElements: 1,
            totalPages: 1,
            size: 1,
            number: 0,
            first: true,
            last: true,
          };
          console.log('Found single event in response.content');
        }
      }

      let events: EventDTO[] = [];
      if (pageData?.content) {
        events = pageData.content;
        console.log(`Found ${events.length} events in response`);
      } else {
        console.warn('No events found in response. Full response:', response);
      }

      // Apply status filter if provided
      if (filters?.status && events.length > 0) {
        const statusMap: Record<string, string> = {
          'draft': 'DRAFT',
          'published': 'PUBLISHED',
          'cancelled': 'CANCELLED',
        };
        const backendStatus = statusMap[filters.status];
        if (backendStatus) {
          const beforeFilter = events.length;
          events = events.filter(e => e.eventStatus === backendStatus);
          console.log(`Status filter applied: ${beforeFilter} -> ${events.length} events`);
        }
      }

      const convertedEvents = events.map(convertEventDTOToEvent);
      console.log(`Converted ${convertedEvents.length} events to UI format`);
      return convertedEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch events';
      toast.error(errorMsg);
      return [];
    }
  },

  async getEvent(id: string): Promise<Event | null> {
    try {
      const eventId = parseInt(id, 10);
      if (isNaN(eventId)) {
        throw new Error('Invalid event ID');
      }
      console.log('Fetching event by ID:', eventId);
      const response = await eventServiceAPI.getEventById(eventId);
      console.log('Get event response:', response);

      // Handle API response structure - check both response.data and response.content
      let eventData: EventDTO | undefined;
      
      if (response.data) {
        eventData = response.data;
        console.log('Found event data in response.data');
      } else if ((response as any).content) {
        eventData = (response as any).content as EventDTO;
        console.log('Found event data in response.content');
      }

      if (eventData) {
        return convertEventDTOToEvent(eventData);
      }
      console.warn('No event data found in response');
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  },

  async createEvent(data: EventFormData): Promise<Event> {
    try {
      const requestData = convertEventFormDataToRequest(data);
      console.log('Creating event with data:', requestData);
      const response = await eventServiceAPI.createEvent(requestData);
      console.log('Create event response:', response);

      // Handle API response structure - check both response.data and response.content
      let eventData: EventDTO | undefined;
      
      if (response.data) {
        eventData = response.data;
        console.log('Found event data in response.data');
      } else if ((response as any).content) {
        eventData = (response as any).content as EventDTO;
        console.log('Found event data in response.content');
      }

      if (!eventData) {
        console.error('No event data in response:', response);
        const errorMsg = response.message || 'Failed to create event';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      return convertEventDTOToEvent(eventData);
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to create event';
      toast.error(errorMsg);
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
        toast.error('Event not found');
        throw new Error('Event not found');
      }

      // Merge with existing data
      const mergedData: EventFormData = {
        name: data.name ?? existingEvent.name,
        description: data.description ?? existingEvent.description,
        date: data.date ?? existingEvent.date,
        time: data.time ?? existingEvent.time,
        location: data.location ?? existingEvent.location,
        imageUrl: data.imageUrl ?? existingEvent.imageUrl,
        category: data.category ?? existingEvent.category,
        status: data.status ?? existingEvent.status,
        // New tiered ticket fields – default from existing event if not overridden
        vipTicketLimit:
          data.vipTicketLimit ?? (existingEvent as any).vipTicketLimit ?? 0,
        premiumTicketLimit:
          data.premiumTicketLimit ?? (existingEvent as any).premiumTicketLimit ?? 0,
        generalTicketLimit:
          data.generalTicketLimit ??
          data.availableTickets ??
          (existingEvent as any).generalTicketLimit ??
          existingEvent.availableTickets,
        vipTicketPrice:
          data.vipTicketPrice ?? (existingEvent as any).vipTicketPrice ?? 0,
        premiumTicketPrice:
          data.premiumTicketPrice ?? (existingEvent as any).premiumTicketPrice ?? 0,
        generalTicketPrice:
          data.generalTicketPrice ??
          data.price ??
          (existingEvent as any).generalTicketPrice ??
          existingEvent.price,
        // Legacy single-tier fields (kept in sync with general tier)
        price:
          data.price ??
          data.generalTicketPrice ??
          (existingEvent as any).generalTicketPrice ??
          existingEvent.price,
        availableTickets:
          data.availableTickets ??
          data.generalTicketLimit ??
          (existingEvent as any).generalTicketLimit ??
          existingEvent.availableTickets,
      };

      const requestData = convertEventFormDataToRequest(mergedData);
      console.log('Updating event:', eventId, 'with data:', requestData);
      const response = await eventServiceAPI.updateEvent(eventId, requestData);
      console.log('Update event response:', response);

      // Handle API response structure - check both response.data and response.content
      let eventData: EventDTO | undefined;
      
      if (response.data) {
        eventData = response.data;
        console.log('Found event data in response.data');
      } else if ((response as any).content) {
        eventData = (response as any).content as EventDTO;
        console.log('Found event data in response.content');
      }

      if (!eventData) {
        console.error('No event data in response:', response);
        const errorMsg = response.message || 'Failed to update event';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      return convertEventDTOToEvent(eventData);
    } catch (error) {
      console.error('Error updating event:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update event';
      toast.error(errorMsg);
      throw error;
    }
  },

  async deleteEvent(id: string): Promise<void> {
    // TODO: Implement delete endpoint in backend
    toast.error('Delete event endpoint not yet implemented in backend');
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
    toast.error('Update ticket status endpoint not yet implemented in backend');
    throw new Error('Update ticket status endpoint not yet implemented in backend');
  },

  // Users
  async getUsers(filters?: FilterOptions): Promise<User[]> {
    try {
      // New backend endpoint: GET /api/v1/user/all (paginated)
      const params = new URLSearchParams();

      // Pagination (0-based)
      params.append('page', String(filters?.page ?? 0));
      params.append('size', String(filters?.limit ?? 20));

      // Sorting
      params.append('sortBy', 'id');
      params.append('direction', 'DESC');

      const queryString = params.toString();
      const endpoint = `/api/v1/user/all${queryString ? `?${queryString}` : ''}`;

      // Expect ResponseDTO<PageResponse<User>>
      const response = await authenticatedRequest<PageResponse<User>>(endpoint, {
        method: 'GET',
      });

      const pageData = response.data;
      let users: User[] = pageData?.content || [];

      // Client-side status filter
      if (filters?.status && filters.status !== 'all') {
        users = users.filter((u) => u.status === filters.status);
      }

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async updateUserStatus(id: string, status: User['status']): Promise<User> {
    // TODO: Implement user status update endpoint
    toast.error('Update user status endpoint not yet implemented in backend');
    throw new Error('Update user status endpoint not yet implemented in backend');
  },

  // Vendors
  async getVendors(filters?: FilterOptions): Promise<Vendor[]> {
    try {
      // New backend endpoint: GET /api/v1/vendor/all (paginated)
      const params = new URLSearchParams();

      // Pagination (0-based)
      params.append('page', String(filters?.page ?? 0));
      params.append('size', String(filters?.limit ?? 20));

      // Sorting
      params.append('sortBy', 'id');
      params.append('direction', 'DESC');

      const queryString = params.toString();
      const endpoint = `/api/v1/vendor/all${queryString ? `?${queryString}` : ''}`;

      // Expect ResponseDTO<PageResponse<Vendor>>
      const response = await authenticatedRequest<PageResponse<Vendor>>(endpoint, {
        method: 'GET',
      });

      const pageData = response.data;
      let vendors: Vendor[] = pageData?.content || [];

      // Client-side status filter
      if (filters?.status && filters.status !== 'all') {
        vendors = vendors.filter((v) => v.status === filters.status);
      }

      return vendors;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
  },

  async updateVendorStatus(id: string, status: Vendor['status']): Promise<Vendor> {
    // TODO: Implement vendor status update endpoint
    toast.error('Update vendor status endpoint not yet implemented in backend');
    throw new Error('Update vendor status endpoint not yet implemented in backend');
  },

  // Payments
  async getPayments(filters?: FilterOptions): Promise<Payment[]> {
    try {
      const statusFilter = filters?.status;
      const query: PaymentHistoryQueryParams = {
        page: filters?.page ?? 0,
        size: filters?.limit ?? 50,
        sortBy: 'id',
        direction: 'DESC',
      };

      console.log('Fetching payments with filters:', filters);
      const response = await paymentServiceAPI.getPaymentHistory(query);
      console.log('Payments API response:', response);

      // Handle API response structure - check both response.data and response.content
      let pageData: any;
      if (response.data) {
        pageData = response.data;
      } else if ((response as any).content) {
        pageData = (response as any).content;
      }

      const paymentsDto: PaymentDTO[] = pageData?.content || [];
      console.log(`Found ${paymentsDto.length} payments in response`);

      let payments = paymentsDto.map(convertPaymentDTOToPayment);

      // Apply status filter if provided
      if (statusFilter && statusFilter !== 'all') {
        const beforeFilter = payments.length;
        payments = payments.filter(p => p.status === statusFilter);
        console.log(`Status filter applied: ${beforeFilter} -> ${payments.length} payments`);
      }

      return payments;
    } catch (error) {
      console.error('Error fetching payments:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch payments';
      toast.error(errorMsg);
      return [];
    }
  },

  async refundPayment(id: string, amount: number): Promise<Payment> {
    // TODO: Implement refund endpoint when backend is available
    console.warn('Refund payment endpoint not yet implemented in backend');
    toast.error('Refund payment is not implemented on the server yet.');
    throw new Error('Refund payment is not implemented on the server yet.');
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
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch refund available reservations';
      toast.error(errorMsg);
      return [];
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
      const errorMsg = error instanceof Error ? error.message : 'Failed to cancel event';
      toast.error(errorMsg);
      throw new Error(errorMsg);
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
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch payment history';
      toast.error(errorMsg);
      return [];
    }
  },
};
