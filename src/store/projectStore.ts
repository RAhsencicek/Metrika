import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import type { Project, KPI, ProjectStatus, ProjectMethodology } from '../types';

// Helper function to map project from API response
// Backend sends populated: manager, members[]
const mapProject = (project: any): Project => {
    // Extract manager info
    let managerId = project.managerId || '';
    let managerInfo: Project['managerInfo'] = undefined;

    if (project.manager) {
        if (typeof project.manager === 'string') {
            managerId = project.manager;
        } else {
            managerId = project.manager.id || project.manager._id || '';
            managerInfo = {
                id: managerId,
                name: project.manager.name || '',
                avatar: project.manager.avatar,
                email: project.manager.email,
                role: project.manager.role,
            };
        }
    }

    // Extract members info
    let teamMemberIds: string[] = project.teamMemberIds || [];
    let membersInfo: Project['membersInfo'] = undefined;

    if (project.members && Array.isArray(project.members)) {
        membersInfo = project.members.map((m: any) => {
            if (typeof m === 'string') {
                if (!teamMemberIds.includes(m)) teamMemberIds.push(m);
                return { id: m, name: '' };
            } else {
                const mid = m.id || m._id;
                if (!teamMemberIds.includes(mid)) teamMemberIds.push(mid);
                return {
                    id: mid,
                    name: m.name || '',
                    avatar: m.avatar,
                    email: m.email,
                    role: m.role,
                    department: m.department,
                    status: m.status,
                };
            }
        });
    }

    return {
        id: project.id || project._id,
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'Active',
        progress: project.progress || 0,
        methodology: project.methodology || 'Scrum',
        startDate: project.startDate || '',
        dueDate: project.dueDate || project.endDate || '',
        endDate: project.endDate,
        teamSize: project.teamSize || teamMemberIds.length,
        tasksCompleted: project.tasksCompleted || 0,
        totalTasks: project.totalTasks || 0,
        budget: project.budget || 0,
        budgetUsed: project.budgetUsed || 0,
        color: project.color || 'blue',
        managerId,
        managerInfo,
        teamMemberIds,
        membersInfo,
        kpis: project.kpis || [],
        createdAt: project.createdAt || '',
        updatedAt: project.updatedAt || '',
    };
};

interface ProjectState {
    projects: Project[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setProjects: (projects: Project[]) => void;
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    getProjectById: (id: string) => Project | undefined;
    getProjectsByStatus: (status: ProjectStatus) => Project[];
    getProjectsByMethodology: (methodology: ProjectMethodology) => Project[];
    updateProjectProgress: (id: string, progress: number) => void;
    addKPIToProject: (projectId: string, kpi: KPI) => void;
    addTeamMember: (projectId: string, userId: string) => Promise<void>;
    removeTeamMember: (projectId: string, userId: string) => Promise<void>;

    // API Actions
    fetchProjects: (params?: { search?: string; status?: string; methodology?: string; limit?: number }) => Promise<void>;
    fetchProjectById: (id: string) => Promise<Project | null>;
}


export const useProjectStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            projects: [],
            isLoading: false,
            error: null,

            setProjects: (projects) => set({ projects }),

            addProject: async (projectData) => {
                set({ isLoading: true, error: null });
                try {
                    const newProject = await api.post<Project>('/projects', projectData);
                    set((state) => ({
                        projects: [...state.projects, newProject],
                        isLoading: false,
                    }));
                    return newProject;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Proje oluşturulamadı';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            updateProject: async (id, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedProject = await api.patch<Project>(`/projects/${id}`, updates);
                    set((state) => ({
                        projects: state.projects.map(project =>
                            project.id === id ? updatedProject : project
                        ),
                        isLoading: false,
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Proje güncellenemedi';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            deleteProject: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await api.delete(`/projects/${id}`);
                    set((state) => ({
                        projects: state.projects.filter(project => project.id !== id),
                        isLoading: false,
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Proje silinemedi';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            getProjectById: (id) => get().projects.find(project => project.id === id),

            getProjectsByStatus: (status) => get().projects.filter(project => project.status === status),

            getProjectsByMethodology: (methodology) => get().projects.filter(project => project.methodology === methodology),

            updateProjectProgress: (id, progress) => set((state) => ({
                projects: state.projects.map(project =>
                    project.id === id
                        ? { ...project, progress, updatedAt: new Date().toISOString() }
                        : project
                )
            })),

            addKPIToProject: (projectId, kpi) => set((state) => ({
                projects: state.projects.map(project =>
                    project.id === projectId
                        ? { ...project, kpis: [...project.kpis, kpi], updatedAt: new Date().toISOString() }
                        : project
                )
            })),

            addTeamMember: async (projectId, userId) => {
                try {
                    await api.post(`/projects/${projectId}/members`, { userId });
                    set((state) => ({
                        projects: state.projects.map(project =>
                            project.id === projectId && !project.teamMemberIds.includes(userId)
                                ? {
                                    ...project,
                                    teamMemberIds: [...project.teamMemberIds, userId],
                                    teamSize: project.teamSize + 1,
                                    updatedAt: new Date().toISOString()
                                }
                                : project
                        )
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Üye eklenemedi';
                    set({ error: errorMessage });
                    throw error;
                }
            },

            removeTeamMember: async (projectId, userId) => {
                try {
                    await api.delete(`/projects/${projectId}/members/${userId}`);
                    set((state) => ({
                        projects: state.projects.map(project =>
                            project.id === projectId
                                ? {
                                    ...project,
                                    teamMemberIds: project.teamMemberIds.filter(id => id !== userId),
                                    teamSize: Math.max(0, project.teamSize - 1),
                                    updatedAt: new Date().toISOString()
                                }
                                : project
                        )
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Üye çıkarılamadı';
                    set({ error: errorMessage });
                    throw error;
                }
            },

            // API Actions
            fetchProjects: async (params) => {
                set({ isLoading: true, error: null });
                try {
                    const queryParams = new URLSearchParams();
                    if (params?.search) queryParams.set('search', params.search);
                    if (params?.status) queryParams.set('status', params.status);
                    if (params?.methodology) queryParams.set('methodology', params.methodology);
                    // Default to 100 to get all projects
                    queryParams.set('limit', String(params?.limit || 100));

                    const queryString = queryParams.toString();
                    const endpoint = `/projects${queryString ? `?${queryString}` : ''}`;

                    // API returns { projects: [], page, limit, total, totalPages } or just []
                    const response = await api.get<any>(endpoint);
                    const rawProjects = Array.isArray(response) ? response : response.projects || [];
                    const projects = rawProjects.map(mapProject);
                    set({ projects, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Projeler alınamadı';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            fetchProjectById: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const rawProject = await api.get<any>(`/projects/${id}`);
                    const project = mapProject(rawProject);
                    // Update project in the list if it exists, otherwise add it
                    set((state) => {
                        const exists = state.projects.some(p => p.id === id || p.id === project.id);
                        return {
                            projects: exists
                                ? state.projects.map(p => (p.id === id || p.id === project.id) ? project : p)
                                : [...state.projects, project],
                            isLoading: false,
                        };
                    });
                    return project;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Proje alınamadı';
                    set({ error: errorMessage, isLoading: false });
                    return null;
                }
            },
        }),
        {
            name: 'metrika-project-storage',
            // Don't persist projects array - always fetch fresh from API
            partialize: () => ({}),
        }
    )
);
