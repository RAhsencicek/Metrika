import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, KPI, ProjectStatus, ProjectMethodology } from '../types';

interface ProjectState {
    projects: Project[];

    // Actions
    setProjects: (projects: Project[]) => void;
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    getProjectById: (id: string) => Project | undefined;
    getProjectsByStatus: (status: ProjectStatus) => Project[];
    getProjectsByMethodology: (methodology: ProjectMethodology) => Project[];
    updateProjectProgress: (id: string, progress: number) => void;
    addKPIToProject: (projectId: string, kpi: KPI) => void;
    addTeamMember: (projectId: string, userId: string) => void;
    removeTeamMember: (projectId: string, userId: string) => void;
}

// Initial mock projects
const initialProjects: Project[] = [
    {
        id: '1',
        title: 'E-Ticaret Platformu Yenileme',
        description: 'Mevcut e-ticaret altyapısının modernizasyonu ve yeni özellikler eklenmesi.',
        status: 'Active',
        progress: 65,
        methodology: 'Scrum',
        startDate: '2023-01-10',
        dueDate: '2023-06-30',
        teamSize: 8,
        tasksCompleted: 45,
        totalTasks: 72,
        budget: 250000,
        budgetUsed: 162500,
        color: 'blue',
        managerId: '1',
        teamMemberIds: ['1', '2', '3', '5'],
        kpis: [
            { id: '1', name: 'Sprint Hızı', target: '50', current: '48', unit: 'story point' },
            { id: '2', name: 'Code Coverage', target: '80', current: '75', unit: '%' },
        ],
        createdAt: '2023-01-10',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'Mobil Uygulama Geliştirme',
        description: 'iOS ve Android platformları için native mobil uygulama.',
        status: 'Active',
        progress: 45,
        methodology: 'Scrum',
        startDate: '2023-02-15',
        dueDate: '2023-08-15',
        teamSize: 6,
        tasksCompleted: 28,
        totalTasks: 65,
        budget: 180000,
        budgetUsed: 99000,
        color: 'purple',
        managerId: '3',
        teamMemberIds: ['3', '2', '5'],
        kpis: [
            { id: '1', name: 'Bug Sayısı', target: '5', current: '8', unit: 'adet' },
        ],
        createdAt: '2023-02-15',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        title: 'CRM Entegrasyonu',
        description: 'Salesforce CRM sistemi ile mevcut altyapının entegrasyonu.',
        status: 'Completed',
        progress: 100,
        methodology: 'Waterfall',
        startDate: '2023-01-01',
        dueDate: '2023-04-30',
        teamSize: 4,
        tasksCompleted: 38,
        totalTasks: 38,
        budget: 120000,
        budgetUsed: 115000,
        color: 'green',
        managerId: '2',
        teamMemberIds: ['2', '4'],
        kpis: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-04-30',
    },
    {
        id: '4',
        title: 'Veritabanı Optimizasyonu',
        description: 'Performans iyileştirme ve sorgu optimizasyonu çalışmaları.',
        status: 'At Risk',
        progress: 35,
        methodology: 'Hybrid',
        startDate: '2023-03-01',
        dueDate: '2023-05-15',
        teamSize: 3,
        tasksCompleted: 12,
        totalTasks: 34,
        budget: 80000,
        budgetUsed: 72000,
        color: 'yellow',
        managerId: '4',
        teamMemberIds: ['4', '2'],
        kpis: [],
        createdAt: '2023-03-01',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '5',
        title: 'Güvenlik Denetimi',
        description: 'Yıllık güvenlik taraması ve penetrasyon testleri.',
        status: 'On Hold',
        progress: 20,
        methodology: 'Waterfall',
        startDate: '2023-04-01',
        dueDate: '2023-07-01',
        teamSize: 2,
        tasksCompleted: 5,
        totalTasks: 25,
        budget: 50000,
        budgetUsed: 10000,
        color: 'red',
        managerId: '6',
        teamMemberIds: ['6'],
        kpis: [],
        createdAt: '2023-04-01',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '6',
        title: 'Müşteri Portalı',
        description: 'Self-servis müşteri portalı tasarımı ve geliştirmesi.',
        status: 'Active',
        progress: 78,
        methodology: 'Scrum',
        startDate: '2023-02-01',
        dueDate: '2023-05-30',
        teamSize: 5,
        tasksCompleted: 42,
        totalTasks: 54,
        budget: 150000,
        budgetUsed: 127500,
        color: 'cyan',
        managerId: '5',
        teamMemberIds: ['5', '3', '2'],
        kpis: [],
        createdAt: '2023-02-01',
        updatedAt: new Date().toISOString(),
    },
];

export const useProjectStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            projects: initialProjects,

            setProjects: (projects) => set({ projects }),

            addProject: (projectData) => {
                const newProject: Project = {
                    ...projectData,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                set((state) => ({
                    projects: [...state.projects, newProject]
                }));

                return newProject;
            },

            updateProject: (id, updates) => set((state) => ({
                projects: state.projects.map(project =>
                    project.id === id
                        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
                        : project
                )
            })),

            deleteProject: (id) => set((state) => ({
                projects: state.projects.filter(project => project.id !== id)
            })),

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

            addTeamMember: (projectId, userId) => set((state) => ({
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
            })),

            removeTeamMember: (projectId, userId) => set((state) => ({
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
            })),
        }),
        {
            name: 'metrika-project-storage',
        }
    )
);
