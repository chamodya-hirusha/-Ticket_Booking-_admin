// User Service API
// Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
      return await this.request<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      // Re-throw with more context
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  }

  async register(data: {
    name: string;
    password: string;
    email: string;
    phone: string;
  }): Promise<ResponseDTO> {
    return this.request('/api/v1/auth/register', {
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
    return this.request<LoginResponse>('/api/v1/auth/vendor/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
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
}

export const userServiceAPI = new UserServiceAPI();
export type { ResponseDTO, LoginResponse, UserDTO };

