const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5147/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    token?: string, 
    apiKey?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (apiKey) {
      headers['Api-Key'] = apiKey;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Debes iniciar sesión con tu cuenta de Google para agendar y confirmar la reserva.');
      }

      const errorJson = await response.json().catch(() => ({ message: null }));
      const errorMessage = errorJson?.message || errorJson?.error || `Error en el servidor backend (Código HTTP ${response.status})`;
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  async get<T>(endpoint: string, options?: RequestInit, token?: string, apiKey?: string): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' }, token, apiKey);
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit, token?: string, apiKey?: string): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }, token, apiKey);
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit, token?: string, apiKey?: string): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }, token, apiKey);
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit, token?: string, apiKey?: string): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }, token, apiKey);
  }

  async delete<T>(endpoint: string, options?: RequestInit, token?: string, apiKey?: string): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' }, token, apiKey);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
