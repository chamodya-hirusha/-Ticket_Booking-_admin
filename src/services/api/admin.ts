// Admin API Service with Mock Data

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

// Mock Data
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Summer Music Festival 2025',
    description: 'Join us for an amazing outdoor music festival featuring top artists from around the world.',
    date: '2025-07-15',
    time: '18:00',
    location: 'Central Park, New York',
    price: 89.99,
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    category: 'Music',
    availableTickets: 450,
    totalTickets: 1000,
    status: 'published',
    vendorId: 'v1',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Tech Conference 2025',
    description: 'Annual technology conference with industry leaders and innovators.',
    date: '2025-06-20',
    time: '09:00',
    location: 'Convention Center, San Francisco',
    price: 299.99,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    category: 'Technology',
    availableTickets: 200,
    totalTickets: 500,
    status: 'published',
    vendorId: 'v2',
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
  },
  {
    id: '3',
    name: 'Art Exhibition Opening',
    description: 'Contemporary art exhibition featuring emerging artists.',
    date: '2025-05-10',
    time: '19:00',
    location: 'Modern Art Museum, Chicago',
    price: 25.00,
    imageUrl: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800',
    category: 'Art',
    availableTickets: 150,
    totalTickets: 200,
    status: 'published',
    vendorId: 'v1',
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
  },
  {
    id: '4',
    name: 'Food & Wine Festival',
    description: 'Culinary experience with renowned chefs and wine tasting.',
    date: '2025-08-05',
    time: '17:00',
    location: 'Waterfront Plaza, Seattle',
    price: 125.00,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    category: 'Food',
    availableTickets: 300,
    totalTickets: 400,
    status: 'draft',
    vendorId: 'v3',
    createdAt: '2025-02-10T10:00:00Z',
    updatedAt: '2025-02-10T10:00:00Z',
  },
];

const mockTickets: Ticket[] = [
  {
    id: 't1',
    eventId: '1',
    userId: 'u1',
    purchaseDate: '2025-03-15T14:30:00Z',
    status: 'confirmed',
    quantity: 2,
    totalPrice: 179.98,
    bookingReference: 'BK001234',
    paymentId: 'p1',
  },
  {
    id: 't2',
    eventId: '2',
    userId: 'u2',
    purchaseDate: '2025-03-16T10:20:00Z',
    status: 'confirmed',
    quantity: 1,
    totalPrice: 299.99,
    bookingReference: 'BK001235',
    paymentId: 'p2',
  },
  {
    id: 't3',
    eventId: '3',
    userId: 'u3',
    purchaseDate: '2025-03-17T16:45:00Z',
    status: 'pending',
    quantity: 3,
    totalPrice: 75.00,
    bookingReference: 'BK001236',
    paymentId: 'p3',
  },
];

const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    role: 'user',
    createdAt: '2024-06-15T10:00:00Z',
    totalBookings: 5,
    totalSpent: 450.50,
  },
  {
    id: 'u2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    role: 'user',
    createdAt: '2024-08-20T10:00:00Z',
    totalBookings: 3,
    totalSpent: 599.97,
  },
  {
    id: 'u3',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '+1 (555) 345-6789',
    status: 'active',
    role: 'user',
    createdAt: '2025-01-10T10:00:00Z',
    totalBookings: 1,
    totalSpent: 75.00,
  },
];

const mockVendors: Vendor[] = [
  {
    id: 'v1',
    name: 'EventPro Inc.',
    email: 'contact@eventpro.com',
    companyName: 'EventPro Productions',
    status: 'approved',
    totalEvents: 15,
    totalRevenue: 125000,
    createdAt: '2024-01-15T10:00:00Z',
    phone: '+1 (555) 111-2222',
  },
  {
    id: 'v2',
    name: 'Tech Events LLC',
    email: 'info@techevents.com',
    companyName: 'Tech Events Limited',
    status: 'approved',
    totalEvents: 8,
    totalRevenue: 85000,
    createdAt: '2024-03-20T10:00:00Z',
    phone: '+1 (555) 222-3333',
  },
  {
    id: 'v3',
    name: 'Culinary Experiences',
    email: 'hello@culinaryexp.com',
    companyName: 'Culinary Experiences Co.',
    status: 'pending',
    totalEvents: 0,
    totalRevenue: 0,
    createdAt: '2025-02-01T10:00:00Z',
    phone: '+1 (555) 333-4444',
  },
];

const mockPayments: Payment[] = [
  {
    id: 'p1',
    ticketId: 't1',
    userId: 'u1',
    amount: 179.98,
    status: 'completed',
    paymentMethod: 'credit_card',
    transactionDate: '2025-03-15T14:30:00Z',
  },
  {
    id: 'p2',
    ticketId: 't2',
    userId: 'u2',
    amount: 299.99,
    status: 'completed',
    paymentMethod: 'paypal',
    transactionDate: '2025-03-16T10:20:00Z',
  },
  {
    id: 'p3',
    ticketId: 't3',
    userId: 'u3',
    amount: 75.00,
    status: 'pending',
    paymentMethod: 'debit_card',
    transactionDate: '2025-03-17T16:45:00Z',
  },
];

// API Functions
export const adminApi = {
  // Dashboard Stats
  async getStats(): Promise<AdminStats> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const totalRevenue = mockPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const ticketsSold = mockTickets
      .filter(t => t.status !== 'cancelled')
      .reduce((sum, t) => sum + t.quantity, 0);
    
    return {
      totalEvents: mockEvents.filter(e => e.status === 'published').length,
      ticketsSold,
      totalRevenue,
      activeUsers: mockUsers.filter(u => u.status === 'active').length,
      recentBookings: mockTickets.slice(0, 5),
      upcomingEvents: mockEvents
        .filter(e => e.status === 'published')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
      revenueByMonth: [
        { month: 'Jan', revenue: 12500 },
        { month: 'Feb', revenue: 18700 },
        { month: 'Mar', revenue: 15300 },
        { month: 'Apr', revenue: 22100 },
        { month: 'May', revenue: 19800 },
        { month: 'Jun', revenue: 25400 },
      ],
      ticketsByStatus: [
        { status: 'Confirmed', count: 45 },
        { status: 'Pending', count: 12 },
        { status: 'Used', count: 78 },
        { status: 'Cancelled', count: 5 },
      ],
    };
  },

  // Events
  async getEvents(filters?: FilterOptions): Promise<Event[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...mockEvents];
    
    if (filters?.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }
    if (filters?.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  },

  async getEvent(id: string): Promise<Event | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEvents.find(e => e.id === id) || null;
  },

  async createEvent(data: EventFormData): Promise<Event> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newEvent: Event = {
      id: `e${Date.now()}`,
      ...data,
      totalTickets: data.availableTickets,
      vendorId: 'v1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockEvents.push(newEvent);
    return newEvent;
  },

  async updateEvent(id: string, data: Partial<EventFormData>): Promise<Event> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockEvents.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');
    
    mockEvents[index] = {
      ...mockEvents[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockEvents[index];
  },

  async deleteEvent(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      mockEvents.splice(index, 1);
    }
  },

  // Tickets
  async getTickets(filters?: FilterOptions): Promise<Ticket[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...mockTickets];
    
    if (filters?.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    return filtered;
  },

  async updateTicketStatus(id: string, status: Ticket['status']): Promise<Ticket> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    
    ticket.status = status;
    return ticket;
  },

  // Users
  async getUsers(filters?: FilterOptions): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...mockUsers];
    
    if (filters?.status) {
      filtered = filtered.filter(u => u.status === filters.status);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  },

  async updateUserStatus(id: string, status: User['status']): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    
    user.status = status;
    return user;
  },

  // Vendors
  async getVendors(filters?: FilterOptions): Promise<Vendor[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...mockVendors];
    
    if (filters?.status) {
      filtered = filtered.filter(v => v.status === filters.status);
    }
    
    return filtered;
  },

  async updateVendorStatus(id: string, status: Vendor['status']): Promise<Vendor> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const vendor = mockVendors.find(v => v.id === id);
    if (!vendor) throw new Error('Vendor not found');
    
    vendor.status = status;
    return vendor;
  },

  // Payments
  async getPayments(filters?: FilterOptions): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...mockPayments];
    
    if (filters?.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    
    return filtered;
  },

  async refundPayment(id: string, amount: number): Promise<Payment> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const payment = mockPayments.find(p => p.id === id);
    if (!payment) throw new Error('Payment not found');
    
    payment.status = 'refunded';
    payment.refundAmount = amount;
    payment.refundDate = new Date().toISOString();
    
    return payment;
  },
};
