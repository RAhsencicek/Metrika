import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import type { Notification } from '../types';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;

    // Actions
    addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAllNotifications: () => void;
    getUnreadCount: () => number;

    // API Actions
    fetchNotifications: (params?: { isRead?: boolean; type?: string }) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            isLoading: false,
            error: null,

            addNotification: (notificationData) => {
                const newNotification: Notification = {
                    ...notificationData,
                    id: crypto.randomUUID(),
                    time: new Date().toISOString(),
                    read: false,
                };

                set((state) => ({
                    notifications: [newNotification, ...state.notifications],
                    unreadCount: state.unreadCount + 1,
                }));
            },

            markAsRead: async (id) => {
                try {
                    await api.patch(`/notifications/${id}/read`);
                    set((state) => ({
                        notifications: state.notifications.map(notification =>
                            notification.id === id
                                ? { ...notification, read: true }
                                : notification
                        ),
                        unreadCount: Math.max(0, state.unreadCount - 1),
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Bildirim güncellenemedi';
                    set({ error: errorMessage });
                }
            },

            markAllAsRead: async () => {
                try {
                    await api.patch('/notifications/read-all');
                    set((state) => ({
                        notifications: state.notifications.map(notification => ({
                            ...notification,
                            read: true
                        })),
                        unreadCount: 0,
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Bildirimler güncellenemedi';
                    set({ error: errorMessage });
                }
            },

            deleteNotification: async (id) => {
                try {
                    await api.delete(`/notifications/${id}`);
                    set((state) => {
                        const notification = state.notifications.find(n => n.id === id);
                        const wasUnread = notification && !notification.read;
                        return {
                            notifications: state.notifications.filter(n => n.id !== id),
                            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
                        };
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Bildirim silinemedi';
                    set({ error: errorMessage });
                }
            },

            clearAllNotifications: () => set({ notifications: [], unreadCount: 0 }),

            getUnreadCount: () => get().unreadCount,

            // API Actions
            fetchNotifications: async (params) => {
                set({ isLoading: true, error: null });
                try {
                    const queryParams = new URLSearchParams();
                    if (params?.isRead !== undefined) queryParams.set('isRead', String(params.isRead));
                    if (params?.type) queryParams.set('type', params.type);

                    const queryString = queryParams.toString();
                    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;

                    const notifications = await api.get<Notification[]>(endpoint);
                    const unreadCount = notifications.filter(n => !n.read).length;
                    set({ notifications, unreadCount, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Bildirimler alınamadı';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            fetchUnreadCount: async () => {
                try {
                    const response = await api.get<{ count: number }>('/notifications/unread-count');
                    set({ unreadCount: response.count });
                } catch (error) {
                    // Silently fail - unread count is not critical
                    console.error('Failed to fetch unread count:', error);
                }
            },
        }),
        {
            name: 'metrika-notification-storage',
        }
    )
);
