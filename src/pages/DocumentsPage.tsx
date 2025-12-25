import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    File,
    FileSpreadsheet,
    Presentation,
    Upload,
    Search,
    Filter,
    Grid3X3,
    List,
    MoreVertical,
    Download,
    Trash2,
    Eye,
    Brain,
    Clock,
    Folder,
    ChevronDown,
    Plus,
    Sparkles,
    ArrowUpDown,
    ArrowRight,
    Loader2,
} from 'lucide-react';
import { useDocumentStore, useProjectStore, useNotificationStore } from '../store';
import DocumentUploadModal from '../components/DocumentUploadModal';

type ViewMode = 'grid' | 'list';
type SortOption = 'date' | 'name' | 'size' | 'type';

// LocalStorage key for view preference
const VIEW_MODE_KEY = 'metrika-documents-view-mode';

const DocumentsPage: React.FC = () => {
    const navigate = useNavigate();
    const { documents, analyses, deleteDocument, triggerAnalysis, setCurrentAnalysis, fetchDocuments, isLoading } = useDocumentStore();
    const { projects, fetchProjects } = useProjectStore();
    const { addNotification } = useNotificationStore();

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    // Load view mode from localStorage or default to 'grid'
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem(VIEW_MODE_KEY);
        return (saved === 'list' || saved === 'grid') ? saved : 'grid';
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterProject, setFilterProject] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('date');
    const [sortAsc, setSortAsc] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Fetch documents from API on mount
    useEffect(() => {
        fetchDocuments();
        fetchProjects();
    }, [fetchDocuments, fetchProjects]);

    // Save view mode to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(VIEW_MODE_KEY, viewMode);
    }, [viewMode]);

    // Get file icon based on type
    const getFileIcon = (type: string, size: 'sm' | 'md' | 'lg' = 'lg') => {
        const sizeClasses = {
            sm: 'w-4 h-4',
            md: 'w-6 h-6',
            lg: 'w-8 h-8',
        };
        const iconSize = sizeClasses[size];

        switch (type) {
            case 'PDF':
                return <FileText className={`${iconSize} text-red-400`} />;
            case 'DOCX':
                return <File className={`${iconSize} text-blue-400`} />;
            case 'XLSX':
                return <FileSpreadsheet className={`${iconSize} text-green-400`} />;
            case 'PPTX':
                return <Presentation className={`${iconSize} text-orange-400`} />;
            default:
                return <FileText className={`${iconSize} text-gray-400`} />;
        }
    };

    // Get file type color
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'PDF':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'DOCX':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'XLSX':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'PPTX':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    // Get icon background color
    const getIconBgColor = (type: string) => {
        switch (type) {
            case 'PDF':
                return 'bg-red-500/10';
            case 'DOCX':
                return 'bg-blue-500/10';
            case 'XLSX':
                return 'bg-green-500/10';
            case 'PPTX':
                return 'bg-orange-500/10';
            default:
                return 'bg-gray-500/10';
        }
    };

    // Filter and sort documents
    const filteredDocuments = documents
        .filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || doc.type === filterType;
            const matchesProject = filterProject === 'all' ||
                (filterProject === 'none' && !doc.projectId) ||
                doc.projectId === filterProject;
            return matchesSearch && matchesType && matchesProject;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'date':
                    comparison = new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'size':
                    comparison = b.size - a.size;
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
            }
            return sortAsc ? -comparison : comparison;
        });

    // Check if document has analysis
    const hasAnalysis = (docId: string) => {
        return analyses.some(a => a.document.id === docId);
    };

    // Get analysis for document
    const getAnalysis = (docId: string) => {
        return analyses.find(a => a.document.id === docId);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Handle view analysis
    const handleViewAnalysis = (docId: string) => {
        const analysis = getAnalysis(docId);
        if (analysis) {
            setCurrentAnalysis(analysis);
            navigate('/documents/analysis');
        }
    };

    // Handle analyze document
    const handleAnalyze = async (docId: string) => {
        try {
            const analysis = await triggerAnalysis(docId);
            setCurrentAnalysis(analysis);
            addNotification({
                type: 'success',
                title: 'Analiz Başarılı',
                message: 'Doküman analiz edildi.',
            });
            navigate('/documents/analysis');
        } catch {
            addNotification({
                type: 'error',
                title: 'Analiz Hatası',
                message: 'Doküman analiz edilemedi.',
            });
        }
    };

    // Handle delete document
    const handleDelete = (e: React.MouseEvent, docId: string, docName: string) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm(`"${docName}" dokümanını silmek istediğinize emin misiniz?`)) {
            deleteDocument(docId);
            addNotification({
                type: 'success',
                title: 'Doküman Silindi',
                message: `"${docName}" başarıyla silindi.`,
            });
        }
        setActiveDropdown(null);
    };

    // Handle card click - navigate to analysis or trigger one
    const handleCardClick = (docId: string) => {
        if (hasAnalysis(docId)) {
            handleViewAnalysis(docId);
        } else {
            handleAnalyze(docId);
        }
    };

    // Get project name
    const getProjectName = (projectId?: string) => {
        if (!projectId) return null;
        const project = projects.find(p => p.id === projectId);
        return project?.title;
    };

    // Document types for filter
    const documentTypes = ['PDF', 'DOCX', 'XLSX', 'PPTX', 'TXT', 'Other'];

    return (
        <div className="pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <FileText className="w-6 h-6 mr-2 text-primary" />
                        Dokümanlar
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Tüm dokümanlarınızı yönetin ve AI ile analiz edin
                    </p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-gradient-to-r from-primary to-blue-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center font-medium hover:scale-[1.02]"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Yeni Doküman Yükle
                </button>
            </div>

            {/* Stats Cards - Dashboard style with effects */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div
                    onClick={() => { setFilterType('all'); setFilterProject('all'); }}
                    className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover-lift card-shine cursor-pointer animate-fade-in stagger-1"
                    style={{ animationFillMode: 'both' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400">Toplam Doküman</p>
                            <p className="text-2xl font-bold text-white mt-1 animate-count-up">{documents.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center icon-hover-bounce">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </div>
                <div
                    onClick={() => { setFilterType('all'); setFilterProject('all'); }}
                    className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover-lift card-shine cursor-pointer animate-fade-in stagger-2"
                    style={{ animationFillMode: 'both' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400">Analiz Edilmiş</p>
                            <p className="text-2xl font-bold text-white mt-1 animate-count-up" style={{ animationDelay: '0.1s' }}>{analyses.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center icon-hover-bounce">
                            <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                </div>
                <div
                    onClick={() => setFilterType('PDF')}
                    className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover-lift card-shine cursor-pointer animate-fade-in stagger-3"
                    style={{ animationFillMode: 'both' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400">PDF Dosyaları</p>
                            <p className="text-2xl font-bold text-white mt-1 animate-count-up" style={{ animationDelay: '0.2s' }}>
                                {documents.filter(d => d.type === 'PDF').length}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center icon-hover-bounce">
                            <FileText className="w-5 h-5 text-red-400" />
                        </div>
                    </div>
                </div>
                <div
                    onClick={() => setFilterType('all')}
                    className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover-lift card-shine cursor-pointer animate-fade-in stagger-4"
                    style={{ animationFillMode: 'both' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400">Diğer Formatlar</p>
                            <p className="text-2xl font-bold text-white mt-1 animate-count-up" style={{ animationDelay: '0.3s' }}>
                                {documents.filter(d => d.type !== 'PDF').length}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center icon-hover-bounce">
                            <File className="w-5 h-5 text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Doküman ara..."
                            className="w-full bg-dark-900/50 border border-dark-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        {/* Type Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className="flex items-center gap-2 bg-dark-900/50 border border-dark-600 rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:border-dark-500 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                Filtrele
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
                                    <div className="p-3 border-b border-dark-700">
                                        <p className="text-xs text-gray-400 uppercase font-medium">Dosya Türü</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => setFilterType('all')}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterType === 'all' ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-dark-700'}`}
                                        >
                                            Tümü
                                        </button>
                                        {documentTypes.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFilterType(type)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterType === type ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-dark-700'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-dark-700">
                                        <p className="text-xs text-gray-400 uppercase font-medium">Proje</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => setFilterProject('all')}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterProject === 'all' ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-dark-700'}`}
                                        >
                                            Tümü
                                        </button>
                                        <button
                                            onClick={() => setFilterProject('none')}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterProject === 'none' ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-dark-700'}`}
                                        >
                                            Projesiz
                                        </button>
                                        {projects.map(project => (
                                            <button
                                                key={project.id}
                                                onClick={() => setFilterProject(project.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate ${filterProject === project.id ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-dark-700'}`}
                                            >
                                                {project.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    const sortOptions: SortOption[] = ['date', 'name', 'size', 'type'];
                                    const currentIndex = sortOptions.indexOf(sortBy);
                                    const nextIndex = (currentIndex + 1) % sortOptions.length;
                                    setSortBy(sortOptions[nextIndex]);
                                }}
                                className="flex items-center gap-2 bg-dark-900/50 border border-dark-600 rounded-l-lg px-4 py-2.5 text-sm text-gray-300 hover:border-dark-500 transition-colors"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                {sortBy === 'date' ? 'Tarih' : sortBy === 'name' ? 'Ad' : sortBy === 'size' ? 'Boyut' : 'Tür'}
                            </button>
                            <button
                                onClick={() => setSortAsc(!sortAsc)}
                                className={`bg-dark-900/50 border border-dark-600 rounded-r-lg px-2.5 py-2.5 text-sm transition-colors ${sortAsc ? 'text-primary border-primary/50' : 'text-gray-300 hover:border-dark-500'}`}
                                title={sortAsc ? 'Artan Sıralama' : 'Azalan Sıralama'}
                            >
                                {sortAsc ? '↑' : '↓'}
                            </button>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-dark-900/50 border border-dark-600 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents Display */}
            {isLoading ? (
                <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
                    <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-white mb-2">Dokümanlar Yükleniyor...</h3>
                    <p className="text-gray-400 text-sm">Lütfen bekleyin</p>
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center hover-lift">
                    <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        {documents.length === 0 ? 'Henüz Doküman Yok' : 'Doküman Bulunamadı'}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                        {documents.length === 0
                            ? 'İlk dokümanınızı yükleyerek başlayın'
                            : 'Arama kriterlerinize uygun doküman bulunamadı'
                        }
                    </p>
                    {documents.length === 0 && (
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center hover:scale-[1.02]"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Doküman Yükle
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid View - Dashboard style cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDocuments.map((doc, index) => (
                        <div
                            key={doc.id}
                            onClick={() => handleCardClick(doc.id)}
                            className="group bg-dark-800 rounded-xl border border-dark-700 overflow-hidden hover:border-primary/50 transition-all cursor-pointer hover-lift card-shine animate-fade-in"
                            style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
                        >
                            {/* Preview Area */}
                            <div className="relative aspect-[4/3] bg-dark-900/50 flex items-center justify-center border-b border-dark-700">
                                <div className={`w-16 h-16 ${getIconBgColor(doc.type)} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    {getFileIcon(doc.type)}
                                </div>

                                {/* Hover Overlay with Actions */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        {hasAnalysis(doc.id) ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleViewAnalysis(doc.id); }}
                                                className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 text-white transition-all hover:scale-110"
                                                title="Analizi Görüntüle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAnalyze(doc.id); }}
                                                className="p-2.5 bg-purple-500/20 backdrop-blur-sm rounded-full hover:bg-purple-500/40 text-purple-300 transition-all hover:scale-110"
                                                title="AI ile Analiz Et"
                                            >
                                                <Brain className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(e, doc.id, doc.name)}
                                            className="p-2.5 bg-red-500/20 backdrop-blur-sm rounded-full hover:bg-red-500/40 text-red-300 transition-all hover:scale-110"
                                            title="Sil"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-white/70 text-center">Tıklayarak görüntüle</p>
                                </div>

                                {/* Analysis Badge */}
                                {hasAnalysis(doc.id) && (
                                    <div className="absolute top-3 right-3 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-2 py-1 flex items-center animate-pulse">
                                        <Sparkles className="w-3 h-3 text-purple-400 mr-1" />
                                        <span className="text-[10px] text-purple-400 font-medium">Analiz Edildi</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h4 className="font-medium text-white text-sm truncate mb-2 group-hover:text-primary transition-colors" title={doc.name}>
                                    {doc.name}
                                </h4>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span className={`px-2 py-0.5 rounded-full border ${getTypeColor(doc.type)}`}>
                                        {doc.type}
                                    </span>
                                    <span>{doc.sizeFormatted}</span>
                                </div>
                                {getProjectName(doc.projectId) && (
                                    <div className="mt-2 flex items-center text-xs text-gray-400">
                                        <Folder className="w-3 h-3 mr-1" />
                                        <span className="truncate">{getProjectName(doc.projectId)}</span>
                                    </div>
                                )}
                                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {formatDate(doc.uploadDate)}
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View - Clickable rows with effects */
                <div className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-dark-900 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Doküman</th>
                                <th className="px-4 py-3">Tür</th>
                                <th className="px-4 py-3">Boyut</th>
                                <th className="px-4 py-3">Proje</th>
                                <th className="px-4 py-3">Tarih</th>
                                <th className="px-4 py-3">Durum</th>
                                <th className="px-4 py-3 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700">
                            {filteredDocuments.map((doc, index) => (
                                <tr
                                    key={doc.id}
                                    onClick={() => handleCardClick(doc.id)}
                                    className="hover:bg-dark-700/50 transition-all cursor-pointer group animate-fade-in"
                                    style={{ animationDelay: `${index * 0.03}s`, animationFillMode: 'both' }}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 ${getIconBgColor(doc.type)} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                                {getFileIcon(doc.type, 'md')}
                                            </div>
                                            <span className="text-white font-medium truncate max-w-[200px] group-hover:text-primary transition-colors">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs border ${getTypeColor(doc.type)}`}>
                                            {doc.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{doc.sizeFormatted}</td>
                                    <td className="px-4 py-3 text-gray-400">
                                        {getProjectName(doc.projectId) || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{formatDate(doc.uploadDate)}</td>
                                    <td className="px-4 py-3">
                                        {hasAnalysis(doc.id) ? (
                                            <span className="flex items-center text-purple-400 text-xs">
                                                <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
                                                Analiz Edildi
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 text-xs">Analiz Bekleniyor</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            {hasAnalysis(doc.id) ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewAnalysis(doc.id); }}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110"
                                                    title="Analizi Görüntüle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleAnalyze(doc.id); }}
                                                    className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all hover:scale-110"
                                                    title="AI ile Analiz Et"
                                                >
                                                    <Brain className="w-4 h-4" />
                                                </button>
                                            )}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === doc.id ? null : doc.id); }}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-all hover:scale-110"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                                {activeDropdown === doc.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-40 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-10 overflow-hidden animate-fade-in">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Download functionality
                                                                setActiveDropdown(null);
                                                            }}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-dark-700"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            İndir
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(e, doc.id, doc.name)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Sil
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Upload Modal */}
            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />

            {/* Click outside to close dropdowns */}
            {(activeDropdown || showFilterMenu) && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                        setActiveDropdown(null);
                        setShowFilterMenu(false);
                    }}
                />
            )}
        </div>
    );
};

export default DocumentsPage;
