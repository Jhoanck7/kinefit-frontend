import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5147/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Fallback para llamadas del panel que no pasan un token explícito
  // (el flujo público de reserva del paciente siempre pasa el suyo,
  // así que nunca llega a depender de esto).
  private async getPanelSessionToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    const session = await getSession();
    return session?.accessToken ?? null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    data?: unknown,
    token?: string,
    apiKey?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    const resolvedToken = token || (await this.getPanelSessionToken());
    if (resolvedToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${resolvedToken}`;
    }

    if (apiKey) {
      headers['Api-Key'] = apiKey;
    }

    const body = isFormData
      ? (data as FormData)
      : data !== undefined
        ? JSON.stringify(data)
        : undefined;

    const response = await fetch(url, { ...options, headers, body });

    if (!response.ok) {
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
    return this.request<T>(endpoint, { ...options, method: 'GET' }, undefined, token, apiKey);
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit, token?: string, apiKey?: string): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST' }, data, token, apiKey);
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit, token?: string, apiKey?: string): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT' }, data, token, apiKey);
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit, token?: string, apiKey?: string): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH' }, data, token, apiKey);
  }

  async delete<T>(endpoint: string, options?: RequestInit, token?: string, apiKey?: string): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' }, undefined, token, apiKey);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
