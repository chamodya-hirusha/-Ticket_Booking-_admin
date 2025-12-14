// Reservation Service API
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

// Reservation DTO
interface ReservationDTO {
  id: number;
  eventId: number;
  userId: number;
  ticketType: string;
  ticketCount: number;
  status: string;
  qrToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Reservation Request DTO
interface ReservationRequestDTO {
  eventId: number;
  ticketType: string;
  ticketCount: number; // min: 1, max: 10
}

// QR Check-In Request DTO
interface QrCheckInRequestDTO {
  qrToken: string;
}

// Event Cancel Request DTO
interface EventCancelRequestDTO {
  eventId: number;
  ticketType: string;
  ticketCount: number;
}

// Query Parameters
interface ReservationQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

class ReservationServiceAPI {
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
        // Some endpoints return plain text messages
        const text = await response.text();
        if (response.ok) {
          // Success response with text message
          return {
            success: true,
            message: text,
            data: text as any,
          };
        } else {
          throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
        }
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
   * Create Reservation
   * POST /api/v1/reservation
   * Authorization: Requires USER role
   */
  async createReservation(data: ReservationRequestDTO): Promise<ResponseDTO<string>> {
    return this.request<string>('/api/v1/reservation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get User Reservations
   * GET /api/v1/reservation/user-reservations
   * Authorization: Requires USER role
   */
  async getUserReservations(params?: ReservationQueryParams): Promise<ResponseDTO<PageResponse<ReservationDTO>>> {
    const queryParams: ReservationQueryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'id',
      direction: params?.direction ?? 'DESC',
    };
    return this.request<PageResponse<ReservationDTO>>(
      `/api/v1/reservation/user-reservations${this.buildQueryString(queryParams)}`,
      { method: 'GET' }
    );
  }

  /**
   * Get Refund Available Reservations (Admin Only)
   * GET /api/v1/reservation/refund-available
   * Authorization: Requires ADMIN role
   */
  async getRefundAvailableReservations(params?: ReservationQueryParams): Promise<ResponseDTO<PageResponse<ReservationDTO>>> {
    const queryParams: ReservationQueryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'id',
      direction: params?.direction ?? 'DESC',
    };
    return this.request<PageResponse<ReservationDTO>>(
      `/api/v1/reservation/refund-available${this.buildQueryString(queryParams)}`,
      { method: 'GET' }
    );
  }

  /**
   * Check In (Vendor Only)
   * POST /api/v1/reservation/check-in
   * Authorization: Requires VENDOR role
   */
  async checkIn(data: QrCheckInRequestDTO): Promise<ResponseDTO<string>> {
    return this.request<string>('/api/v1/reservation/check-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Cancel Event (Admin Only)
   * POST /api/v1/reservation/event-cancel
   * Authorization: Requires ADMIN role
   */
  async cancelEvent(data: EventCancelRequestDTO): Promise<ResponseDTO<string>> {
    return this.request<string>('/api/v1/reservation/event-cancel', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const reservationServiceAPI = new ReservationServiceAPI();
export type { 
  ResponseDTO, 
  PageResponse, 
  ReservationDTO, 
  ReservationRequestDTO, 
  QrCheckInRequestDTO,
  EventCancelRequestDTO,
  ReservationQueryParams 
};

