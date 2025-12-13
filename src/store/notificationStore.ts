import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '../types';

interface NotificationState {
    notifications: Notification[];

    // Actions
    addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAllNotifications: () => void;
    getUnreadCount: () => number;
}

// Initial mock notifications
const initialNotifications: Notification[] = [
    {
        id: '1',
        type: 'xp',
        title: 'XP Kazanma',
        message: 'Tebrikler! "YZ Rapor Analizi" görevini tamamlayarak +250 XP kazandınız.',
        time: new Date().toISOString(),
        read: false,
        actionUrl: '/',
    },
    {
        id: '2',
        type: 'warning',
        title: 'Metodoloji Uyum Uyarısı',
        message: '"Yazılım Geliştirme" projesinde Scrum metodolojisine uygun olmayan bir görev akışı tespit edildi.',
        time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        read: false,
    },
    {
        id: '3',
        type: 'badge',
        title: 'Başarı Rozeti Kazandınız!',
        message: 'Tebrikler! "Sprint Ustası" rozetini kazandınız.',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/gamification',
    },
    {
        id: '4',
        type: 'info',
        title: 'YZ Bağlamsal Uyarısı',
        message: 'Yapay zeka asistanınız, "Finansal Analiz" projesinde risk tespit etti. Tahmin edilen bütçe sapması: 15%',
        time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/documents/analysis',
    },
    {
        id: '5',
        type: 'meeting',
        title: 'Toplantı Hatırlatması',
        message: '"Sprint Değerlendirme" toplantısı 15 dakika içinde başlayacak.',
        time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: true,
    },
    {
        id: '6',
        type: 'task',
        title: 'Görev Tamamlandı',
        message: 'Emre Yılmaz, "Kullanıcı Arayüzü Tasarımı" görevini başarıyla tamamladı.',
        time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: true,
    },
];

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: initialNotifications,

            addNotification: (notificationData) => {
                const newNotification: Notification = {
                    ...notificationData,
                    id: crypto.randomUUID(),
                    time: new Date().toISOString(),
                    read: false,
                };

                set((state) => ({
                    notifications: [newNotification, ...state.notifications]
                }));
            },

            markAsRead: (id) => set((state) => ({
                notifications: state.notifications.map(notification =>
                    notification.id === id
                        ? { ...notification, read: true }
                        : notification
                )
            })),

            markAllAsRead: () => set((state) => ({
                notifications: state.notifications.map(notification => ({
                    ...notification,
                    read: true
                }))
            })),

            deleteNotification: (id) => set((state) => ({
                notifications: state.notifications.filter(notification => notification.id !== id)
            })),

            clearAllNotifications: () => set({ notifications: [] }),

            getUnreadCount: () => get().notifications.filter(n => !n.read).length,
        }),
        {
            name: 'metrika-notification-storage',
        }
    )
);
