// User Service API
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

// Login Response
interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
  };
}

// User DTO
interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

class UserServiceAPI {
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
      console.log(`API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`API Response: ${response.status} ${response.statusText}`);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data: ResponseDTO<T>;

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log('Response data:', { success: data.success, hasData: !!data.data, message: data.message });
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

      if (!response.ok) {
        const errorMsg = data.message || data.error || `Request failed with status ${response.status}`;
        console.error('API request failed:', errorMsg);
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
        // Show toast for other errors
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

  // Auth APIs
  async login(email: string, password: string): Promise<ResponseDTO<LoginResponse>> {
    return this.request<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Admin Login - uses general login endpoint (backend should handle admin role)
  async adminLogin(email: string, password: string): Promise<ResponseDTO<LoginResponse>> {
    try {
      console.log('Calling adminLogin API endpoint');
      const response = await this.request<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      console.log('adminLogin API call successful');
      return response;
    } catch (error) {
      console.error('adminLogin API call failed:', error);
      // Show toast with appropriate message
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          toast.error('Invalid email or password');
          return {
            success: false,
            message: 'Invalid email or password',
            error: 'Invalid email or password',
          } as ResponseDTO<LoginResponse>;
        }
        toast.error(error.message || 'Login failed. Please try again.');
        return {
          success: false,
          message: error.message || 'Login failed. Please try again.',
          error: error.message || 'Login failed. Please try again.',
        } as ResponseDTO<LoginResponse>;
      }
      toast.error('Login failed. Please try again.');
      return {
        success: false,
        message: 'Login failed. Please try again.',
        error: 'Login failed. Please try again.',
      } as ResponseDTO<LoginResponse>;
    }
  }

  async register(data: {
    name: string;
    email: string;
    phone: string;
  }): Promise<ResponseDTO<LoginResponse>> {
    return this.request<LoginResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async userLogin(email: string, password: string): Promise<ResponseDTO<LoginResponse>> {
    return this.request<LoginResponse>('/api/v1/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // User APIs
  async getCurrentUser(): Promise<ResponseDTO<UserDTO>> {
    return this.request<UserDTO>('/api/v1/user', {
      method: 'GET',
    });
  }

  async completeProfile(mobile: string): Promise<ResponseDTO> {
    return this.request('/api/v1/user/complete-profile', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  }

  async verifyAccount(email: string, otp: string): Promise<ResponseDTO> {
    return this.request('/api/v1/auth/verify-account', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async resendVerify(email: string): Promise<ResponseDTO> {
    return this.request('/api/v1/auth/resend-verify', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string): Promise<ResponseDTO> {
    return this.request('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, password: string, otp: string): Promise<ResponseDTO> {
    return this.request('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, password, otp }),
    });
  }

  async vendorLogin(email: string, password: string): Promise<ResponseDTO<LoginResponse>> {
    const response = await this.request<LoginResponse>('/api/v1/auth/vendor/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store vendor token if login successful
    if (response.success && response.data?.token) {
      localStorage.setItem('vendorToken', response.data.token);
    }
    
    return response;
  }

  async vendorRegister(data: {
    name: string;
    password: string;
    email: string;
    phone: string;
    website: string;
  }): Promise<ResponseDTO> {
    return this.request('/api/v1/auth/vendor/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async healthCheck(): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/v1/user/health`);
    return response.text();
  }

  // Vendor token management
  getVendorToken(): string | null {
    return localStorage.getItem('vendorToken');
  }

  setVendorToken(token: string): void {
    localStorage.setItem('vendorToken', token);
  }

  clearVendorToken(): void {
    localStorage.removeItem('vendorToken');
  }

  isVendorLoggedIn(): boolean {
    return !!this.getVendorToken();
  }
}

export const userServiceAPI = new UserServiceAPI();
export type { ResponseDTO, LoginResponse, UserDTO };

