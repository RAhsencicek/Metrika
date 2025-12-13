import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface UserState {
    currentUser: User | null;
    users: User[];

    // Actions
    setCurrentUser: (user: User) => void;
    updateCurrentUser: (updates: Partial<User>) => void;
    addXP: (amount: number) => void;
    setUsers: (users: User[]) => void;
    addUser: (user: User) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
    getUserById: (id: string) => User | undefined;
}

// Initial mock users
const initialUsers: User[] = [
    {
        id: '1',
        name: 'Emre Yılmaz',
        email: 'emre@metrika.com',
        phone: '+90 555 123 45 67',
        role: 'Proje Yöneticisi',
        department: 'Yönetim',
        location: 'İstanbul Ofis',
        status: 'online',
        avatar: 64,
        level: 12,
        xp: 4250,
        xpToNextLevel: 5000,
        rank: 1,
        bio: 'Proje yönetimi ve takım liderliği konusunda 10 yıllık deneyim.',
        joinDate: '2020-01-15',
    },
    {
        id: '2',
        name: 'Ahmet Kaya',
        email: 'ahmet@metrika.com',
        phone: '+90 555 234 56 78',
        role: 'Backend Developer',
        department: 'Yazılım',
        location: 'Ankara (Remote)',
        status: 'online',
        avatar: 60,
        level: 18,
        xp: 15420,
        xpToNextLevel: 18000,
        rank: 3,
        bio: 'Node.js, Python ve Go konularında uzman.',
        joinDate: '2021-03-15',
    },
    {
        id: '3',
        name: 'Zeynep Demir',
        email: 'zeynep@metrika.com',
        phone: '+90 555 345 67 89',
        role: 'Frontend Developer',
        department: 'Yazılım',
        location: 'İstanbul Ofis',
        status: 'busy',
        avatar: 61,
        level: 15,
        xp: 12500,
        xpToNextLevel: 15000,
        rank: 4,
        bio: 'React ve TypeScript uzmanı.',
        joinDate: '2021-06-20',
    },
    {
        id: '4',
        name: 'Mehmet Yıldız',
        email: 'mehmet@metrika.com',
        phone: '+90 555 456 78 90',
        role: 'Database Admin',
        department: 'Veri',
        location: 'İzmir (Remote)',
        status: 'offline',
        avatar: 62,
        level: 10,
        xp: 8200,
        xpToNextLevel: 10000,
        rank: 7,
        bio: 'PostgreSQL ve MongoDB uzmanı.',
        joinDate: '2022-01-10',
    },
    {
        id: '5',
        name: 'Ayşe Öztürk',
        email: 'ayse@metrika.com',
        phone: '+90 555 567 89 01',
        role: 'UI/UX Designer',
        department: 'Tasarım',
        location: 'İstanbul Ofis',
        status: 'online',
        avatar: 63,
        level: 14,
        xp: 11800,
        xpToNextLevel: 14000,
        rank: 5,
        bio: 'Figma ve Adobe XD uzmanı.',
        joinDate: '2021-09-05',
    },
    {
        id: '6',
        name: 'Caner Erkin',
        email: 'caner@metrika.com',
        phone: '+90 555 678 90 12',
        role: 'QA Tester',
        department: 'Kalite',
        location: 'İstanbul Ofis',
        status: 'offline',
        avatar: 65,
        level: 8,
        xp: 6400,
        xpToNextLevel: 8000,
        rank: 9,
        bio: 'Test otomasyonu ve kalite güvence uzmanı.',
        joinDate: '2022-04-15',
    },
    {
        id: '7',
        name: 'Selin Yılmaz',
        email: 'selin@metrika.com',
        phone: '+90 555 789 01 23',
        role: 'HR Specialist',
        department: 'İK',
        location: 'İstanbul Ofis',
        status: 'online',
        avatar: 44,
        level: 9,
        xp: 7100,
        xpToNextLevel: 9000,
        rank: 8,
        bio: 'İnsan kaynakları ve yetenek yönetimi.',
        joinDate: '2022-02-20',
    },
    {
        id: '8',
        name: 'Burak Yılmaz',
        email: 'burak@metrika.com',
        phone: '+90 555 890 12 34',
        role: 'DevOps Engineer',
        department: 'Altyapı',
        location: 'Londra (Remote)',
        status: 'busy',
        avatar: 45,
        level: 16,
        xp: 13600,
        xpToNextLevel: 16000,
        rank: 2,
        bio: 'AWS, Docker ve Kubernetes uzmanı.',
        joinDate: '2021-01-10',
    },
];

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            currentUser: initialUsers[0], // Emre Yılmaz as default current user
            users: initialUsers,

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
        }),
        {
            name: 'metrika-user-storage',
            partialize: (state) => ({
                currentUser: state.currentUser,
                users: state.users
            }),
        }
    )
);
