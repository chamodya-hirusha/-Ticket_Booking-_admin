// Payment Service API
// Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Import toast for error notifications
import { toast } from 'sonner@2.0.3';

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
      // Payment APIs require Authorization in your backend (401: Missing Authorization Header)
      // Use the same admin token that the admin panel stores after login
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const url = `${this.baseURL}${endpoint}`;
      console.log(`Payment API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`Payment API Response: ${response.status} ${response.statusText}`);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let rawData: any;

      if (contentType && contentType.includes('application/json')) {
        try {
          rawData = await response.json();
          console.log('Payment API Response data:', rawData);
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          toast.error('Invalid response format from server');
          return {
            success: false,
            message: 'Invalid response format from server',
            error: 'Invalid response format from server',
          } as ResponseDTO<T>;
        }
      } else {
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        const errorMsg = text || `HTTP ${response.status}: ${response.statusText}`;
        toast.error(errorMsg);
        return {
          success: false,
          message: errorMsg,
          error: errorMsg,
        } as ResponseDTO<T>;
      }

      // Handle actual API response structure: { code: "00", content: {...}, message: "..." }
      // Convert it to ResponseDTO format for compatibility
      let data: ResponseDTO<T>;
      if ((rawData as any).content !== undefined) {
        data = {
          success: (rawData as any).code === '00' || response.ok,
          message: (rawData as any).message || '',
          data: (rawData as any).content as T,
          error: (rawData as any).code !== '00' ? (rawData as any).message : undefined,
        };
        console.log('Converted payment API response to ResponseDTO format');
      } else {
        data = rawData as ResponseDTO<T>;
      }

      if (!response.ok || data.success === false) {
        const errorMsg = data.message || data.error || `Request failed with status ${response.status}`;
        console.error('Payment API request failed:', errorMsg);
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
        // Check for network errors
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
      const errorMsg = text || `HTTP ${response.status}: ${response.statusText}`;
      toast.error(errorMsg);
      throw new Error(errorMsg);
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

