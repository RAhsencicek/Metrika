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

    // Document-Task relationship actions
    getTasksByDocument: (documentId: string) => Task[];
    addDocumentToTask: (taskId: string, documentId: string) => void;
    removeDocumentFromTask: (taskId: string, documentId: string) => void;

    // Project-Task relationship actions (Yeni)
    addTaskToProject: (taskId: string, projectId: string) => void;
    removeTaskFromProject: (taskId: string, projectId: string) => void;
    getTasksWithoutProject: () => Task[];
}

// Initial mock tasks - with current dates for calendar visibility
const initialTasks: Task[] = [
    {
        id: '1',
        title: 'API Dokümantasyonu Hazırlama',
        description: 'Tüm API endpointleri için Swagger dokümantasyonu oluşturulacak.',
        status: 'In Progress',
        priority: 'High',
        projectIds: ['1'], // Array olarak güncellendi
        assigneeId: '2',
        documentIds: ['doc-1', 'doc-2'],
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
        projectIds: ['1', '6'], // Birden fazla projeye bağlı örnek
        assigneeId: '5',
        documentIds: ['doc-3'],
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
        status: 'Done',
        priority: 'High',
        projectIds: ['2'],
        assigneeId: '3',
        dueDate: '2025-12-20',
        tags: ['Mobile', 'Firebase'],
        estimatedHours: 20,
        loggedHours: 18,
        createdAt: '2025-12-05',
        updatedAt: '2025-12-12',
    },
    {
        id: '4',
        title: 'Veritabanı İndeks Optimizasyonu',
        description: 'Yavaş sorguların analizi ve indeks iyileştirmeleri.',
        status: 'Done',
        priority: 'Urgent',
        projectIds: ['4'],
        assigneeId: '4',
        dueDate: '2025-12-15',
        tags: ['Database', 'Performance'],
        estimatedHours: 12,
        loggedHours: 12,
        createdAt: '2025-12-02',
        updatedAt: '2025-12-10',
    },
    {
        id: '5',
        title: 'Kullanıcı Kabul Testleri',
        description: 'Son sprint için UAT senaryolarının hazırlanması ve uygulanması.',
        status: 'Done',
        priority: 'Medium',
        projectIds: ['1'],
        assigneeId: '6',
        dueDate: '2025-12-25',
        tags: ['QA', 'Test'],
        estimatedHours: 32,
        loggedHours: 30,
        createdAt: '2025-12-08',
        updatedAt: '2025-12-11',
    },
    {
        id: '6',
        title: 'Ödeme Sistemi Entegrasyonu',
        description: 'iyzico ve PayTR entegrasyonlarının tamamlanması.',
        status: 'Done',
        priority: 'High',
        projectIds: ['1'],
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
        status: 'Done',
        priority: 'Low',
        projectIds: ['6'],
        assigneeId: '5',
        dueDate: '2025-12-22',
        tags: ['Frontend', 'CSS'],
        estimatedHours: 16,
        loggedHours: 14,
        createdAt: '2025-12-04',
        updatedAt: '2025-12-09',
    },
    {
        id: '8',
        title: 'Login/Register Akışı',
        description: 'Kullanıcı giriş ve kayıt işlemleri için yeni akış tasarımı.',
        status: 'Done',
        priority: 'Medium',
        projectIds: ['2'],
        assigneeId: '3',
        dueDate: '2025-12-08',
        tags: ['Mobile', 'Auth'],
        estimatedHours: 24,
        loggedHours: 22,
        createdAt: '2025-11-20',
        updatedAt: '2025-12-08',
    },
    {
        id: '9',
        title: 'Cache Sistemi Kurulumu',
        description: 'Redis ile cache layer implementasyonu.',
        status: 'Done',
        priority: 'High',
        projectIds: ['1', '4'], // Birden fazla projeye bağlı örnek
        assigneeId: '2',
        dueDate: '2025-12-05',
        tags: ['Backend', 'Redis'],
        estimatedHours: 16,
        loggedHours: 15,
        createdAt: '2025-11-25',
        updatedAt: '2025-12-05',
    },
    {
        id: '10',
        title: 'Dashboard Analitik Paneli',
        description: 'Kullanıcı davranış analitiği için dashboard.',
        status: 'Done',
        priority: 'Medium',
        projectIds: ['1'],
        assigneeId: '5',
        dueDate: '2025-12-03',
        tags: ['Frontend', 'Analytics'],
        estimatedHours: 20,
        loggedHours: 18,
        createdAt: '2025-11-20',
        updatedAt: '2025-12-03',
    },
    {
        id: '11',
        title: 'Email Şablon Sistemi',
        description: 'Transactional email şablonlarının hazırlanması.',
        status: 'Done',
        priority: 'Low',
        projectIds: [], // Projesiz görev örneği
        assigneeId: '5',
        dueDate: '2025-12-01',
        tags: ['Design', 'Email'],
        estimatedHours: 12,
        loggedHours: 10,
        createdAt: '2025-11-18',
        updatedAt: '2025-12-01',
    },
    {
        id: '12',
        title: 'API Rate Limiting',
        description: 'API güvenliği için rate limiting implementasyonu.',
        status: 'Done',
        priority: 'High',
        projectIds: ['1'],
        assigneeId: '2',
        dueDate: '2025-11-28',
        tags: ['Backend', 'Security'],
        estimatedHours: 8,
        loggedHours: 8,
        createdAt: '2025-11-15',
        updatedAt: '2025-11-28',
    },
    {
        id: '13',
        title: 'Sprint Planlama',
        description: 'Q1 2026 sprint planlaması.',
        status: 'In Progress',
        priority: 'Medium',
        projectIds: ['1'],
        assigneeId: '1',
        dueDate: '2025-12-20',
        tags: ['Management', 'Planning'],
        estimatedHours: 8,
        loggedHours: 4,
        createdAt: '2025-12-10',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '14',
        title: 'Performans Testleri',
        description: 'Load testing ve stress testing.',
        status: 'Todo',
        priority: 'High',
        projectIds: ['4'],
        assigneeId: '4',
        dueDate: '2025-12-22',
        tags: ['QA', 'Performance'],
        estimatedHours: 24,
        loggedHours: 0,
        createdAt: '2025-12-12',
        updatedAt: new Date().toISOString(),
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

            // projectIds array'inde bu projectId var mı kontrol et
            getTasksByProject: (projectId) => get().tasks.filter(task =>
                task.projectIds.includes(projectId)
            ),

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

            // Document-Task relationship functions
            getTasksByDocument: (documentId) => get().tasks.filter(task =>
                task.documentIds?.includes(documentId)
            ),

            addDocumentToTask: (taskId, documentId) => set((state) => ({
                tasks: state.tasks.map(task =>
                    task.id === taskId
                        ? {
                            ...task,
                            documentIds: task.documentIds
                                ? task.documentIds.includes(documentId)
                                    ? task.documentIds
                                    : [...task.documentIds, documentId]
                                : [documentId],
                            updatedAt: new Date().toISOString()
                        }
                        : task
                )
            })),

            removeDocumentFromTask: (taskId, documentId) => set((state) => ({
                tasks: state.tasks.map(task =>
                    task.id === taskId
                        ? {
                            ...task,
                            documentIds: task.documentIds?.filter(id => id !== documentId) || [],
                            updatedAt: new Date().toISOString()
                        }
                        : task
                )
            })),

            // Project-Task relationship functions (Yeni)
            addTaskToProject: (taskId, projectId) => set((state) => ({
                tasks: state.tasks.map(task =>
                    task.id === taskId
                        ? {
                            ...task,
                            projectIds: task.projectIds.includes(projectId)
                                ? task.projectIds
                                : [...task.projectIds, projectId],
                            updatedAt: new Date().toISOString()
                        }
                        : task
                )
            })),

            removeTaskFromProject: (taskId, projectId) => set((state) => ({
                tasks: state.tasks.map(task =>
                    task.id === taskId
                        ? {
                            ...task,
                            projectIds: task.projectIds.filter(id => id !== projectId),
                            updatedAt: new Date().toISOString()
                        }
                        : task
                )
            })),

            getTasksWithoutProject: () => get().tasks.filter(task =>
                task.projectIds.length === 0
            ),
        }),
        {
            name: 'metrika-task-storage',
            version: 2, // Migration versiyon numarası
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as { tasks: Task[] } | undefined;

                // Versiyon 1'den 2'ye geçiş: projectId -> projectIds array
                if (version < 2 && state?.tasks) {
                    state.tasks = state.tasks.map((task: Task & { projectId?: string }) => {
                        // Eğer eski projectId varsa ve projectIds yoksa, dönüştür
                        if (task.projectId && !task.projectIds) {
                            return {
                                ...task,
                                projectIds: [task.projectId],
                            };
                        }
                        // projectIds yoksa boş array olarak ayarla
                        if (!task.projectIds) {
                            return {
                                ...task,
                                projectIds: [],
                            };
                        }
                        return task;
                    });
                }

                return state as TaskState;
            },
        }
    )
);
