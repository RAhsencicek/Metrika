import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Plus, AlertCircle, Download, Trash2,
    Filter, Search, Mail, Phone, ExternalLink, Target, TrendingUp, DollarSign, FileText,
    ChevronDown, Edit3, Copy, Archive
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProjectStore, useUserStore, useDocumentStore } from '../store';
import { projectStatusClasses } from '../utils/colorUtils';
import KanbanBoard from '../components/KanbanBoard';
import ProjectEditModal from '../components/ProjectEditModal';

const ProjectDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { getProjectById, deleteProject, updateProject } = useProjectStore();
    const { getUserById } = useUserStore();
    const { getDocumentsByProject, getAnalysisByDocumentId, downloadDocument } = useDocumentStore();

    const project = getProjectById(id || '');

    // Proje dokümanlarını DocumentStore'dan al
    const projectDocuments = useMemo(() => {
        if (!id) return [];
        return getDocumentsByProject(id);
    }, [id, getDocumentsByProject]);

    const [activeTab, setActiveTab] = useState('Overview');
    const [actionMenuOpen, setActionMenuOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
                setActionMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Action handlers
    const handleEdit = () => {
        setActionMenuOpen(false);
        setEditModalOpen(true);
    };

    const handleDelete = () => {
        setActionMenuOpen(false);
        if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            deleteProject(id || '');
            navigate('/projects');
        }
    };

    const handleExport = () => {
        setActionMenuOpen(false);
        // Create JSON export of project data
        const exportData = JSON.stringify(project, null, 2);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project?.title || 'project'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDuplicate = () => {
        setActionMenuOpen(false);
        alert('Proje kopyalama özelliği yakında eklenecek.');
    };

    const handleArchive = () => {
        setActionMenuOpen(false);
        alert('Proje arşivleme özelliği yakında eklenecek.');
    };

    const tabs = [
        { name: 'Overview', label: 'Genel Bakış' },
        { name: 'Tasks', label: 'Görevler' },
        { name: 'Docs', label: 'Dokümanlar' },
        { name: 'KPIs', label: 'KPI\'lar' },
        { name: 'Team', label: 'Ekip' }
    ];

    // Dokümana tıklandığında analiz sayfasına yönlendir
    const handleDocumentClick = (documentId: string) => {
        const analysis = getAnalysisByDocumentId(documentId);
        if (analysis) {
            navigate(`/documents/analysis/${analysis.id}`);
        } else {
            // Analiz yoksa dokümanlar sayfasına yönlendir
            navigate(`/documents`);
        }
    };

    // Doküman indirme
    const handleDownloadDocument = async (e: React.MouseEvent, documentId: string) => {
        e.stopPropagation();
        await downloadDocument(documentId);
    };

    // Mock Team Data
    const teamMembers = [
        { id: 1, name: 'Emre Yılmaz', role: 'Proje Yöneticisi', status: 'online', email: 'emre@metrika.com', avatar: 64 },
        { id: 2, name: 'Ahmet Kaya', role: 'Backend Developer', status: 'online', email: 'ahmet@metrika.com', avatar: 60 },
        { id: 3, name: 'Zeynep Demir', role: 'Frontend Developer', status: 'busy', email: 'zeynep@metrika.com', avatar: 61 },
        { id: 4, name: 'Mehmet Yıldız', role: 'Database Admin', status: 'offline', email: 'mehmet@metrika.com', avatar: 62 },
        { id: 5, name: 'Ayşe Öztürk', role: 'UI/UX Designer', status: 'online', email: 'ayse@metrika.com', avatar: 63 },
        { id: 6, name: 'Caner Erkin', role: 'QA Tester', status: 'offline', email: 'caner@metrika.com', avatar: 65 },
    ];

    // Mock KPI Data
    const burnDownData = [
        { name: 'Sprint 1', planned: 40, actual: 38 },
        { name: 'Sprint 2', planned: 35, actual: 32 },
        { name: 'Sprint 3', planned: 45, actual: 48 },
        { name: 'Sprint 4', planned: 30, actual: 28 },
        { name: 'Sprint 5', planned: 25, actual: 15 }, // Current
    ];

    return (
        <div className="pb-20 animate-fade-in h-full flex flex-col">
            {/* Not Found State */}
            {!project && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Proje Bulunamadı</h2>
                    <p className="text-gray-400 mb-4">Aradığınız proje mevcut değil veya silinmiş olabilir.</p>
                    <button
                        onClick={() => navigate('/projects')}
                        className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg"
                    >
                        Projelere Dön
                    </button>
                </div>
            )}

            {project && (
                <>
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between shrink-0">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-white">{project.title}</h1>
                                <span className={`px-3 py-1 text-xs rounded-full font-medium border ${projectStatusClasses[project.status].bg} ${projectStatusClasses[project.status].text} ${projectStatusClasses[project.status].border}`}>
                                    {projectStatusClasses[project.status].label}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Proje Yöneticisi: {getUserById(project.managerId)?.name || 'Atanmamış'} •
                                Başlangıç: {new Date(project.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {(project.teamMemberIds || []).slice(0, 4).map(memberId => {
                                    const member = getUserById(memberId);
                                    return member ? (
                                        <img key={member.id} src={`https://picsum.photos/id/${member.avatar}/40/40`} className="w-8 h-8 rounded-full border-2 border-dark-900" alt={member.name} />
                                    ) : null;
                                })}
                                {(project.teamMemberIds?.length || 0) > 4 && (
                                    <div className="w-8 h-8 rounded-full bg-dark-700 border-2 border-dark-900 flex items-center justify-center text-xs text-white cursor-pointer hover:bg-dark-600">
                                        +{(project.teamMemberIds?.length || 0) - 4}
                                    </div>
                                )}
                            </div>

                            {/* Action Dropdown Menu */}
                            <div className="relative" ref={actionMenuRef}>
                                <button
                                    onClick={() => setActionMenuOpen(!actionMenuOpen)}
                                    className="bg-primary hover:bg-blue-600 px-4 py-2 rounded-lg text-white text-sm flex items-center shadow-lg shadow-primary/20"
                                >
                                    {activeTab === 'Docs' ? 'Dosya Yükle' : activeTab === 'Team' ? 'Üye Ekle' : 'İşlem Yap'}
                                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${actionMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {actionMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-50 py-1 animate-fade-in">
                                        <button
                                            onClick={handleEdit}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4 mr-3" />
                                            Projeyi Düzenle
                                        </button>
                                        <button
                                            onClick={handleDuplicate}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
                                        >
                                            <Copy className="w-4 h-4 mr-3" />
                                            Kopyala
                                        </button>
                                        <button
                                            onClick={handleExport}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
                                        >
                                            <Download className="w-4 h-4 mr-3" />
                                            Dışa Aktar (JSON)
                                        </button>
                                        <button
                                            onClick={handleArchive}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
                                        >
                                            <Archive className="w-4 h-4 mr-3" />
                                            Arşivle
                                        </button>
                                        <div className="border-t border-dark-600 my-1"></div>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 mr-3" />
                                            Projeyi Sil
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Project Edit Modal */}
                    {project && (
                        <ProjectEditModal
                            isOpen={editModalOpen}
                            onClose={() => setEditModalOpen(false)}
                            project={project}
                            onSave={(data) => {
                                updateProject(project.id, {
                                    title: data.title,
                                    description: data.description,
                                    status: data.status,
                                    startDate: data.startDate,
                                    dueDate: data.dueDate,
                                    budget: parseFloat(data.budget) || project.budget,
                                });
                            }}
                            onDelete={() => {
                                deleteProject(project.id);
                                navigate('/projects');
                            }}
                        />
                    )}

                    {/* Navigation Tabs */}
                    <div className="border-b border-dark-700 mb-8 shrink-0">
                        <nav className="flex space-x-8 overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.name
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* DYNAMIC CONTENT */}

                    {/* TASKS TAB (KANBAN) */}
                    {activeTab === 'Tasks' && id && (
                        <KanbanBoard projectId={id} />
                    )}

                    {/* OVERVIEW TAB */}
                    {activeTab === 'Overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Timeline Column */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                                    <h3 className="text-lg font-bold text-white mb-6">Zaman Çizelgesi</h3>

                                    {/* Gantt Simulation */}
                                    <div className="space-y-6 relative">
                                        {/* Vertical line */}
                                        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-dark-700"></div>

                                        {/* Phase 1 */}
                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-dark-800"></div>
                                            <h4 className="text-white font-medium mb-2">Faz 1: Analiz ve Planlama <span className="text-xs text-gray-500 ml-2">(Tamamlandı)</span></h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-green-900/30 p-2 rounded border border-green-500/30 text-xs text-green-300">Sprint 1: Gereksinimler (100%)</div>
                                                <div className="bg-green-900/30 p-2 rounded border border-green-500/30 text-xs text-green-300">Sprint 2: Teknik Mimari (100%)</div>
                                            </div>
                                        </div>

                                        {/* Phase 2 */}
                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-dark-800 animate-pulse"></div>
                                            <h4 className="text-white font-medium mb-2">Faz 2: Tasarım ve Geliştirme <span className="text-xs text-blue-400 ml-2">(Devam Ediyor)</span></h4>
                                            <div className="space-y-2">
                                                <div className="bg-green-900/30 p-2 rounded border border-green-500/30 text-xs text-green-300 w-full">Sprint 3: UI/UX Tasarımı (100%)</div>
                                                <div className="bg-yellow-900/30 p-2 rounded border border-yellow-500/30 text-xs text-yellow-300 w-3/4">Sprint 4: Ön Yüz Geliştirme (İşlemde)</div>
                                                <div className="bg-dark-700 p-2 rounded border border-dark-600 text-xs text-gray-400 w-1/2 opacity-60">Sprint 5: API Geliştirme (Yaklaşan)</div>
                                            </div>
                                        </div>

                                        {/* Phase 3 */}
                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-gray-600 border-4 border-dark-800"></div>
                                            <h4 className="text-gray-400 font-medium mb-2">Faz 3: Test ve Optimizasyon <span className="text-xs text-gray-500 ml-2">(Planlandı)</span></h4>
                                            <div className="space-y-2 opacity-50">
                                                <div className="bg-dark-700 p-2 rounded text-xs text-gray-500">Sprint 6: Entegrasyon Testleri</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Documents */}
                                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-white">Son Dokümanlar</h3>
                                        <button onClick={() => setActiveTab('Docs')} className="text-xs text-primary">Tümü</button>
                                    </div>
                                    <div className="space-y-3">
                                        {projectDocuments.length > 0 ? (
                                            projectDocuments.slice(0, 3).map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    onClick={() => handleDocumentClick(doc.id)}
                                                    className="flex items-center p-3 bg-dark-900 rounded-lg hover:bg-dark-700 cursor-pointer transition-colors group"
                                                >
                                                    <div className={`p-2 rounded-lg mr-3 ${doc.type === 'PDF' ? 'bg-red-500/10 text-red-500' :
                                                        doc.type === 'XLSX' ? 'bg-green-500/10 text-green-500' :
                                                            doc.type === 'DOCX' ? 'bg-blue-500/10 text-blue-500' :
                                                                'bg-gray-500/10 text-gray-400'
                                                        }`}>
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm text-gray-300 truncate block">{doc.name}</span>
                                                        <span className="text-xs text-gray-500">{doc.sizeFormatted}</span>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">Bu projede henüz doküman yok</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info Column */}
                            <div className="space-y-6">
                                {/* Sprint Details */}
                                <div className="bg-gradient-to-b from-dark-800 to-dark-900 rounded-xl p-6 border border-dark-700">
                                    <h3 className="text-lg font-bold text-white mb-4">Sprint 5: API Geliştirme</h3>
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Başlangıç</span>
                                            <span className="text-white">10 Mayıs 2023</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Bitiş</span>
                                            <span className="text-white">24 Mayıs 2023</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">İlerleme</span>
                                            <span className="text-primary font-bold">60%</span>
                                        </div>
                                        <div className="w-full bg-dark-700 rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center mb-6">
                                        <div className="bg-dark-800 p-2 rounded-lg">
                                            <div className="text-xl font-bold text-white">12</div>
                                            <div className="text-[10px] text-gray-400">Toplam</div>
                                        </div>
                                        <div className="bg-green-900/20 p-2 rounded-lg">
                                            <div className="text-xl font-bold text-green-400">7</div>
                                            <div className="text-[10px] text-green-300">Biten</div>
                                        </div>
                                        <div className="bg-yellow-900/20 p-2 rounded-lg">
                                            <div className="text-xl font-bold text-yellow-400">5</div>
                                            <div className="text-[10px] text-yellow-300">Bekleyen</div>
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-semibold text-white mb-3">Sprint Görevleri</h4>
                                    <div className="space-y-2">
                                        <div onClick={() => navigate('/tasks/1')} className="flex items-center text-sm p-2 bg-dark-800 rounded hover:bg-dark-700 cursor-pointer">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                                            <span className="text-gray-300 truncate">Auth Servisi Güncelleme</span>
                                        </div>
                                        <div className="flex items-center text-sm p-2 bg-dark-800 rounded hover:bg-dark-700 cursor-pointer">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                            <span className="text-gray-300 truncate">Payment Gateway Entegrasyonu</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Team */}
                                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                                    <h3 className="font-bold text-white mb-4">Proje Ekibi</h3>
                                    <div className="space-y-4">
                                        {teamMembers.slice(0, 4).map((user, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="relative">
                                                        <img src={`https://picsum.photos/id/${user.avatar}/40/40`} className="w-8 h-8 rounded-full" alt={user.name} />
                                                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-dark-800 ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-white">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.role}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setActiveTab('Team')} className="w-full mt-4 py-2 border border-dark-600 text-gray-400 text-sm rounded hover:bg-dark-700 hover:text-white transition">Tüm Ekibi Görüntüle</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DOCS TAB */}
                    {activeTab === 'Docs' && (
                        <div className="space-y-6">
                            <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
                                <div className="p-4 border-b border-dark-700 flex justify-between items-center bg-dark-900/30">
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                                            <input type="text" placeholder="Doküman ara..." className="bg-dark-900 border border-dark-600 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-primary w-64" />
                                        </div>
                                        <button className="p-2 bg-dark-700 rounded-lg text-gray-400 hover:text-white"><Filter className="w-4 h-4" /></button>
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Toplam {projectDocuments.length} Dosya ({
                                            (projectDocuments.reduce((acc, doc) => acc + doc.size, 0) / (1024 * 1024)).toFixed(1)
                                        } MB)
                                    </div>
                                </div>

                                {projectDocuments.length > 0 ? (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-dark-900/50 text-xs text-gray-500 uppercase border-b border-dark-700">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">Dosya Adı</th>
                                                <th className="px-6 py-4 font-semibold">Tür</th>
                                                <th className="px-6 py-4 font-semibold">Boyut</th>
                                                <th className="px-6 py-4 font-semibold">Yükleyen</th>
                                                <th className="px-6 py-4 font-semibold">Tarih</th>
                                                <th className="px-6 py-4 font-semibold text-right">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-dark-700">
                                            {projectDocuments.map((doc) => {
                                                const uploader = getUserById(doc.uploaderId);
                                                return (
                                                    <tr
                                                        key={doc.id}
                                                        onClick={() => handleDocumentClick(doc.id)}
                                                        className="hover:bg-dark-700/30 transition group cursor-pointer"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center">
                                                                <div className={`p-2 rounded-lg mr-3 ${doc.type === 'PDF' ? 'bg-red-500/10 text-red-500' :
                                                                    doc.type === 'XLSX' ? 'bg-green-500/10 text-green-500' :
                                                                        doc.type === 'DOCX' ? 'bg-blue-500/10 text-blue-500' :
                                                                            'bg-gray-500/10 text-gray-400'
                                                                    }`}>
                                                                    <FileText className="w-4 h-4" />
                                                                </div>
                                                                <span className="font-medium text-white">{doc.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-400">{doc.type}</td>
                                                        <td className="px-6 py-4 text-gray-400">{doc.sizeFormatted}</td>
                                                        <td className="px-6 py-4 text-gray-300">{uploader?.name || 'Bilinmiyor'}</td>
                                                        <td className="px-6 py-4 text-gray-400">
                                                            {new Date(doc.uploadDate).toLocaleDateString('tr-TR', {
                                                                day: 'numeric', month: 'long', year: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => handleDownloadDocument(e, doc.id)}
                                                                    className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white"
                                                                    title="İndir"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDocumentClick(doc.id); }}
                                                                    className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-primary"
                                                                    title="Analiz Et"
                                                                >
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-12 text-center">
                                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-white mb-2">Henüz Doküman Yok</h3>
                                        <p className="text-sm text-gray-400">Bu projede henüz doküman bulunmuyor. Doküman yüklemek için yukarıdaki "Dosya Yükle" butonunu kullanın.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* KPIS TAB */}
                    {activeTab === 'KPIs' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-gray-400 font-medium text-sm">Bütçe Kullanımı</h3>
                                        <DollarSign className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-2">₺450,000</div>
                                    <div className="w-full bg-dark-900 rounded-full h-2 mb-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500">Toplam Bütçe: ₺700,000 (65% kullanıldı)</p>
                                </div>

                                <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-gray-400 font-medium text-sm">Sprint Tamamlanma</h3>
                                        <Target className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-2">85%</div>
                                    <div className="w-full bg-dark-900 rounded-full h-2 mb-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500">Hedeflenen hızın üzerinde ilerleniyor.</p>
                                </div>

                                <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-gray-400 font-medium text-sm">Hata Yoğunluğu</h3>
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-2">2.4 <span className="text-sm font-normal text-gray-400">/ sprint</span></div>
                                    <div className="flex items-center text-xs text-green-400">
                                        <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                                        <span>Geçen aya göre %12 düşüş</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                                <h3 className="text-lg font-bold text-white mb-6">Sprint Hız Grafiği (Burndown)</h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={burnDownData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                                cursor={{ fill: '#334155', opacity: 0.2 }}
                                            />
                                            <Legend />
                                            <Bar dataKey="planned" name="Planlanan (Puan)" fill="#64748b" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="actual" name="Gerçekleşen (Puan)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TEAM TAB */}
                    {activeTab === 'Team' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamMembers.map(member => (
                                <div key={member.id} className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex flex-col items-center text-center relative group hover:border-primary/50 transition-colors">
                                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${member.status === 'online' ? 'bg-green-500' :
                                        member.status === 'busy' ? 'bg-red-500' :
                                            'bg-gray-500'
                                        }`}></div>

                                    <div className="w-20 h-20 rounded-full p-1 border-2 border-dark-600 mb-4">
                                        <img src={`https://picsum.photos/id/${member.avatar}/80/80`} className="w-full h-full rounded-full" alt={member.name} />
                                    </div>

                                    <h3 className="text-lg font-bold text-white">{member.name}</h3>
                                    <p className="text-sm text-primary font-medium mb-1">{member.role}</p>
                                    <p className="text-xs text-gray-500 mb-6">{member.email}</p>

                                    <div className="flex space-x-2 w-full">
                                        <button className="flex-1 flex items-center justify-center py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm text-gray-300 transition-colors">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Mesaj
                                        </button>
                                        <button className="flex-1 flex items-center justify-center py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm text-gray-300 transition-colors">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Ara
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="bg-dark-800/50 p-6 rounded-xl border border-dashed border-dark-600 flex flex-col items-center justify-center text-center hover:bg-dark-800 hover:border-primary/50 transition cursor-pointer group h-full min-h-[250px]">
                                <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors text-gray-400">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-300 group-hover:text-white">Yeni Üye Ekle</h3>
                                <p className="text-sm text-gray-500 px-4">Projeye yeni bir ekip arkadaşı davet et.</p>
                            </div>
                        </div>
                    )}

                </>
            )}
        </div>
    );
};

export default ProjectDetail;