// Admin Types and Interfaces

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  imageUrl: string;
  category: string;
  availableTickets: number;
  totalTickets: number;
  status: 'draft' | 'published' | 'cancelled';
  vendorId: string;
  createdAt: string;
  updatedAt: string;
  // Optional tiered ticket information (mirrors backend event DTO)
  vipTicketLimit?: number;
  premiumTicketLimit?: number;
  generalTicketLimit?: number;
  vipTicketPrice?: number;
  premiumTicketPrice?: number;
  generalTicketPrice?: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  purchaseDate: string;
  status: 'pending' | 'confirmed' | 'used' | 'cancelled' | 'refunded';
  quantity: number;
  totalPrice: number;
  bookingReference: string;
  paymentId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'vendor' | 'admin';
  createdAt: string;
  totalBookings: number;
  totalSpent: number;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  companyName: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  totalEvents: number;
  totalRevenue: number;
  createdAt: string;
  phone: string;
}

export interface Payment {
  id: string;
  ticketId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  transactionDate: string;
  refundAmount?: number;
  refundDate?: string;
}

export interface AdminStats {
  totalEvents: number;
  ticketsSold: number;
  totalRevenue: number;
  activeUsers: number;
  recentBookings: Ticket[];
  upcomingEvents: Event[];
  revenueByMonth: { month: string; revenue: number }[];
  ticketsByStatus: { status: string; count: number }[];
}

export interface EventFormData {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  category: string;
  status: 'draft' | 'published' | 'cancelled';
  // Legacy single-tier fields (mapped to general ticket tier)
  price: number;
  availableTickets: number;
  // New tiered ticket fields to match backend /api/v1/event request
  vipTicketLimit: number;
  premiumTicketLimit: number;
  generalTicketLimit: number;
  vipTicketPrice: number;
  premiumTicketPrice: number;
  generalTicketPrice: number;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
