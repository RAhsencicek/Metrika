import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus } from '../types';

interface TaskState {
    tasks: Task[];

    // Actions
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    getTaskById: (id: string) => Task | undefined;
    getTasksByProject: (projectId: string) => Task[];
    getTasksByAssignee: (assigneeId: string) => Task[];
    getTasksByStatus: (status: TaskStatus) => Task[];
    updateTaskStatus: (id: string, status: TaskStatus) => void;
    logHours: (id: string, hours: number) => void;
}

// Initial mock tasks - with current dates for calendar visibility
const initialTasks: Task[] = [
    {
        id: '1',
        title: 'API Dokümantasyonu Hazırlama',
        description: 'Tüm API endpointleri için Swagger dokümantasyonu oluşturulacak.',
        status: 'In Progress',
        priority: 'High',
        projectId: '1',
        assigneeId: '2',
        dueDate: '2025-12-16',
        tags: ['Backend', 'Dokümantasyon'],
        estimatedHours: 16,
        loggedHours: 10,
        createdAt: '2025-12-01',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'Tasarım Revizyonu',
        description: 'Ana sayfa ve ürün detay sayfası tasarımlarının güncellenmesi.',
        status: 'Review',
        priority: 'Medium',
        projectId: '1',
        assigneeId: '5',
        dueDate: '2025-12-18',
        tags: ['UI/UX', 'Tasarım'],
        estimatedHours: 24,
        loggedHours: 20,
        createdAt: '2025-11-28',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        title: 'Push Notification Entegrasyonu',
        description: 'Firebase ile mobil bildirim sistemi kurulumu.',
        status: 'Todo',
        priority: 'High',
        projectId: '2',
        assigneeId: '3',
        dueDate: '2025-12-20',
        tags: ['Mobile', 'Firebase'],
        estimatedHours: 20,
        loggedHours: 0,
        createdAt: '2025-12-05',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '4',
        title: 'Veritabanı İndeks Optimizasyonu',
        description: 'Yavaş sorguların analizi ve indeks iyileştirmeleri.',
        status: 'In Progress',
        priority: 'Urgent',
        projectId: '4',
        assigneeId: '4',
        dueDate: '2025-12-15',
        tags: ['Database', 'Performance'],
        estimatedHours: 12,
        loggedHours: 8,
        createdAt: '2025-12-02',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '5',
        title: 'Kullanıcı Kabul Testleri',
        description: 'Son sprint için UAT senaryolarının hazırlanması ve uygulanması.',
        status: 'Todo',
        priority: 'Medium',
        projectId: '1',
        assigneeId: '6',
        dueDate: '2025-12-25',
        tags: ['QA', 'Test'],
        estimatedHours: 32,
        loggedHours: 0,
        createdAt: '2025-12-08',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '6',
        title: 'Ödeme Sistemi Entegrasyonu',
        description: 'iyzico ve PayTR entegrasyonlarının tamamlanması.',
        status: 'Done',
        priority: 'High',
        projectId: '1',
        assigneeId: '2',
        dueDate: '2025-12-10',
        tags: ['Backend', 'Payment'],
        estimatedHours: 40,
        loggedHours: 38,
        createdAt: '2025-11-15',
        updatedAt: '2025-12-10',
    },
    {
        id: '7',
        title: 'Responsive Düzenlemeler',
        description: 'Mobil ve tablet görünümlerinin iyileştirilmesi.',
        status: 'Review',
        priority: 'Low',
        projectId: '6',
        assigneeId: '5',
        dueDate: '2025-12-22',
        tags: ['Frontend', 'CSS'],
        estimatedHours: 16,
        loggedHours: 14,
        createdAt: '2025-12-04',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '8',
        title: 'Login/Register Akışı',
        description: 'Kullanıcı giriş ve kayıt işlemleri için yeni akış tasarımı.',
        status: 'Done',
        priority: 'Medium',
        projectId: '2',
        assigneeId: '3',
        dueDate: '2025-12-08',
        tags: ['Mobile', 'Auth'],
        estimatedHours: 24,
        loggedHours: 22,
        createdAt: '2025-11-20',
        updatedAt: '2025-12-08',
    },
];

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: initialTasks,

            setTasks: (tasks) => set({ tasks }),

            addTask: (taskData) => {
                const newTask: Task = {
                    ...taskData,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                set((state) => ({
                    tasks: [...state.tasks, newTask]
                }));

                return newTask;
            },

            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map(task =>
                    task.id === id
                        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                        : task
                )
            })),

            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter(task => task.id !== id)
            })),

            getTaskById: (id) => get().tasks.find(task => task.id === id),

            getTasksByProject: (projectId) => get().tasks.filter(task => task.projectId === projectId),

            getTasksByAssignee: (assigneeId) => get().tasks.filter(task => task.assigneeId === assigneeId),

            getTasksByStatus: (status) => get().tasks.filter(task => task.status === status),

            updateTaskStatus: (id, status) => set((state) => ({
                tasks: state.tasks.map(task =>
                    task.id === id
                        ? { ...task, status, updatedAt: new Date().toISOString() }
                        : task
                )
            })),

            logHours: (id, hours) => set((state) => ({
                tasks: state.tasks.map(task =>
                    task.id === id
                        ? { ...task, loggedHours: task.loggedHours + hours, updatedAt: new Date().toISOString() }
                        : task
                )
            })),
        }),
        {
            name: 'metrika-task-storage',
        }
    )
);
