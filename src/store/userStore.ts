import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import type { User } from '../types';

interface UserState {
    currentUser: User | null;
    users: User[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setCurrentUser: (user: User) => void;
    updateCurrentUser: (updates: Partial<User>) => void;
    addXP: (amount: number) => void;
    setUsers: (users: User[]) => void;
    addUser: (user: User) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
    getUserById: (id: string) => User | undefined;

    // API Actions
    fetchCurrentUser: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    fetchTeamMembers: (params?: { department?: string; search?: string; status?: string }) => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            users: [],
            isLoading: false,
            error: null,

            setCurrentUser: (user) => set({ currentUser: user }),

            updateCurrentUser: (updates) => set((state) => ({
                currentUser: state.currentUser
                    ? { ...state.currentUser, ...updates }
                    : null
            })),

            addXP: (amount) => set((state) => {
                if (!state.currentUser) return state;

                let newXP = state.currentUser.xp + amount;
                let newLevel = state.currentUser.level;
                let newXPToNextLevel = state.currentUser.xpToNextLevel;

                // Level up logic
                while (newXP >= newXPToNextLevel) {
                    newXP -= newXPToNextLevel;
                    newLevel++;
                    newXPToNextLevel = Math.floor(newXPToNextLevel * 1.2); // 20% increase per level
                }

                return {
                    currentUser: {
                        ...state.currentUser,
                        xp: newXP,
                        level: newLevel,
                        xpToNextLevel: newXPToNextLevel,
                    }
                };
            }),

            setUsers: (users) => set({ users }),

            addUser: (user) => set((state) => ({
                users: [...state.users, user]
            })),

            updateUser: (id, updates) => set((state) => ({
                users: state.users.map(user =>
                    user.id === id ? { ...user, ...updates } : user
                )
            })),

            getUserById: (id) => get().users.find(user => user.id === id),

            // API Actions
            fetchCurrentUser: async () => {
                set({ isLoading: true, error: null });
                try {
                    const user = await api.get<User>('/users/me');
                    set({ currentUser: user, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Kullanıcı bilgisi alınamadı';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            fetchUsers: async () => {
                set({ isLoading: true, error: null });
                try {
                    const users = await api.get<User[]>('/users');
                    set({ users, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Kullanıcılar alınamadı';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            fetchTeamMembers: async (params) => {
                set({ isLoading: true, error: null });
                try {
                    const queryParams = new URLSearchParams();
                    if (params?.department) queryParams.set('department', params.department);
                    if (params?.search) queryParams.set('search', params.search);
                    if (params?.status) queryParams.set('status', params.status);

                    const queryString = queryParams.toString();
                    const endpoint = `/team/members${queryString ? `?${queryString}` : ''}`;

                    const users = await api.get<User[]>(endpoint);
                    set({ users, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Ekip üyeleri alınamadı';
                    set({ error: errorMessage, isLoading: false });
                }
            },
        }),
        {
            name: 'metrika-user-storage',
            partialize: (state) => ({
                currentUser: state.currentUser,
                // Don't persist users array - always fetch fresh from API
            }),
        }
    )
);
