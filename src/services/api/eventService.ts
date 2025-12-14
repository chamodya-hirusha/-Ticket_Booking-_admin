// Event Service API
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

// Event DTO from backend
interface EventDTO {
  id: number;
  name: string;
  slug: string;
  description: string;
  location: string;
  date: string; // LocalDate format: YYYY-MM-DD
  startTime: string; // Time format
  vipTicketLimit: number;
  premiumTicketLimit: number;
  generalTicketLimit: number;
  vipTicketPrice: number;
  premiumTicketPrice: number;
  generalTicketPrice: number;
  eventCategory: string;
  eventStatus: string;
  createdAt?: string;
  updatedAt?: string;
  vendorId?: number;
  imageUrl?: string;
}

// Event Query Parameters
interface EventQueryParams {
  id?: number;
  category?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
  text?: string;
  location?: string;
  start?: string; // LocalDate format: YYYY-MM-DD
  end?: string; // LocalDate format: YYYY-MM-DD
}

// Create/Update Event Request
interface EventRequest {
  name: string;
  slug: string;
  description: string;
  location: string;
  date: string; // LocalDate format: YYYY-MM-DD
  startTime: string; // Time format
  vipTicketLimit: number;
  premiumTicketLimit: number;
  generalTicketLimit: number;
  vipTicketPrice: number;
  premiumTicketPrice: number;
  generalTicketPrice: number;
  eventCategory: string;
  eventStatus: string;
}

// Cancel/Postpone Event Request
interface EventActionRequest {
  eventId: number;
  reason: string;
}

class EventServiceAPI {
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

  // Public Event APIs

  /**
   * Get Event by ID
   * GET /api/v1/public/event?id={id}
   */
  async getEventById(id: number): Promise<ResponseDTO<EventDTO>> {
    return this.request<EventDTO>(`/api/v1/public/event${this.buildQueryString({ id })}`, {
      method: 'GET',
    });
  }

