// Reservation Service API
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

// Ticket statistics for an event
interface TicketTypeStats {
  sold: number;
  scanned: number;
  total: number;
}

interface TicketStatsDTO {
  vip: TicketTypeStats;
  premium: TicketTypeStats;
  general: TicketTypeStats;
  latestScans: any[];
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

      const url = `${this.baseURL}${endpoint}`;
      console.log(`Reservation API Request: ${options.method || 'GET'} ${url}`);
      console.log(`Token present: ${!!token}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`Reservation API Response: ${response.status} ${response.statusText}`);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let rawData: any;

      if (contentType && contentType.includes('application/json')) {
        try {
          rawData = await response.json();
          console.log('Reservation API Response data:', rawData);
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
        // Some endpoints return plain text messages
        const text = await response.text();
        console.log('Non-JSON response received:', text);
        if (response.ok) {
          // Success response with text message
          return {
            success: true,
            message: text,
            data: text as any,
          };
        } else {
          const errorMsg = text || `HTTP ${response.status}: ${response.statusText}`;
          toast.error(errorMsg);
          return {
            success: false,
            message: errorMsg,
            error: errorMsg,
          } as ResponseDTO<T>;
        }
      }

      // Handle actual API response structure: { code: "00", content: {...}, message: "..." }
      // Convert it to ResponseDTO format for compatibility
      let data: ResponseDTO<T>;

      if ((rawData as any).content !== undefined) {
        // Actual API structure - convert to ResponseDTO
        data = {
          success: (rawData as any).code === '00' || response.ok,
          message: (rawData as any).message || '',
          data: (rawData as any).content as T,
          error: (rawData as any).code !== '00' ? (rawData as any).message : undefined,
        };
        console.log('Converted API response to ResponseDTO format');
      } else {
        // Standard ResponseDTO structure
        data = rawData as ResponseDTO<T>;
      }

      if (!response.ok) {
        const errorMsg = data.message || data.error || `Request failed with status ${response.status}`;
        console.error('Reservation API request failed:', errorMsg);
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
          console.error('Network error detected');
          const networkError = 'Network error. Please check your connection and API server.';
          toast.error(networkError);
          return {
            success: false,
            message: networkError,
            error: networkError,
          } as ResponseDTO<T>;
        }
        console.error('Reservation API error:', error.message);
        toast.error(error.message || 'An error occurred');
        return {
          success: false,
          message: error.message || 'An error occurred',
          error: error.message || 'An error occurred',
        } as ResponseDTO<T>;
      }
      console.error('Unexpected error type:', error);
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
   * Get All Reservations (Admin Only)
   * GET /api/v1/reservation/all
   * Authorization: Requires ADMIN role
   */
  async getAllReservations(params?: ReservationQueryParams): Promise<ResponseDTO<PageResponse<ReservationDTO>>> {
    const queryParams: ReservationQueryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'id',
      direction: params?.direction ?? 'DESC',
    };
    return this.request<PageResponse<ReservationDTO>>(
      `/api/v1/reservation/all${this.buildQueryString(queryParams)}`,
      { method: 'GET' }
    );
  }

  /**
   * Get Ticket Statistics for an Event
   * GET /api/v1/reservation/stats/{eventId}
   * Authorization: Requires authentication
   */
  async getTicketStats(eventId: number): Promise<ResponseDTO<TicketStatsDTO>> {
    return this.request<TicketStatsDTO>(`/api/v1/reservation/stats/${eventId}`, {
      method: 'GET',
    });
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
  ReservationQueryParams,
  TicketStatsDTO,
  TicketTypeStats,
};

