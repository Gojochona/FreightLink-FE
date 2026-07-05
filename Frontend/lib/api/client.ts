/**
 * Base API Client
 * Handles authentication, request/response, and error handling
 */

import { ApiErrorClass } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get authorization token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  /**
   * Set authorization tokens
   */
  static setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  /**
   * Clear authorization tokens
   */
  static clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  /**
   * Build headers with authentication
   */
  private getHeaders(customHeaders: HeadersInit = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge custom headers
    if (customHeaders && typeof customHeaders === 'object') {
      Object.entries(customHeaders).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      });
    }

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Generic request method
   */
  async request<T>(
    endpoint: string,
    options: RequestInit & { skipContentType?: boolean } = {}
  ): Promise<T> {
    const { skipContentType = false, ...requestOptions } = options;
    const url = `${this.baseURL}${endpoint}`;

    // Don't set Content-Type for FormData
    const headers = skipContentType
      ? { ...this.getHeaders(requestOptions.headers as HeadersInit) }
      : this.getHeaders(requestOptions.headers as HeadersInit);

    if (requestOptions.body instanceof FormData) {
      delete (headers as any)['Content-Type'];
    }

    try {
      const response = await fetch(url, {
        ...requestOptions,
        headers,
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request
          return this.request<T>(endpoint, { ...options, skipContentType });
        }
        ApiClient.clearTokens();
        // Redirect to login if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new ApiErrorClass('Unauthorized', 401);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiErrorClass(
          error.detail || error.message || 'Request failed',
          response.status,
          error
        );
      }

      // Return empty object for 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error;
      }
      throw new ApiErrorClass(
        error instanceof Error ? error.message : 'Unknown error',
        0
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit & { skipContentType?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshToken(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/api/v1/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.access) {
        ApiClient.setTokens(data.access, refreshToken);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
