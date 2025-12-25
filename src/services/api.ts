/**
 * Base API Service
 * 
 * Central API client for all backend communication.
 * Handles authentication, error handling, and data transformation.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-metrika.vercel.app';

// ============== Types ==============

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}

// ============== Token Management ==============

const TOKEN_KEY = 'metrika-auth-token';

export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

// ============== Field Mapping ==============

/**
 * Maps backend _id to frontend id
 * Handles nested objects and arrays recursively
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapIdFields = <T>(data: any): T => {
    if (data === null || data === undefined) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => mapIdFields(item)) as T;
    }

    if (typeof data === 'object') {
        const result: Record<string, unknown> = {};

        for (const key of Object.keys(data)) {
            if (key === '_id') {
                result['id'] = data[key];
            } else if (key === 'isRead') {
                // Map isRead to read for notifications
                result['read'] = data[key];
            } else {
                result[key] = mapIdFields(data[key]);
            }
        }

        return result as T;
    }

    return data;
};

/**
 * Maps TaskStatus from backend (includes 'Blocked') to frontend
 * Maps 'Blocked' to 'In Progress' since frontend doesn't support it
 */
export const mapTaskStatus = (status: string): string => {
    if (status === 'Blocked') {
        return 'In Progress';
    }
    return status;
};

// ============== API Client ==============

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getHeaders(options?: RequestOptions): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (!options?.skipAuth) {
            const token = getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error: ApiError = {
                code: response.status.toString(),
                message: errorData.message || `HTTP Error: ${response.status}`,
                details: errorData,
            };
            throw error;
        }

        const data = await response.json();
        return mapIdFields<T>(data);
    }

    async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(options),
            ...options,
        });
        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(options),
            body: body ? JSON.stringify(body) : undefined,
            ...options,
        });
        return this.handleResponse<T>(response);
    }

    async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PATCH',
            headers: this.getHeaders(options),
            body: body ? JSON.stringify(body) : undefined,
            ...options,
        });
        return this.handleResponse<T>(response);
    }

    async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(options),
            ...options,
        });
        return this.handleResponse<T>(response);
    }

    // Special method for file uploads (multipart/form-data)
    async upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
        const token = getToken();
        const headers: HeadersInit = {};

        if (!options?.skipAuth && token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Don't set Content-Type for FormData, browser will set it with boundary

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
            ...options,
        });
        return this.handleResponse<T>(response);
    }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

// Export base URL for reference
export { API_BASE_URL };
