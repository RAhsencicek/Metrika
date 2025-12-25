import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, mapTaskStatus } from '../services/api';
import type { Task, TaskStatus } from '../types';

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    getTaskById: (id: string) => Task | undefined;
    getTasksByProject: (projectId: string) => Task[];
    getTasksByAssignee: (assigneeId: string) => Task[];
    getTasksByStatus: (status: TaskStatus) => Task[];
    updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
    logHours: (id: string, hours: number) => void;

    // Document-Task relationship actions
    getTasksByDocument: (documentId: string) => Task[];
    addDocumentToTask: (taskId: string, documentId: string) => Promise<void>;
    removeDocumentFromTask: (taskId: string, documentId: string) => Promise<void>;

    // Project-Task relationship actions
    addTaskToProject: (taskId: string, projectId: string) => Promise<void>;
    removeTaskFromProject: (taskId: string, projectId: string) => Promise<void>;
    getTasksWithoutProject: () => Task[];

    // API Actions
    fetchTasks: (params?: { search?: string; status?: string; priority?: string; projectId?: string; limit?: number }) => Promise<void>;
    fetchTaskById: (id: string) => Promise<Task | null>;
}

// Helper function to map task from API response
// Backend sends populated: project, projects, assignee, documents, sprint, attachments
// Frontend stores populated data for direct display
const mapTask = (task: any): Task => {
    // Handle projectIds - backend may send project (single) or projects (array)
    let projectIds: string[] = [];
    let projectInfo: Task['projectInfo'] = undefined;
    let projectsInfo: Task['projectsInfo'] = undefined;

    // Extract primary project info
    if (task.project && typeof task.project === 'object') {
        projectInfo = {
            id: task.project.id || task.project._id,
            title: task.project.title,
            color: task.project.color,
            status: task.project.status,
        };
        projectIds.push(projectInfo.id);
    } else if (task.project && typeof task.project === 'string') {
        projectIds.push(task.project);
    }

    // Extract projects array info
    if (task.projects && Array.isArray(task.projects)) {
        projectsInfo = task.projects.map((p: any) => {
            if (typeof p === 'string') {
                if (!projectIds.includes(p)) projectIds.push(p);
                return { id: p, title: '' };
            } else {
                const pid = p.id || p._id;
                if (!projectIds.includes(pid)) projectIds.push(pid);
                return {
                    id: pid,
                    title: p.title || '',
                    color: p.color,
                    status: p.status,
                };
            }
        });
    }

    // Handle assignee - backend sends populated assignee object
    let assigneeId = task.assigneeId || '';
    let assigneeName: string | undefined;
    let assigneeAvatar: string | number | undefined;
    let assigneeEmail: string | undefined;

    if (task.assignee) {
        if (typeof task.assignee === 'string') {
            assigneeId = task.assignee;
        } else {
            assigneeId = task.assignee.id || task.assignee._id || '';
            assigneeName = task.assignee.name;
            assigneeAvatar = task.assignee.avatar;
            assigneeEmail = task.assignee.email;
        }
    }

    // Handle documents - extract both IDs and full details
    let documentIds: string[] = [];
    let documentsInfo: Task['documentsInfo'] = undefined;

    if (task.documents && Array.isArray(task.documents)) {
        documentsInfo = task.documents.map((d: any) => {
            if (typeof d === 'string') {
                documentIds.push(d);
                return { id: d, name: '' };
            } else {
                const did = d.id || d._id;
                documentIds.push(did);
                return {
                    id: did,
                    name: d.name || '',
                    type: d.type,
                    size: d.size,
                    path: d.path,
                };
            }
        });
    } else if (task.documentIds && Array.isArray(task.documentIds)) {
        documentIds = task.documentIds;
    }

    // Handle sprint - populated sprint object
    let sprint: Task['sprint'] = undefined;
    if (task.sprint && typeof task.sprint === 'object') {
        sprint = {
            id: task.sprint.id || task.sprint._id,
            name: task.sprint.name,
            status: task.sprint.status,
            startDate: task.sprint.startDate,
            endDate: task.sprint.endDate,
        };
    }

    // Handle attachments
    let attachments: Task['attachments'] = undefined;
    if (task.attachments && Array.isArray(task.attachments)) {
        attachments = task.attachments.map((a: any) => ({
            name: a.name || '',
            url: a.url || '',
            mimeType: a.mimeType,
            size: a.size,
            uploadedAt: a.uploadedAt,
        }));
    }

    return {
        id: task.id || task._id,
        title: task.title || '',
        description: task.description || '',
        status: mapTaskStatus(task.status) as TaskStatus,
        priority: task.priority || 'Medium',
        projectIds,
        assigneeId,
        assigneeName,
        assigneeAvatar,
        assigneeEmail,
        documentIds,
        dueDate: task.dueDate || '',
        tags: task.tags || [],
        estimatedHours: task.estimatedHours || 0,
        loggedHours: task.loggedHours || 0,
        createdAt: task.createdAt || '',
        updatedAt: task.updatedAt || '',
        // Populated data
        projectInfo,
        projectsInfo,
        documentsInfo,
        sprint,
        attachments,
    };
};

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: [],
            isLoading: false,
            error: null,

            setTasks: (tasks) => set({ tasks: tasks.map(mapTask) }),

            addTask: async (taskData) => {
                set({ isLoading: true, error: null });
                try {
                    const newTask = await api.post<Task>('/tasks', taskData);
                    const mappedTask = mapTask(newTask);
                    set((state) => ({
                        tasks: [...state.tasks, mappedTask],
                        isLoading: false,
                    }));
                    return mappedTask;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Görev oluşturulamadı';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            updateTask: async (id, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedTask = await api.patch<Task>(`/tasks/${id}`, updates);
                    const mappedTask = mapTask(updatedTask);
                    set((state) => ({
                        tasks: state.tasks.map(task =>
                            task.id === id ? mappedTask : task
                        ),
                        isLoading: false,
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Görev güncellenemedi';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            deleteTask: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await api.delete(`/tasks/${id}`);
                    set((state) => ({
                        tasks: state.tasks.filter(task => task.id !== id),
                        isLoading: false,
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Görev silinemedi';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            getTaskById: (id) => get().tasks.find(task => task.id === id),

            getTasksByProject: (projectId) => get().tasks.filter(task =>
                task.projectIds.includes(projectId)
            ),

            getTasksByAssignee: (assigneeId) => get().tasks.filter(task => task.assigneeId === assigneeId),

            getTasksByStatus: (status) => get().tasks.filter(task => task.status === status),

            updateTaskStatus: async (id, status) => {
                set({ isLoading: true, error: null });
                try {
                    await api.patch(`/tasks/${id}/status`, { status });
                    set((state) => ({
                        tasks: state.tasks.map(task =>
                            task.id === id
                                ? { ...task, status, updatedAt: new Date().toISOString() }
                                : task
                        ),
                        isLoading: false,
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Durum güncellenemedi';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

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

            addDocumentToTask: async (taskId, documentId) => {
                try {
                    await api.post(`/tasks/${taskId}/documents/${documentId}`);
                    set((state) => ({
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
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Doküman bağlanamadı';
                    set({ error: errorMessage });
                    throw error;
                }
            },

            removeDocumentFromTask: async (taskId, documentId) => {
                try {
                    await api.delete(`/tasks/${taskId}/documents/${documentId}`);
                    set((state) => ({
                        tasks: state.tasks.map(task =>
                            task.id === taskId
                                ? {
                                    ...task,
                                    documentIds: task.documentIds?.filter(id => id !== documentId) || [],
                                    updatedAt: new Date().toISOString()
                                }
                                : task
                        )
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Doküman bağlantısı kaldırılamadı';
                    set({ error: errorMessage });
                    throw error;
                }
            },

            // Project-Task relationship functions
            addTaskToProject: async (taskId, projectId) => {
                try {
                    await api.post(`/tasks/${taskId}/projects/${projectId}`);
                    set((state) => ({
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
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Görevi projeye bağlanamadı';
                    set({ error: errorMessage });
                    throw error;
                }
            },

            removeTaskFromProject: async (taskId, projectId) => {
                try {
                    await api.delete(`/tasks/${taskId}/projects/${projectId}`);
                    set((state) => ({
                        tasks: state.tasks.map(task =>
                            task.id === taskId
                                ? {
                                    ...task,
                                    projectIds: task.projectIds.filter(id => id !== projectId),
                                    updatedAt: new Date().toISOString()
                                }
                                : task
                        )
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Görev projeden çıkarılamadı';
                    set({ error: errorMessage });
                    throw error;
                }
            },

            getTasksWithoutProject: () => get().tasks.filter(task =>
                task.projectIds.length === 0
            ),

            // API Actions
            fetchTasks: async (params) => {
                set({ isLoading: true, error: null });
                try {
                    const queryParams = new URLSearchParams();
                    if (params?.search) queryParams.set('search', params.search);
                    if (params?.status) queryParams.set('status', params.status);
                    if (params?.priority) queryParams.set('priority', params.priority);
                    if (params?.projectId) queryParams.set('projectId', params.projectId);
                    // Default to 500 to get all tasks
                    queryParams.set('limit', String(params?.limit || 500));

                    const queryString = queryParams.toString();
                    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;

                    // API returns { tasks: [], page, limit, total, totalPages } or just []
                    const response = await api.get<Task[] | { tasks: Task[] }>(endpoint);
                    const tasksArray = Array.isArray(response) ? response : response.tasks || [];
                    set({ tasks: tasksArray.map(mapTask), isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Görevler alınamadı';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            fetchTaskById: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const task = await api.get<Task>(`/tasks/${id}`);
                    const mappedTask = mapTask(task);
                    set((state) => {
                        const exists = state.tasks.some(t => t.id === id);
                        return {
                            tasks: exists
                                ? state.tasks.map(t => t.id === id ? mappedTask : t)
                                : [...state.tasks, mappedTask],
                            isLoading: false,
                        };
                    });
                    return mappedTask;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Görev alınamadı';
                    set({ error: errorMessage, isLoading: false });
                    return null;
                }
            },
        }),
        {
            name: 'metrika-task-storage',
            // Don't persist tasks array - always fetch fresh from API
            partialize: () => ({}),
        }
    )
);
