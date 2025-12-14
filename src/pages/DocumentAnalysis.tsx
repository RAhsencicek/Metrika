import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    CheckCircle,
    AlertOctagon,
    List,
    ArrowLeft,
    Download,
    Share2,
    Save,
    Check,
    Loader2,
    ExternalLink,
    Clock,
    Brain,
    Eye,
    AlertTriangle,
    Plus,
    Upload,
    Sparkles,
    StickyNote,
    Trash2,
    GripVertical,
    User,
    Target,
} from 'lucide-react';
import { useDocumentStore, useNotificationStore } from '../store';
import ShareAnalysisModal from '../components/ShareAnalysisModal';
import CreateTaskFromDocModal from '../components/CreateTaskFromDocModal';
import DocumentUploadModal from '../components/DocumentUploadModal';

const DocumentAnalysis: React.FC = () => {
    const navigate = useNavigate();
    const {
        currentAnalysis,
        analyses,
        saveAnalysis,
        downloadDocument,
        setCurrentAnalysis,
    } = useDocumentStore();
    const { addNotification } = useNotificationStore();

    // Modal states
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [createAllTasks, setCreateAllTasks] = useState(false);
    const [selectedActionId, setSelectedActionId] = useState<string | undefined>();
    const [selectedActionText, setSelectedActionText] = useState<string | undefined>();

    // Custom actions state (user's own actions)
    const [customActions, setCustomActions] = useState<Array<{
        id: string;
        text: string;
        priority: 'low' | 'medium' | 'high';
        addedAsTask: boolean;
        taskId?: string;
    }>>([]);
    const [newActionText, setNewActionText] = useState('');
    const [newActionPriority, setNewActionPriority] = useState<'low' | 'medium' | 'high'>('medium');

    // Loading states
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Auto-select first analysis if none is selected (handles hydration from localStorage)
    useEffect(() => {
        if (!currentAnalysis && analyses.length > 0) {
            setCurrentAnalysis(analyses[0]);
        }
    }, [currentAnalysis, analyses, setCurrentAnalysis]);

    // Get current analysis data
    const analysis = currentAnalysis;
    const document = analysis?.document;

    // Handle save
    const handleSave = async () => {
        if (!analysis) return;

        setIsSaving(true);
        try {
            // Simulate network delay for realism
            await new Promise((resolve) => setTimeout(resolve, 800));
            saveAnalysis(analysis.id);
            addNotification({
                type: 'success',
                title: 'Kaydedildi',
                message: 'Analiz başarıyla kaydedildi.',
            });
        } catch {
            addNotification({
                type: 'error',
                title: 'Hata',
                message: 'Analiz kaydedilemedi.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Handle download
    const handleDownload = async () => {
        if (!document) return;

        setIsDownloading(true);
        try {
            await downloadDocument(document.id);
            addNotification({
                type: 'success',
                title: 'İndirme Başladı',
                message: `${document.name} indiriliyor...`,
            });
        } catch {
            addNotification({
                type: 'error',
                title: 'Hata',
                message: 'Dosya indirilemedi.',
            });
        } finally {
            setIsDownloading(false);
        }
    };

    // Handle share
    const handleShare = () => {
        setIsShareModalOpen(true);
    };

    // Handle create task from single action
    const handleCreateTask = (actionId: string, actionText: string) => {
        setSelectedActionId(actionId);
        setSelectedActionText(actionText);
        setCreateAllTasks(false);
        setIsTaskModalOpen(true);
    };

    // Handle create all tasks
    const handleCreateAllTasks = () => {
        setSelectedActionId(undefined);
        setSelectedActionText(undefined);
        setCreateAllTasks(true);
        setIsTaskModalOpen(true);
    };

    // Add custom action
    const handleAddCustomAction = () => {
        if (!newActionText.trim()) return;

        const newAction = {
            id: `custom-${crypto.randomUUID()}`,
            text: newActionText.trim(),
            priority: newActionPriority,
            addedAsTask: false,
        };

        setCustomActions(prev => [...prev, newAction]);
        setNewActionText('');
        setNewActionPriority('medium');

        addNotification({
            type: 'success',
            title: 'Aksiyon Eklendi',
            message: 'Kendi aksiyonunuz listeye eklendi.',
        });
    };

    // Remove custom action
    const handleRemoveCustomAction = (actionId: string) => {
        setCustomActions(prev => prev.filter(a => a.id !== actionId));
    };

    // Create task from custom action
    const handleCreateCustomTask = (actionId: string, actionText: string) => {
        setSelectedActionId(actionId);
        setSelectedActionText(actionText);
        setCreateAllTasks(false);
        setIsTaskModalOpen(true);
    };

    // Handle view analysis from history
    const handleViewAnalysis = (analysisId: string) => {
        const selectedAnalysis = analyses.find((a) => a.id === analysisId);
        if (selectedAnalysis) {
            setCurrentAnalysis(selectedAnalysis);
            addNotification({
                type: 'info',
                title: 'Analiz Yüklendi',
                message: `"${selectedAnalysis.document.name}" analizi görüntüleniyor.`,
            });
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Get risk badge color
    const getRiskBadgeColor = (level: string) => {
        switch (level) {
            case 'critical':
                return 'bg-red-500/20 text-red-400';
            case 'high':
                return 'bg-orange-500/20 text-orange-400';
            case 'medium':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'low':
                return 'bg-green-500/20 text-green-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    // Get pending actions count
    const pendingActionsCount = analysis?.suggestedActions.filter((a) => !a.addedAsTask).length || 0;

    if (!analysis) {
        return (
            <>
                <div className="pb-20 animate-fade-in">
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-gray-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Henüz Analiz Yok</h2>
                        <p className="text-gray-400 mb-8 text-center max-w-md">
                            Doküman analizi yapmak için bir dosya yükleyin.
                            Yapay zeka dokümanınızı analiz edecek ve önemli bilgileri çıkaracak.
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center font-medium"
                            >
                                <Upload className="w-5 h-5 mr-2" />
                                Doküman Yükle
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-dark-700 text-gray-300 px-6 py-3 rounded-lg hover:bg-dark-600 transition-colors"
                            >
                                Dashboard'a Dön
                            </button>
                        </div>
                    </div>
                </div>

                <DocumentUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                />
            </>
        );
    }

    return (
        <div className="pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="mr-4 p-2 bg-dark-800 rounded-lg hover:bg-dark-700 text-gray-400 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center">
                            <Brain className="w-6 h-6 mr-2 text-primary" />
                            Yapay Zeka Doküman Analizi
                        </h1>
                        <p className="text-sm text-gray-400">
                            Dokümanlarınızı yükleyin ve yapay zeka ile analiz edin.
                        </p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Yeni Doküman Yükle
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-dark-800 text-white px-4 py-2 rounded-lg text-sm border border-dark-600 hover:bg-dark-700 transition-colors flex items-center disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : analysis.savedAt ? (
                            <Check className="w-4 h-4 mr-2 text-green-400" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {isSaving ? 'Kaydediliyor...' : analysis.savedAt ? 'Kaydedildi' : 'Kaydet'}
                    </button>
                    <button
                        onClick={handleShare}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Analizi Paylaş
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Document Card */}
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 h-fit">
                    <div className="aspect-[3/4] bg-dark-900 rounded-lg border-2 border-dashed border-dark-600 flex flex-col items-center justify-center mb-6 relative group overflow-hidden">
                        {/* Mock Preview */}
                        <div className="absolute inset-0 bg-white opacity-5 p-8 text-[6px] text-black overflow-hidden leading-tight select-none">
                            lorem ipsum dolor sit amet consectetur adipiscing elit sed do
                            eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim
                            ad minim veniam quis nostrud exercitation ullamco laboris nisi ut
                            aliquip ex ea commodo consequat duis aute irure dolor in
                            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                            pariatur excepteur sint occaecat cupidatat non proident sunt in
                            culpa qui officia deserunt mollit anim id est laborum...
                        </div>
                        <FileText className="w-16 h-16 text-primary mb-4 z-10" />
                        <p className="text-gray-400 text-sm z-10 text-center px-4">{document?.name}</p>
                        <p className="text-xs text-gray-600 z-10">{document?.sizeFormatted}</p>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 space-x-4">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                                title="İndir"
                            >
                                {isDownloading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Download className="w-5 h-5" />
                                )}
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                                title="Paylaş"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Yükleme Tarihi</span>
                            <span className="text-white">{formatDate(document?.uploadDate || '')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Durum</span>
                            <span className="text-green-400 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Analiz Tamamlandı
                            </span>
                        </div>
                        {analysis.confidence && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Güvenilirlik</span>
                                <span className="text-primary font-medium">{analysis.confidence}%</span>
                            </div>
                        )}
                        {analysis.aiModel && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">AI Model</span>
                                <span className="text-gray-300 text-xs bg-dark-900 px-2 py-1 rounded">
                                    {analysis.aiModel}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle: Analysis Results */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary Card */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <List className="w-5 h-5 mr-2 text-primary" />
                            Yönetici Özeti
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm">{analysis.summary}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {analysis.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-dark-900 text-gray-400 px-3 py-1 rounded-full text-xs border border-dark-600 hover:border-primary/50 transition-colors cursor-default"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Findings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Positive Findings */}
                        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 border-l-4 border-l-green-500">
                            <h4 className="font-bold text-white mb-3 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                Öne Çıkan Bulgular
                                <span className="ml-2 bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                                    {analysis.findings.filter((f) => f.isPositive).length}
                                </span>
                            </h4>
                            <ul className="space-y-2">
                                {analysis.findings
                                    .filter((f) => f.isPositive)
                                    .map((finding) => (
                                        <li key={finding.id} className="flex items-start text-sm text-gray-400">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                                            <span>
                                                {finding.text}
                                                {finding.page && (
                                                    <span className="text-gray-600 ml-1">(Sayfa {finding.page})</span>
                                                )}
                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        </div>

                        {/* Risks */}
                        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 border-l-4 border-l-red-500">
                            <h4 className="font-bold text-white mb-3 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                                Tespit Edilen Riskler
                                {analysis.risks.some((r) => r.level === 'critical') && (
                                    <span className="ml-2 bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full">
                                        Kritik
                                    </span>
                                )}
                            </h4>
                            <ul className="space-y-2">
                                {analysis.risks.map((risk) => (
                                    <li key={risk.id} className="flex items-start text-sm text-gray-400">
                                        <AlertOctagon className="w-4 h-4 text-red-500 mr-2 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <span>{risk.description}</span>
                                            {risk.page && (
                                                <span className="text-gray-600 ml-1">(Sayfa {risk.page})</span>
                                            )}
                                            <span
                                                className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${getRiskBadgeColor(
                                                    risk.level
                                                )}`}
                                            >
                                                {risk.level === 'critical'
                                                    ? 'Kritik'
                                                    : risk.level === 'high'
                                                        ? 'Yüksek'
                                                        : risk.level === 'medium'
                                                            ? 'Orta'
                                                            : 'Düşük'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Action Items - Kanban Style with Post-it Design */}
                    <div className="bg-gradient-to-br from-dark-800 via-dark-800 to-dark-900 rounded-2xl p-6 border border-dark-600 shadow-xl">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                <StickyNote className="w-5 h-5 mr-2 text-yellow-400" />
                                Aksiyon Panosu
                                <Sparkles className="w-4 h-4 ml-2 text-yellow-400" />
                            </h3>
                            <button
                                onClick={handleCreateAllTasks}
                                disabled={pendingActionsCount === 0}
                                className="text-xs bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
                            >
                                <Target className="w-3.5 h-3.5 mr-1.5" />
                                Tümünü Görevlere Ekle ({pendingActionsCount})
                            </button>
                        </div>

                        {/* Kanban Board - 2 Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Column 1: AI Suggested Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-purple-400 flex items-center">
                                        <Brain className="w-4 h-4 mr-2" />
                                        AI Önerileri
                                    </h4>
                                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                                        {analysis.suggestedActions.length} öneri
                                    </span>
                                </div>

                                {/* Post-it Cards */}
                                <div className="space-y-3 min-h-[200px]">
                                    {analysis.suggestedActions.map((action, index) => {
                                        const colors = [
                                            'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
                                            'from-pink-500/20 to-pink-600/10 border-pink-500/30',
                                            'from-blue-500/20 to-blue-600/10 border-blue-500/30',
                                            'from-green-500/20 to-green-600/10 border-green-500/30',
                                            'from-orange-500/20 to-orange-600/10 border-orange-500/30',
                                        ];
                                        const colorClass = colors[index % colors.length];

                                        return (
                                            <div
                                                key={action.id}
                                                className={`
                                                    relative p-4 rounded-xl border-2 transition-all duration-300
                                                    bg-gradient-to-br ${colorClass}
                                                    ${action.addedAsTask
                                                        ? 'opacity-60 scale-[0.98]'
                                                        : 'hover:scale-[1.02] hover:shadow-lg cursor-pointer'
                                                    }
                                                    transform rotate-[${(index % 2 === 0 ? -1 : 1) * (Math.random() * 0.5)}deg]
                                                `}
                                                style={{
                                                    transform: `rotate(${(index % 2 === 0 ? -1 : 1) * 0.5}deg)`
                                                }}
                                            >
                                                {/* Grip handle */}
                                                <div className="absolute top-2 left-2 opacity-30">
                                                    <GripVertical className="w-3 h-3" />
                                                </div>

                                                {/* Priority indicator */}
                                                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${action.priority === 'high'
                                                        ? 'bg-red-500 animate-pulse'
                                                        : action.priority === 'medium'
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'
                                                    }`} />

                                                {/* Content */}
                                                <div className="pl-4">
                                                    <p className={`text-sm leading-relaxed ${action.addedAsTask
                                                            ? 'text-gray-500 line-through'
                                                            : 'text-gray-200'
                                                        }`}>
                                                        {action.text}
                                                    </p>

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${action.priority === 'high'
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : action.priority === 'medium'
                                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                                    : 'bg-green-500/20 text-green-400'
                                                            }`}>
                                                            {action.priority === 'high' ? '🔥 Yüksek' : action.priority === 'medium' ? '⚡ Orta' : '✨ Düşük'}
                                                        </span>

                                                        {action.addedAsTask ? (
                                                            <button
                                                                onClick={() => navigate(`/tasks/${action.taskId}`)}
                                                                className="text-green-400 hover:text-green-300 text-xs flex items-center font-medium"
                                                            >
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Görevi Gör
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCreateTask(action.id, action.text)}
                                                                className="text-primary hover:text-white text-xs flex items-center font-medium bg-primary/10 px-2 py-1 rounded-lg hover:bg-primary/20 transition"
                                                            >
                                                                <Plus className="w-3 h-3 mr-1" />
                                                                Görev Yap
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Column 2: User's Custom Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-emerald-400 flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        Kendi Aksiyonlarım
                                    </h4>
                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                                        {customActions.length} aksiyon
                                    </span>
                                </div>

                                {/* Add New Action Form */}
                                <div className="p-4 bg-dark-700/50 rounded-xl border-2 border-dashed border-dark-500 hover:border-emerald-500/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newActionText}
                                            onChange={(e) => setNewActionText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomAction()}
                                            placeholder="Yeni aksiyon ekle..."
                                            className="flex-1 bg-dark-900/50 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                                        />
                                        <select
                                            value={newActionPriority}
                                            onChange={(e) => setNewActionPriority(e.target.value as 'low' | 'medium' | 'high')}
                                            className="bg-dark-900/50 border border-dark-600 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                                        >
                                            <option value="low">Düşük</option>
                                            <option value="medium">Orta</option>
                                            <option value="high">Yüksek</option>
                                        </select>
                                        <button
                                            onClick={handleAddCustomAction}
                                            disabled={!newActionText.trim()}
                                            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-500">
                                        💡 AI önerilerine ek olarak kendi notlarınızı ekleyin
                                    </p>
                                </div>

                                {/* Custom Post-it Cards */}
                                <div className="space-y-3 min-h-[150px]">
                                    {customActions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center mb-3">
                                                <StickyNote className="w-6 h-6 text-gray-500" />
                                            </div>
                                            <p className="text-gray-500 text-sm">Henüz aksiyon eklenmedi</p>
                                            <p className="text-gray-600 text-xs mt-1">Yukarıdan yeni aksiyon ekleyebilirsiniz</p>
                                        </div>
                                    ) : (
                                        customActions.map((action, index) => {
                                            const colors = [
                                                'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
                                                'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
                                                'from-teal-500/20 to-teal-600/10 border-teal-500/30',
                                            ];
                                            const colorClass = colors[index % colors.length];

                                            return (
                                                <div
                                                    key={action.id}
                                                    className={`
                                                        relative p-4 rounded-xl border-2 transition-all duration-300
                                                        bg-gradient-to-br ${colorClass}
                                                        ${action.addedAsTask
                                                            ? 'opacity-60 scale-[0.98]'
                                                            : 'hover:scale-[1.02] hover:shadow-lg'
                                                        }
                                                    `}
                                                    style={{
                                                        transform: `rotate(${(index % 2 === 0 ? 1 : -1) * 0.5}deg)`
                                                    }}
                                                >
                                                    {/* Delete button */}
                                                    <button
                                                        onClick={() => handleRemoveCustomAction(action.id)}
                                                        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>

                                                    {/* Priority indicator */}
                                                    <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${action.priority === 'high'
                                                            ? 'bg-red-500 animate-pulse'
                                                            : action.priority === 'medium'
                                                                ? 'bg-yellow-500'
                                                                : 'bg-green-500'
                                                        }`} />

                                                    {/* Content */}
                                                    <div className="pl-4 pr-6">
                                                        <p className={`text-sm leading-relaxed ${action.addedAsTask
                                                                ? 'text-gray-500 line-through'
                                                                : 'text-gray-200'
                                                            }`}>
                                                            {action.text}
                                                        </p>

                                                        {/* Footer */}
                                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${action.priority === 'high'
                                                                    ? 'bg-red-500/20 text-red-400'
                                                                    : action.priority === 'medium'
                                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                                        : 'bg-green-500/20 text-green-400'
                                                                }`}>
                                                                {action.priority === 'high' ? '🔥 Yüksek' : action.priority === 'medium' ? '⚡ Orta' : '✨ Düşük'}
                                                            </span>

                                                            {!action.addedAsTask && (
                                                                <button
                                                                    onClick={() => handleCreateCustomTask(action.id, action.text)}
                                                                    className="text-emerald-400 hover:text-white text-xs flex items-center font-medium bg-emerald-500/10 px-2 py-1 rounded-lg hover:bg-emerald-500/20 transition"
                                                                >
                                                                    <Plus className="w-3 h-3 mr-1" />
                                                                    Görev Yap
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="mt-10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-400" />
                    Analiz Geçmişi
                </h3>
                <div className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-dark-900 text-gray-200 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Doküman Adı</th>
                                <th className="px-6 py-3">Tarih</th>
                                <th className="px-6 py-3">Tür</th>
                                <th className="px-6 py-3">Durum</th>
                                <th className="px-6 py-3 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700">
                            {analyses.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`hover:bg-dark-700/50 transition ${item.id === analysis.id ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <td className="px-6 py-4 font-medium text-white flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                        {item.document.name}
                                        {item.id === analysis.id && (
                                            <span className="ml-2 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">
                                                Aktif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{formatDate(item.analyzedAt)}</td>
                                    <td className="px-6 py-4">{item.document.type}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${item.status === 'completed'
                                                ? 'bg-green-500/10 text-green-400'
                                                : item.status === 'analyzing'
                                                    ? 'bg-yellow-500/10 text-yellow-400'
                                                    : item.status === 'failed'
                                                        ? 'bg-red-500/10 text-red-400'
                                                        : 'bg-gray-500/10 text-gray-400'
                                                }`}
                                        >
                                            {item.status === 'completed'
                                                ? 'Tamamlandı'
                                                : item.status === 'analyzing'
                                                    ? 'Analiz Ediliyor'
                                                    : item.status === 'failed'
                                                        ? 'Başarısız'
                                                        : 'Bekliyor'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleViewAnalysis(item.id)}
                                            disabled={item.id === analysis.id}
                                            className={`flex items-center ml-auto ${item.id === analysis.id
                                                ? 'text-gray-600 cursor-not-allowed'
                                                : 'text-primary hover:text-blue-400'
                                                }`}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Görüntüle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <ShareAnalysisModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                analysisId={analysis.id}
            />

            <CreateTaskFromDocModal
                isOpen={isTaskModalOpen}
                onClose={() => {
                    setIsTaskModalOpen(false);
                    setSelectedActionId(undefined);
                    setSelectedActionText(undefined);
                }}
                analysisId={analysis.id}
                actionId={selectedActionId}
                actionText={selectedActionText}
                createAll={createAllTasks}
            />

            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </div>
    );
};

export default DocumentAnalysis;