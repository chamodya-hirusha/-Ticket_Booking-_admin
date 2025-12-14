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
  price: number;
  imageUrl: string;
  category: string;
  availableTickets: number;
  status: 'draft' | 'published' | 'cancelled';
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
