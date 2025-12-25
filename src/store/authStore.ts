import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setToken, removeToken, getToken } from '../services/api';
import type { User } from '../types';

// ============== Types ==============

interface LoginResponse {
    id: string;
    name: string;
    email: string;
    role: string;
    level: number;
    xp: number;
    token: string;
}

interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

// ============== Store State ==============

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: getToken(),
            user: null,
            isAuthenticated: !!getToken(),
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await api.post<LoginResponse>('/auth/login', { email, password }, { skipAuth: true });

                    // Store token
                    setToken(response.token);

                    // Map response to User type
                    const user: User = {
                        id: response.id,
                        name: response.name,
                        email: response.email,
                        role: response.role,
                        level: response.level || 1,
                        xp: response.xp || 0,
                        xpToNextLevel: 1000, // Default, will be fetched from profile
                        avatar: 64, // Default avatar
                        department: '',
                        location: '',
                        status: 'online',
                        joinDate: new Date().toISOString(),
                    };

                    set({
                        token: response.token,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Giriş başarısız';
                    set({
                        isLoading: false,
                        error: errorMessage,
                        isAuthenticated: false,
                        token: null,
                        user: null,
                    });
                    throw error;
                }
            },

            register: async (name: string, email: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
                    const request: RegisterRequest = { name, email, password };
                    const response = await api.post<LoginResponse>('/auth/register', request, { skipAuth: true });

                    // Store token
                    setToken(response.token);

                    // Map response to User type
                    const user: User = {
                        id: response.id,
                        name: response.name,
                        email: response.email,
                        role: response.role || 'User',
                        level: 1,
                        xp: 0,
                        xpToNextLevel: 1000,
                        avatar: 64,
                        department: '',
                        location: '',
                        status: 'online',
                        joinDate: new Date().toISOString(),
                    };

                    set({
                        token: response.token,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Kayıt başarısız';
                    set({
                        isLoading: false,
                        error: errorMessage,
                    });
                    throw error;
                }
            },

            logout: () => {
                removeToken();
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            checkAuth: async () => {
                const token = getToken();

                if (!token) {
                    set({ isAuthenticated: false, user: null, token: null });
                    return;
                }

                set({ isLoading: true });

                try {
                    // Fetch current user profile
                    const userProfile = await api.get<User>('/users/me');

                    set({
                        user: userProfile,
                        isAuthenticated: true,
                        isLoading: false,
                        token,
                    });
                } catch (error) {
                    // Token is invalid or expired
                    removeToken();
                    set({
                        token: null,
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'metrika-auth-storage',
            partialize: (state) => ({
                // Only persist token, user will be fetched on checkAuth
                token: state.token,
            }),
        }
    )
);
