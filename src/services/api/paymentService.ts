// Payment Service API
// Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Response DTO interface
interface ResponseDTO<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Paginated Response
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Payment DTO
interface PaymentDTO {
  id: number;
  reservationId: number;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  transactionDate?: string;
  stripePaymentIntentId?: string;
}

// Create Stripe Payment Request
interface CreateStripePaymentRequest {
  reservationId: number;
  amount: number;
  currency: string;
}

// Payment History Query Parameters
interface PaymentHistoryQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

class PaymentServiceAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
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

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      // Check if response is JSON
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
        // Check for network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Network error. Please check your connection and API server.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Create Stripe Payment
   * POST /api/v1/payment/stripe/create
   * Authorization: Requires USER role
   */
  async createStripePayment(data: CreateStripePaymentRequest): Promise<ResponseDTO<PaymentDTO>> {
    return this.request<PaymentDTO>('/api/v1/payment/stripe/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Stripe Webhook
   * POST /api/v1/payment/stripe/webhook
   * Authorization: None (public endpoint for Stripe webhooks)
   * Note: This is typically called by Stripe, not from frontend
   */
  async stripeWebhook(
    payload: any,
    stripeSignature: string
  ): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/v1/payment/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': stripeSignature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Get Payment History
   * GET /api/v1/payment/payment-history
   * Authorization: Requires USER role
   */
  async getPaymentHistory(params?: PaymentHistoryQueryParams): Promise<ResponseDTO<PageResponse<PaymentDTO>>> {
    const queryParams: PaymentHistoryQueryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'id',
      direction: params?.direction ?? 'DESC',
    };
    return this.request<PageResponse<PaymentDTO>>(
      `/api/v1/payment/payment-history${this.buildQueryString(queryParams)}`,
      { method: 'GET' }
    );
  }
}

export const paymentServiceAPI = new PaymentServiceAPI();
export type { 
  ResponseDTO, 
  PageResponse, 
  PaymentDTO, 
  CreateStripePaymentRequest,
  PaymentHistoryQueryParams 
};