  /**
   * Get All Events
   * GET /api/v1/public/event/get-all
   */
  async getAllEvents(params?: EventQueryParams): Promise<ResponseDTO<PageResponse<EventDTO>>> {
    const queryParams: EventQueryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'date',
      direction: params?.direction ?? 'DESC',
      ...(params?.category && { category: params.category }),
    };
    return this.request<PageResponse<EventDTO>>(
      `/api/v1/public/event/get-all${this.buildQueryString(queryParams)}`,
      { method: 'GET' }
    );
  }

  /**
   * Get Scheduled Events
   * GET /api/v1/public/event/scheduled
   */
  async getScheduledEvents(params?: EventQueryParams): Promise<ResponseDTO<PageResponse<EventDTO>>> {
    const queryParams: EventQueryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'date',
      direction: params?.direction ?? 'DESC',
    };
    return this.request<PageResponse<EventDTO>>(
      `/api/v1/public/event/scheduled${this.buildQueryString(queryParams)}`,
      { method: 'GET' }
    );
  }

  /**
   * Search Events
   * GET /api/v1/public/event/search
   */
  async searchEvents(params?: EventQueryParams): Promise<ResponseDTO<PageResponse<EventDTO>>> {
    const queryParams: EventQueryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'date',
      direction: params?.direction ?? 'DESC',
      ...(params?.text && { text: params.text }),
      ...(params?.category && { category: params.category }),
      ...(params?.location && { location: params.location }),
    };
    return this.request<PageResponse<EventDTO>>(
      `/api/v1/public/event/search${this.buildQueryString(queryParams)}`,
      { method: 'GET' }
    );
  }

  /**
   * Advanced Search Events
   * GET /api/v1/public/event/advanced-search
   */
  async advancedSearchEvents(params?: EventQueryParams): Promise<ResponseDTO<PageResponse<EventDTO>>> {
    const queryParams: EventQueryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'date',
      direction: params?.direction ?? 'DESC',
      ...(params?.text && { text: params.text }),
      ...(params?.category && { category: params.category }),
      ...(params?.location && { location: params.location }),
      ...(params?.start && { start: params.start }),
      ...(params?.end && { end: params.end }),
    };
    return this.request<PageResponse<EventDTO>>(
      `/api/v1/public/event/advanced-search${this.buildQueryString(queryParams)}`,
      { method: 'GET' }
    );
  }

  /**
   * Health Check
   * GET /api/v1/public/event/health
   */
  async healthCheck(): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/v1/public/event/health`);
    return response.text();
  }

  // Secure Event APIs (Require Authentication)

  /**
   * Create Event
   * POST /api/v1/event
   * Authorization: Requires VENDOR role
   */
  async createEvent(data: EventRequest): Promise<ResponseDTO<EventDTO>> {
    return this.request<EventDTO>('/api/v1/event', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get Vendor Events
   * GET /api/v1/event/vendor-events
   * Authorization: Requires VENDOR role
   */
  async getVendorEvents(params?: EventQueryParams): Promise<ResponseDTO<PageResponse<EventDTO>>> {
    const queryParams: EventQueryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'date',
      direction: params?.direction ?? 'DESC',
    };
    return this.request<PageResponse<EventDTO>>(
      `/api/v1/event/vendor-events${this.buildQueryString(queryParams)}`,
      { method: 'GET' }
    );
  }

  /**
   * Get Cancel Requested Events
   * GET /api/v1/event/get-cancel-event-rquest
   * Authorization: Requires ADMIN role
   */
  async getCancelRequestedEvents(params?: EventQueryParams): Promise<ResponseDTO<PageResponse<EventDTO>>> {
    const queryParams: EventQueryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'date',
      direction: params?.direction ?? 'DESC',
    };
    return this.request<PageResponse<EventDTO>>(
      `/api/v1/event/get-cancel-event-rquest${this.buildQueryString(queryParams)}`,
      { method: 'GET' }
    );
  }

  /**
   * Get Postpone Requested Events
   * GET /api/v1/event/get-postpone-event-rquest
   * Authorization: Requires ADMIN role
   */
  async getPostponeRequestedEvents(params?: EventQueryParams): Promise<ResponseDTO<PageResponse<EventDTO>>> {
    const queryParams: EventQueryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'date',
      direction: params?.direction ?? 'DESC',
    };
    return this.request<PageResponse<EventDTO>>(
      `/api/v1/event/get-postpone-event-rquest${this.buildQueryString(queryParams)}`,
      { method: 'GET' }
    );
  }

  /**
   * Request for Cancel Event
   * PUT /api/v1/event/cancel-event-request
   * Authorization: Requires VENDOR role
   */
  async requestCancelEvent(data: EventActionRequest): Promise<ResponseDTO> {
    return this.request('/api/v1/event/cancel-event-request', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Request for Postpone Event
   * PUT /api/v1/event/postpone-event-request
   * Authorization: Requires VENDOR role
   */
  async requestPostponeEvent(data: EventActionRequest): Promise<ResponseDTO> {
    return this.request('/api/v1/event/postpone-event-request', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update Event
   * PUT /api/v1/event?id={id}
   * Authorization: Requires VENDOR or ADMIN role
   */
  async updateEvent(id: number, data: EventRequest): Promise<ResponseDTO<EventDTO>> {
    return this.request<EventDTO>(`/api/v1/event${this.buildQueryString({ id })}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Publish Event
   * PUT /api/v1/event/publish?id={id}
   * Authorization: Requires ADMIN role
   */
  async publishEvent(id: number): Promise<ResponseDTO<EventDTO>> {
    return this.request<EventDTO>(`/api/v1/event/publish${this.buildQueryString({ id })}`, {
      method: 'PUT',
    });
  }

  /**
   * Health Check (Secure)
   * GET /api/v1/event/health
   */
  async secureHealthCheck(): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/v1/event/health`);
    return response.text();
  }
}

export const eventServiceAPI = new EventServiceAPI();
export type { 
  ResponseDTO, 
  PageResponse, 
  EventDTO, 
  EventQueryParams, 
  EventRequest, 
  EventActionRequest 
};

