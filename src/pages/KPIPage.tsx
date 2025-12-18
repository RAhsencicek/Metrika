import React, { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, LineChart, Line,
} from 'recharts';
import {
    TrendingUp, DollarSign, Target, Activity, Filter, ChevronDown, ArrowUpRight,
    ArrowDownRight, Zap, Users, CheckCircle2, AlertTriangle, BarChart3,
    Gauge, Trophy, Medal, Star, Flame, Award, Crown, Plus, Calendar, Briefcase, X,
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useUserStore } from '../store/userStore';

type TimeRange = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface Goal {
    id: string;
    name: string;
    target: number;
    current: number;
    unit: string;
    category: 'revenue' | 'project' | 'team' | 'quality';
    deadline: string;
    status: 'on-track' | 'at-risk' | 'behind' | 'completed';
    projectId?: string;
}

const KPIPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);
    const [activeChart, setActiveChart] = useState<'area' | 'bar' | 'line'>('area');
    const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'team'>('overview');
    const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
    const [customGoals, setCustomGoals] = useState<Goal[]>([]);

    const { projects } = useProjectStore();
    const { tasks } = useTaskStore();
    const { users } = useUserStore();

    const timeMultiplier = useMemo(() => {
        switch (timeRange) {
            case 'weekly': return { base: 0.25, label: 'bu hafta' };
            case 'monthly': return { base: 1, label: 'bu ay' };
            case 'quarterly': return { base: 3, label: 'bu çeyrek' };
            case 'yearly': return { base: 12, label: 'bu yıl' };
        }
    }, [timeRange]);

    const defaultGoals: Goal[] = useMemo(() => [
        { id: '1', name: 'Yıllık Gelir Hedefi', target: 5000000, current: 3250000, unit: '₺', category: 'revenue', deadline: '2024-12-31', status: 'on-track' },
        { id: '2', name: 'Proje Tamamlama Oranı', target: 95, current: 87, unit: '%', category: 'project', deadline: '2024-12-31', status: 'at-risk', projectId: '1' },
        { id: '3', name: 'Müşteri Memnuniyeti', target: 90, current: 92, unit: '%', category: 'quality', deadline: '2024-12-31', status: 'completed' },
        { id: '4', name: 'Sprint Velocity', target: 60, current: 48, unit: 'SP', category: 'team', deadline: '2024-12-31', status: 'behind', projectId: '2' },
        { id: '5', name: 'Kod Kalitesi', target: 80, current: 76, unit: '%', category: 'quality', deadline: '2024-12-31', status: 'at-risk', projectId: '1' },
        { id: '6', name: 'Aktif Proje Sayısı', target: 10, current: 8, unit: 'adet', category: 'project', deadline: '2024-12-31', status: 'on-track' },
    ], []);

    const allGoals = useMemo(() => [...defaultGoals, ...customGoals], [defaultGoals, customGoals]);

    const goals = useMemo(() => {
        let filtered = allGoals;
        if (selectedProject !== 'all') {
            filtered = allGoals.filter(g => !g.projectId || g.projectId === selectedProject);
        }
        return filtered.map(g => ({
            ...g,
            current: Math.round(g.current * timeMultiplier.base / (timeRange === 'yearly' ? 12 : timeRange === 'quarterly' ? 3 : timeRange === 'monthly' ? 1 : 0.25)),
            target: Math.round(g.target * timeMultiplier.base / (timeRange === 'yearly' ? 12 : timeRange === 'quarterly' ? 3 : timeRange === 'monthly' ? 1 : 0.25)),
        }));
    }, [allGoals, selectedProject, timeRange, timeMultiplier]);

    const handleAddGoal = (newGoal: Omit<Goal, 'id'>) => {
        const goal: Goal = { ...newGoal, id: `custom-${Date.now()}` };
        setCustomGoals(prev => [...prev, goal]);
        setIsNewGoalModalOpen(false);
    };

    const handleDeleteGoal = (goalId: string) => {
        if (goalId.startsWith('custom-')) {
            setCustomGoals(prev => prev.filter(g => g.id !== goalId));
        }
    };

    const filteredProjects = useMemo(() => {
        return selectedProject === 'all' ? projects : projects.filter(p => p.id === selectedProject);
    }, [projects, selectedProject]);

    const metrics = useMemo(() => {
        const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
        const usedBudget = filteredProjects.reduce((sum, p) => sum + p.budgetUsed, 0);
        const totalTasks = filteredProjects.reduce((sum, p) => sum + p.totalTasks, 0);
        const completedTasks = filteredProjects.reduce((sum, p) => sum + p.tasksCompleted, 0);
        const avgProgress = filteredProjects.length > 0 ? filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length : 0;
        return { totalBudget, usedBudget, totalTasks, completedTasks, avgProgress, activeProjects: filteredProjects.filter(p => p.status === 'Active').length, atRiskProjects: filteredProjects.filter(p => p.status === 'At Risk').length };
    }, [filteredProjects]);

    const teamPerformance = useMemo(() => {
        const projectTasks = selectedProject === 'all' ? tasks : tasks.filter(t => t.projectIds.includes(selectedProject));
        const relevantUserIds = selectedProject === 'all' ? users.map(u => u.id) : [...new Set(projectTasks.map(t => t.assigneeId))];
        return users.filter(u => relevantUserIds.includes(u.id)).map(user => {
            const userTasks = projectTasks.filter(t => t.assigneeId === user.id);
            const completedTasks = userTasks.filter(t => t.status === 'Done').length;
            const totalHours = Math.round(userTasks.reduce((sum, t) => sum + t.loggedHours, 0) * timeMultiplier.base);
            const efficiency = userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0;
            return { ...user, completedTasks: Math.round(completedTasks * timeMultiplier.base), totalTasks: userTasks.length, totalHours, efficiency, score: Math.round(user.xp * timeMultiplier.base) };
        }).sort((a, b) => b.score - a.score);
    }, [users, tasks, selectedProject, timeMultiplier]);

    const revenueData = useMemo(() => {
        const labels = timeRange === 'weekly' ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] :
            timeRange === 'monthly' ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'] :
                timeRange === 'quarterly' ? ['Q1', 'Q2', 'Q3', 'Q4'] : ['2020', '2021', '2022', '2023', '2024'];
        const baseMultiplier = selectedProject === 'all' ? 1 : 0.3;
        return labels.map((name) => ({
            name,
            revenue: Math.round((3000 + Math.random() * 4000) * baseMultiplier * (timeRange === 'yearly' ? 10 : 1)),
            profit: Math.round((1500 + Math.random() * 2500) * baseMultiplier * (timeRange === 'yearly' ? 10 : 1)),
        }));
    }, [timeRange, selectedProject]);

    const projectPerformance = useMemo(() => {
        if (selectedProject === 'all') {
            return projects.slice(0, 6).map(p => ({
                name: p.title.length > 10 ? p.title.slice(0, 10) + '...' : p.title,
                fullName: p.title,
                ilerleme: p.progress,
                bütçe: Math.round((p.budgetUsed / p.budget) * 100),
                görev: Math.round((p.tasksCompleted / p.totalTasks) * 100),
            }));
        } else {
            const project = projects.find(p => p.id === selectedProject);
            if (!project) return [];
            const labels = timeRange === 'weekly' ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'] :
                timeRange === 'monthly' ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'] :
                    timeRange === 'quarterly' ? ['Q1', 'Q2', 'Q3', 'Q4'] : ['2020', '2021', '2022', '2023', '2024'];
            return labels.map((label, i, arr) => ({
                name: label, fullName: `${project.title} - ${label}`,
                ilerleme: Math.min(100, Math.round((project.progress / arr.length) * (i + 1) + Math.random() * 10)),
                bütçe: Math.min(100, Math.round((project.budgetUsed / project.budget * 100 / arr.length) * (i + 1) + Math.random() * 5)),
                görev: Math.min(100, Math.round((project.tasksCompleted / project.totalTasks * 100 / arr.length) * (i + 1) + Math.random() * 8)),
            }));
        }
    }, [projects, selectedProject, timeRange]);

    const teamCapabilities = [
        { subject: 'Geliştirme', A: 85, B: 90, fullMark: 100 }, { subject: 'Tasarım', A: 78, B: 85, fullMark: 100 },
        { subject: 'Test', A: 86, B: 80, fullMark: 100 }, { subject: 'DevOps', A: 72, B: 88, fullMark: 100 },
        { subject: 'İletişim', A: 92, B: 78, fullMark: 100 }, { subject: 'Dokümantasyon', A: 68, B: 72, fullMark: 100 },
    ];

    const budgetDistribution = useMemo(() => {
        return filteredProjects.slice(0, 5).map(p => ({
            name: p.title.length > 15 ? p.title.slice(0, 15) + '...' : p.title, fullName: p.title, value: p.budget, used: p.budgetUsed,
            remaining: p.budget - p.budgetUsed, percentage: Math.round((p.budgetUsed / p.budget) * 100),
            color: p.status === 'Active' ? '#3b82f6' : p.status === 'Completed' ? '#10b981' : p.status === 'At Risk' ? '#f59e0b' : '#6b7280',
        }));
    }, [filteredProjects]);

    const AnimatedCounter = ({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) => {
        const [displayValue, setDisplayValue] = useState(0);
        React.useEffect(() => {
            const steps = 30; const stepValue = value / steps; let current = 0;
            const timer = setInterval(() => { current += stepValue; if (current >= value) { setDisplayValue(value); clearInterval(timer); } else { setDisplayValue(Math.round(current)); } }, 1000 / steps);
            return () => clearInterval(timer);
        }, [value]);
        return <span>{prefix}{displayValue.toLocaleString('tr-TR')}{suffix}</span>;
    };

    const GaugeChart = ({ value, max, label, color }: { value: number; max: number; label: string; color: string }) => {
        const percentage = Math.min((value / max) * 100, 100);
        return (
            <div className="flex flex-col items-center">
                <svg width="120" height="80" viewBox="0 0 120 80">
                    <defs><linearGradient id={`gauge-${label}`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={color} stopOpacity="0.5" /><stop offset="100%" stopColor={color} /></linearGradient></defs>
                    <path d="M 15 70 A 45 45 0 0 1 105 70" fill="none" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 15 70 A 45 45 0 0 1 105 70" fill="none" stroke={`url(#gauge-${label})`} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(percentage / 100) * 141.37} 141.37`} className="transition-all duration-1000 ease-out" />
                    <text x="60" y="55" textAnchor="middle" className="fill-white text-lg font-bold">{Math.round(percentage)}%</text>
                </svg>
                <span className="text-gray-400 text-sm mt-1">{label}</span>
            </div>
        );
    };

    const GoalCard = ({ goal, onDelete }: { goal: Goal; onDelete?: (id: string) => void }) => {
        const percentage = Math.min((goal.current / goal.target) * 100, 100);
        const statusColors = { 'on-track': 'text-green-400 bg-green-500/10', 'at-risk': 'text-amber-400 bg-amber-500/10', 'behind': 'text-red-400 bg-red-500/10', 'completed': 'text-blue-400 bg-blue-500/10' };
        const statusLabels = { 'on-track': 'Yolunda', 'at-risk': 'Risk Altında', 'behind': 'Geride', 'completed': 'Tamamlandı' };
        const statusGlows = { 'on-track': 'hover:shadow-green-500/20', 'at-risk': 'hover:shadow-amber-500/20', 'behind': 'hover:shadow-red-500/20', 'completed': 'hover:shadow-blue-500/20' };
        const categoryIcons = { revenue: DollarSign, project: Target, team: Users, quality: CheckCircle2 };
        const Icon = categoryIcons[goal.category];
        const isCustom = goal.id.startsWith('custom-');
        return (
            <div className={`bg-dark-800 p-5 rounded-xl border border-dark-700 transition-all duration-300 cursor-pointer hover:border-dark-500 hover:-translate-y-1 hover:shadow-xl ${statusGlows[goal.status]} group relative`}>
                {isCustom && onDelete && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }} className="absolute top-2 right-2 p-1 rounded-full bg-dark-700 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all">
                        <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                    </button>
                )}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-dark-700 rounded-lg group-hover:scale-110 transition-transform duration-300"><Icon className="w-4 h-4 text-blue-400" /></div>
                        <div><h4 className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">{goal.name}</h4><p className="text-gray-500 text-xs">Bitiş: {new Date(goal.deadline).toLocaleDateString('tr-TR')}</p></div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[goal.status]} group-hover:scale-105 transition-transform`}>{statusLabels[goal.status]}</span>
                </div>
                <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">İlerleme ({timeMultiplier.label})</span><span className="text-white font-medium">{goal.current.toLocaleString('tr-TR')}{goal.unit} / {goal.target.toLocaleString('tr-TR')}{goal.unit}</span></div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${goal.status === 'completed' ? 'bg-blue-500' : goal.status === 'on-track' ? 'bg-green-500' : goal.status === 'at-risk' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }} /></div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{Math.round(percentage)}%</span>
                    <div className="flex items-center gap-2">
                        {isCustom && <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">Özel</span>}
                        <div className="flex items-center gap-1 text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"><TrendingUp className="w-3 h-3" /><span>Detayları Gör</span></div>
                    </div>
                </div>
            </div>
        );
    };

    const TeamMemberCard = ({ member, rank }: { member: typeof teamPerformance[0]; rank: number }) => {
        const rankIcons = [Crown, Medal, Award];
        const RankIcon = rank < 3 ? rankIcons[rank] : null;
        const rankColors = ['text-amber-400', 'text-gray-300', 'text-orange-400'];
        const glowColors = ['hover:shadow-amber-500/20', 'hover:shadow-gray-400/20', 'hover:shadow-orange-500/20'];
        return (
            <div className={`bg-dark-800 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${rank === 0 ? 'border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-transparent' : 'border-dark-700'} hover:border-dark-500 hover:-translate-y-1 hover:shadow-xl ${rank < 3 ? glowColors[rank] : 'hover:shadow-blue-500/10'} group`}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">{member.name.split(' ').map(n => n[0]).join('')}</div>
                        {RankIcon && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-dark-800 flex items-center justify-center group-hover:scale-125 transition-transform"><RankIcon className={`w-3.5 h-3.5 ${rankColors[rank]}`} /></div>}
                    </div>
                    <div className="flex-1 min-w-0"><h4 className="text-white font-medium truncate group-hover:text-blue-300 transition-colors">{member.name}</h4><p className="text-gray-500 text-xs truncate">{member.role}</p></div>
                    <div className="text-right"><p className="text-lg font-bold text-white group-hover:scale-105 transition-transform origin-right">{member.score.toLocaleString()}</p><p className="text-gray-500 text-xs">XP ({timeMultiplier.label})</p></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-dark-700">
                    <div className="text-center"><p className="text-white font-semibold group-hover:text-blue-300 transition-colors">{member.completedTasks}</p><p className="text-gray-500 text-xs">Görev</p></div>
                    <div className="text-center"><p className="text-white font-semibold group-hover:text-purple-300 transition-colors">{member.totalHours}s</p><p className="text-gray-500 text-xs">Çalışma</p></div>
                    <div className="text-center"><p className={`font-semibold transition-transform group-hover:scale-110 ${member.efficiency >= 80 ? 'text-green-400' : member.efficiency >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{member.efficiency}%</p><p className="text-gray-500 text-xs">Verimlilik</p></div>
                </div>
            </div>
        );
    };

    const StatCard = ({ title, value, suffix = '', prefix = '', trend, trendValue, icon: Icon, color, subtext }: { title: string; value: number; suffix?: string; prefix?: string; trend: 'up' | 'down'; trendValue: string; icon: React.ElementType; color: string; subtext?: string }) => (
        <div className={`bg-dark-800 p-6 rounded-xl border border-dark-700 transition-all duration-300 cursor-pointer hover:border-dark-500 hover:-translate-y-1 hover:shadow-xl ${trend === 'up' ? 'hover:shadow-green-500/10' : 'hover:shadow-red-500/10'} group`}>
            <div className="flex justify-between items-start mb-4">
                <div><p className="text-gray-400 text-xs uppercase font-bold tracking-wide group-hover:text-gray-300 transition-colors">{title}</p><h3 className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left"><AnimatedCounter value={value} prefix={prefix} suffix={suffix} /></h3></div>
                <div className={`p-3 ${color} rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}><Icon className="w-6 h-6" /></div>
            </div>
            <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'} group-hover:scale-105 transition-transform origin-left`}>{trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}<span className="font-medium">{trendValue}</span>{subtext && <span className="text-gray-500 ml-2 text-xs">{subtext}</span>}</div>
        </div>
    );

    const selectedProjectName = selectedProject === 'all' ? 'Tüm Projeler' : projects.find(p => p.id === selectedProject)?.title || 'Proje';

    return (
        <div className="pb-20 animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart3 className="w-7 h-7 text-blue-500" />KPI Gösterge Paneli</h1>
                    <p className="text-gray-400 text-sm mt-1 flex items-center gap-2"><Briefcase className="w-4 h-4" /><span className="text-blue-400 font-medium">{selectedProjectName}</span><span>•</span><Calendar className="w-4 h-4" /><span className="text-purple-400 font-medium">{timeRange === 'weekly' ? 'Haftalık' : timeRange === 'monthly' ? 'Aylık' : timeRange === 'quarterly' ? 'Çeyreklik' : 'Yıllık'} Görünüm</span></p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="flex bg-dark-800 rounded-lg border border-dark-700 p-1">
                        {[{ id: 'overview', label: 'Genel', icon: BarChart3 }, { id: 'goals', label: 'Hedefler', icon: Target }, { id: 'team', label: 'Ekip', icon: Users }].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}><tab.icon className="w-4 h-4" />{tab.label}</button>
                        ))}
                    </div>
                    <div className="flex bg-dark-800 rounded-lg border border-dark-700 p-1">
                        {(['weekly', 'monthly', 'quarterly', 'yearly'] as TimeRange[]).map(range => (
                            <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === range ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{range === 'weekly' ? 'Haftalık' : range === 'monthly' ? 'Aylık' : range === 'quarterly' ? 'Çeyreklik' : 'Yıllık'}</button>
                        ))}
                    </div>
                    <div className="relative">
                        <button onClick={() => setShowProjectDropdown(!showProjectDropdown)} className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-lg border border-dark-700 text-gray-300 hover:border-dark-600"><Filter className="w-4 h-4" /><span className="text-sm max-w-32 truncate">{selectedProjectName}</span><ChevronDown className={`w-4 h-4 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} /></button>
                        {showProjectDropdown && <div className="absolute z-50 top-full mt-2 right-0 w-72 bg-dark-800 rounded-lg border border-dark-700 shadow-xl max-h-64 overflow-y-auto"><button onClick={() => { setSelectedProject('all'); setShowProjectDropdown(false); }} className={`w-full px-4 py-3 text-left text-sm hover:bg-dark-700 flex items-center gap-3 ${selectedProject === 'all' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'}`}><div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" /><span>Tüm Projeler</span><span className="ml-auto text-gray-500 text-xs">{projects.length} proje</span></button>{projects.map(p => <button key={p.id} onClick={() => { setSelectedProject(p.id); setShowProjectDropdown(false); }} className={`w-full px-4 py-3 text-left text-sm hover:bg-dark-700 flex items-center gap-3 ${selectedProject === p.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'}`}><div className={`w-3 h-3 rounded-full ${p.status === 'Active' ? 'bg-green-500' : p.status === 'At Risk' ? 'bg-amber-500' : p.status === 'Completed' ? 'bg-blue-500' : 'bg-gray-500'}`} /><span className="truncate">{p.title}</span><span className={`ml-auto text-xs ${p.status === 'Active' ? 'text-green-400' : p.status === 'At Risk' ? 'text-amber-400' : 'text-gray-500'}`}>{p.progress}%</span></button>)}</div>}
                    </div>
                </div>
            </div>

            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Toplam Bütçe" value={metrics.totalBudget} prefix="₺" trend="up" trendValue="+12.5%" icon={DollarSign} color="bg-green-500/10 text-green-500" subtext="geçen yıla göre" />
                        <StatCard title="Tamamlanan Görevler" value={metrics.completedTasks} suffix={` / ${metrics.totalTasks}`} trend="up" trendValue={`${metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}%`} icon={CheckCircle2} color="bg-blue-500/10 text-blue-500" subtext="tamamlanma" />
                        <StatCard title="Ortalama İlerleme" value={Math.round(metrics.avgProgress)} suffix="%" trend="up" trendValue="+8%" icon={Target} color="bg-purple-500/10 text-purple-500" subtext="hedefin üzerinde" />
                        <StatCard title="Riskli Projeler" value={metrics.atRiskProjects} trend="down" trendValue={`${metrics.activeProjects} aktif`} icon={AlertTriangle} color="bg-amber-500/10 text-amber-500" subtext="dikkat" />
                    </div>

                    <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 mb-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Gauge className="w-5 h-5 text-purple-500" />Hedef Gerçekleşme</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <GaugeChart value={metrics.completedTasks} max={metrics.totalTasks || 1} label="Görev" color="#3b82f6" />
                            <GaugeChart value={metrics.usedBudget} max={metrics.totalBudget || 1} label="Bütçe" color="#10b981" />
                            <GaugeChart value={metrics.avgProgress} max={100} label="İlerleme" color="#8b5cf6" />
                            <GaugeChart value={85} max={100} label="Memnuniyet" color="#f59e0b" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                            <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white">Finansal Genel Bakış</h3><div className="flex bg-dark-700 rounded-lg p-1">{(['area', 'bar', 'line'] as const).map(type => <button key={type} onClick={() => setActiveChart(type)} className={`px-2 py-1 text-xs font-medium rounded ${activeChart === type ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{type === 'area' ? 'Alan' : type === 'bar' ? 'Çubuk' : 'Çizgi'}</button>)}</div></div>
                            <div className="h-80"><ResponsiveContainer>{activeChart === 'area' ? <AreaChart data={revenueData}><defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="name" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} /><Legend /><Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRev)" name="Gelir" /><Area type="monotone" dataKey="profit" stroke="#10b981" fill="none" name="Kâr" /></AreaChart> : activeChart === 'bar' ? <BarChart data={revenueData}><CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} /><XAxis dataKey="name" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} /><Legend /><Bar dataKey="revenue" name="Gelir" fill="#3b82f6" radius={[4, 4, 0, 0]} /><Bar dataKey="profit" name="Kâr" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart> : <LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} /><XAxis dataKey="name" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} /><Legend /><Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Gelir" /><Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Kâr" /></LineChart>}</ResponsiveContainer></div>
                        </div>
                        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-cyan-500" />Ekip Yetkinlik</h3>
                            <div className="h-80"><ResponsiveContainer><RadarChart data={teamCapabilities}><PolarGrid stroke="#334155" /><PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={12} /><PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" fontSize={10} /><Radar name="Mevcut" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} /><Radar name="Hedef" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.2} /><Legend /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} /></RadarChart></ResponsiveContainer></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 lg:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-orange-500" />{selectedProject === 'all' ? 'Proje Performans Karşılaştırması' : `${selectedProjectName} - Trend Analizi`}</h3>
                            </div>
                            <div className="h-80">
                                <ResponsiveContainer>
                                    <AreaChart data={projectPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIlerleme" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                                            <linearGradient id="colorButce" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                                            <linearGradient id="colorGorev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} formatter={(value: number, name: string) => [`${value}%`, name]} />
                                        <Legend iconType="circle" iconSize={8} />
                                        <Area type="monotone" dataKey="ilerleme" name="İlerleme" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorIlerleme)" dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#1e293b' }} />
                                        <Area type="monotone" dataKey="bütçe" name="Bütçe" stroke="#f59e0b" strokeWidth={2.5} fill="url(#colorButce)" dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#1e293b' }} />
                                        <Area type="monotone" dataKey="görev" name="Görev" stroke="#10b981" strokeWidth={2.5} fill="url(#colorGorev)" dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#1e293b' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" />Bütçe Dağılımı</h3>
                            <div className="space-y-4">
                                {budgetDistribution.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1.5"><span className="text-sm text-gray-300 truncate flex-1" title={item.fullName}>{item.name}</span><span className="text-sm font-semibold text-white ml-2">₺{(item.value / 1000).toFixed(0)}K</span></div>
                                        <div className="h-3 bg-dark-700 rounded-full overflow-hidden relative"><div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${item.percentage}%`, background: `linear-gradient(90deg, ${item.color}99, ${item.color})` }} /><div className="absolute inset-0 flex items-center justify-end pr-2"><span className="text-xs font-medium text-white drop-shadow-lg">{item.percentage}%</span></div></div>
                                        <div className="flex justify-between mt-1"><span className="text-xs text-gray-500">Kullanılan: ₺{(item.used / 1000).toFixed(0)}K</span><span className="text-xs text-gray-500">Kalan: ₺{(item.remaining / 1000).toFixed(0)}K</span></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'goals' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Target className="w-6 h-6 text-purple-500" />Hedef Takip Sistemi</h2><p className="text-gray-500 text-sm mt-1">{selectedProjectName} için {timeMultiplier.label} hedefler</p></div>
                        <button onClick={() => setIsNewGoalModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors hover:scale-105 active:scale-95"><Plus className="w-4 h-4" />Yeni Hedef</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">{goals.map(goal => <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} />)}</div>
                    <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                        <h3 className="text-lg font-bold text-white mb-4">Hedef Özeti - {selectedProjectName}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[{ label: 'Tamamlanan', value: goals.filter(g => g.status === 'completed').length, color: 'text-blue-400', icon: CheckCircle2 }, { label: 'Yolunda', value: goals.filter(g => g.status === 'on-track').length, color: 'text-green-400', icon: TrendingUp }, { label: 'Risk Altında', value: goals.filter(g => g.status === 'at-risk').length, color: 'text-amber-400', icon: AlertTriangle }, { label: 'Geride', value: goals.filter(g => g.status === 'behind').length, color: 'text-red-400', icon: Flame }].map((s, i) => <div key={i} className="bg-dark-700 p-4 rounded-lg text-center hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer"><s.icon className={`w-8 h-8 mx-auto mb-2 ${s.color}`} /><p className="text-2xl font-bold text-white">{s.value}</p><p className="text-gray-400 text-sm">{s.label}</p></div>)}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'team' && (
                <div>
                    <div className="flex justify-between items-center mb-6"><div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" />Ekip Performans Sıralaması</h2><p className="text-gray-500 text-sm mt-1">{selectedProjectName} • {timeMultiplier.label} performans</p></div></div>
                    {teamPerformance.length === 0 ? (
                        <div className="bg-dark-800 p-12 rounded-xl border border-dark-700 text-center"><Users className="w-16 h-16 text-gray-600 mx-auto mb-4" /><h3 className="text-xl font-bold text-white mb-2">Bu projede ekip üyesi bulunamadı</h3><p className="text-gray-500">Başka bir proje seçin veya "Tüm Projeler" görünümüne geçin.</p></div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">{teamPerformance.map((member, i) => <TeamMemberCard key={member.id} member={member} rank={i} />)}</div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" />En Çok Görev Tamamlayan</h3>
                                    <div className="space-y-3">{teamPerformance.slice(0, 5).map((m, i) => <div key={m.id} className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors cursor-pointer"><span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-orange-400 text-black' : 'bg-dark-600 text-gray-300'}`}>{i + 1}</span><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{m.name.split(' ').map(n => n[0]).join('')}</div><div className="flex-1"><p className="text-white text-sm font-medium">{m.name}</p><p className="text-gray-500 text-xs">{m.role}</p></div><p className="text-white font-bold">{m.completedTasks} <span className="text-gray-500 font-normal text-sm">görev</span></p></div>)}</div>
                                </div>
                                <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-green-500" />En Verimli Çalışanlar</h3>
                                    <div className="space-y-3">{[...teamPerformance].sort((a, b) => b.efficiency - a.efficiency).slice(0, 5).map((m, i) => <div key={m.id} className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors cursor-pointer"><span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-green-500 text-black' : i === 1 ? 'bg-green-400 text-black' : i === 2 ? 'bg-green-300 text-black' : 'bg-dark-600 text-gray-300'}`}>{i + 1}</span><div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">{m.name.split(' ').map(n => n[0]).join('')}</div><div className="flex-1"><p className="text-white text-sm font-medium">{m.name}</p><p className="text-gray-500 text-xs">{m.role}</p></div><p className={`font-bold ${m.efficiency >= 80 ? 'text-green-400' : m.efficiency >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{m.efficiency}%</p></div>)}</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* New Goal Modal */}
            {isNewGoalModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setIsNewGoalModalOpen(false)}>
                    <div className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-lg mx-4 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-dark-700">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Target className="w-5 h-5 text-purple-500" />Yeni Hedef Ekle</h2>
                            <button onClick={() => setIsNewGoalModalOpen(false)} className="p-2 hover:bg-dark-700 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const newGoal: Omit<Goal, 'id'> = {
                                    name: formData.get('name') as string,
                                    target: Number(formData.get('target')),
                                    current: Number(formData.get('current')),
                                    unit: formData.get('unit') as string,
                                    category: formData.get('category') as Goal['category'],
                                    deadline: formData.get('deadline') as string,
                                    status: formData.get('status') as Goal['status'],
                                    projectId: formData.get('projectId') === 'none' ? undefined : formData.get('projectId') as string,
                                };
                                handleAddGoal(newGoal);
                            }}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Hedef Adı</label>
                                <input name="name" required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" placeholder="Örn: Aylık Satış Hedefi" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Hedef Değer</label>
                                    <input name="target" type="number" required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" placeholder="100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Mevcut Değer</label>
                                    <input name="current" type="number" required defaultValue="0" className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Birim</label>
                                    <input name="unit" required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" placeholder="%, ₺, adet" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                                    <select name="category" required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary">
                                        <option value="revenue">💰 Gelir</option>
                                        <option value="project">🎯 Proje</option>
                                        <option value="team">👥 Ekip</option>
                                        <option value="quality">✅ Kalite</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Durum</label>
                                    <select name="status" required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary">
                                        <option value="on-track">🟢 Yolunda</option>
                                        <option value="at-risk">🟡 Risk Altında</option>
                                        <option value="behind">🔴 Geride</option>
                                        <option value="completed">🔵 Tamamlandı</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Bitiş Tarihi</label>
                                    <input name="deadline" type="date" required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Proje (Opsiyonel)</label>
                                    <select name="projectId" className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary">
                                        <option value="none">Genel Hedef</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsNewGoalModalOpen(false)} className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors">İptal</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" />Hedef Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPIPage;