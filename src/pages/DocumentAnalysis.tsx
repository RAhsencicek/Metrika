import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FileText,
    File,
    FileSpreadsheet,
    Presentation,
    CheckCircle,
    AlertOctagon,
    List,
    ArrowLeft,
    Download,
    Share2,
    Save,
    Check,
    Loader2,
    Clock,
    Brain,
    Eye,
    AlertTriangle,
    Plus,
    Upload,
    Sparkles,
    StickyNote,
    User,
    Target,
} from 'lucide-react';
import { useDocumentStore, useNotificationStore, useTaskStore } from '../store';
import ShareAnalysisModal from '../components/ShareAnalysisModal';
import CreateTaskFromDocModal from '../components/CreateTaskFromDocModal';
import DocumentUploadModal from '../components/DocumentUploadModal';
import { PriorityDropdown } from '../components/CustomDropdown';
import ActionCard from '../components/ActionCard';
import EmptyState from '../components/EmptyState';
import UndoToast from '../components/UndoToast';
import LinkedTasksCard from '../components/LinkedTasksCard';

const DocumentAnalysis: React.FC = () => {
    const navigate = useNavigate();
    const { id: urlAnalysisId } = useParams<{ id: string }>();

    const {
        currentAnalysis,
        analyses,
        saveAnalysis,
        downloadDocument,
        setCurrentAnalysis,
        addCustomAction,
        removeCustomAction,
        markCustomActionAsTask,
        getAnalysisById,
    } = useDocumentStore();
    const { addNotification } = useNotificationStore();
    const { addTask } = useTaskStore();

    // Modal states
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [createAllTasks, setCreateAllTasks] = useState(false);
    const [selectedActionId, setSelectedActionId] = useState<string | undefined>();
    const [selectedActionText, setSelectedActionText] = useState<string | undefined>();

    const [newActionText, setNewActionText] = useState('');
    const [newActionPriority, setNewActionPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [isCustomActionProcessing, setIsCustomActionProcessing] = useState<string | null>(null);

    // Animation states
    const [newlyAddedActionId, setNewlyAddedActionId] = useState<string | null>(null);
    const [taskCreatedActionId, setTaskCreatedActionId] = useState<string | null>(null);

    // Undo state for deleted actions
    const [deletedAction, setDeletedAction] = useState<{
        id: string;
        text: string;
        priority: 'low' | 'medium' | 'high';
        analysisId: string;
    } | null>(null);
    const [showUndoToast, setShowUndoToast] = useState(false);

    // Get customActions from the current analysis (from store, persisted)
    const customActions = currentAnalysis?.customActions || [];

    // Loading states
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Keep track of currentAnalysis ID to avoid infinite loops
    const currentAnalysisIdRef = useRef<string | null>(currentAnalysis?.id ?? null);

    // Sync currentAnalysis with analyses array on every page load/navigation
    // This ensures customActions and other updates persist correctly
    useEffect(() => {
        if (analyses.length > 0) {
            // URL'deki id parametresi varsa, o analizi yükle
            if (urlAnalysisId) {
                const analysisFromUrl = getAnalysisById(urlAnalysisId);
                if (analysisFromUrl && currentAnalysisIdRef.current !== urlAnalysisId) {
                    currentAnalysisIdRef.current = urlAnalysisId;
                    setCurrentAnalysis(analysisFromUrl);
                    return;
                }
            }

            const currentId = currentAnalysis?.id;

            if (currentId) {
                // Find the matching analysis from the persisted array
                const syncedAnalysis = analyses.find(a => a.id === currentId);
                if (syncedAnalysis) {
                    // Only update if the reference has changed (prevents infinite loop)
                    if (currentAnalysisIdRef.current !== currentId ||
                        syncedAnalysis !== currentAnalysis) {
                        currentAnalysisIdRef.current = currentId;
                        setCurrentAnalysis(syncedAnalysis);
                    }
                }
            } else {
                // No current analysis, select the first one
                currentAnalysisIdRef.current = analyses[0].id;
                setCurrentAnalysis(analyses[0]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [analyses, urlAnalysisId]);

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

    // Add custom action (now using store)
    const handleAddCustomAction = () => {
        if (!newActionText.trim() || !analysis) return;

        const newAction = addCustomAction(analysis.id, {
            text: newActionText.trim(),
            priority: newActionPriority,
        });

        // Trigger animation for newly added action
        setNewlyAddedActionId(newAction.id);
        setTimeout(() => setNewlyAddedActionId(null), 600);

        setNewActionText('');
        setNewActionPriority('medium');

        addNotification({
            type: 'success',
            title: 'Aksiyon Eklendi',
            message: 'Tasarlanan aksiyonunuz listeye eklendi.',
        });
    };

    // Remove custom action with Undo support
    const handleRemoveCustomAction = (actionId: string) => {
        if (!analysis) return;

        // Find the action being deleted for potential undo
        const actionToDelete = customActions.find(a => a.id === actionId);
        if (actionToDelete) {
            setDeletedAction({
                id: actionToDelete.id,
                text: actionToDelete.text,
                priority: actionToDelete.priority,
                analysisId: analysis.id,
            });
            setShowUndoToast(true);
        }

        removeCustomAction(analysis.id, actionId);
    };

    // Handle undo action
    const handleUndoDelete = () => {
        if (!deletedAction) return;

        // Re-add the deleted action
        addCustomAction(deletedAction.analysisId, {
            text: deletedAction.text,
            priority: deletedAction.priority,
        });

        setDeletedAction(null);
        setShowUndoToast(false);

        addNotification({
            type: 'success',
            title: 'Geri Alındı',
            message: 'Silinen aksiyon geri getirildi.',
        });
    };

    // Handle dismiss undo toast
    const handleDismissUndo = () => {
        setDeletedAction(null);
        setShowUndoToast(false);
    };

    // Create task from custom action - actually creates the task!
    const handleCreateCustomTask = async (actionId: string, actionText: string, actionPriority: 'low' | 'medium' | 'high') => {
        if (!analysis) return;

        setIsCustomActionProcessing(actionId);

        try {
            // Create the actual task in the task store
            const newTask = await addTask({
                title: actionText,
                description: `Bu görev "${analysis.document.name}" dokümanından kullanıcı tarafından oluşturulmuştur.`,
                status: 'Todo',
                priority: actionPriority === 'high' ? 'High' : actionPriority === 'medium' ? 'Medium' : 'Low',
                projectIds: analysis.document.projectId ? [analysis.document.projectId] : [], // Array olarak güncellendi
                assigneeId: '',
                documentIds: [analysis.document.id], // Doküman bağlantısı
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                tags: ['Doküman Analizi', 'Tasarlanan Aksiyon'],
                estimatedHours: 4,
                loggedHours: 0,
            });

            // Trigger success animation
            setTaskCreatedActionId(actionId);

            // Wait for animation then mark as task
            setTimeout(() => {
                markCustomActionAsTask(analysis.id, actionId, newTask.id);
                setTaskCreatedActionId(null);
            }, 700);

            addNotification({
                type: 'success',
                title: 'Görev Oluşturuldu',
                message: `"${actionText}" görevi başarıyla oluşturuldu.`,
                actionUrl: `/tasks/${newTask.id}`,
            });
        } catch {
            addNotification({
                type: 'error',
                title: 'Hata',
                message: 'Görev oluşturulamadı.',
            });
        } finally {
            setIsCustomActionProcessing(null);
        }
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

    // Get document type icon with appropriate color
    const getDocumentIcon = (type: string | undefined) => {
        const iconClass = "w-16 h-16 mb-4 z-10";
        switch (type) {
            case 'PDF':
                return <FileText className={`${iconClass} text-red-400`} />;
            case 'DOCX':
                return <File className={`${iconClass} text-blue-400`} />;
            case 'XLSX':
                return <FileSpreadsheet className={`${iconClass} text-green-400`} />;
            case 'PPTX':
                return <Presentation className={`${iconClass} text-orange-400`} />;
            case 'TXT':
                return <FileText className={`${iconClass} text-gray-400`} />;
            default:
                return <FileText className={`${iconClass} text-primary`} />;
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
                        {getDocumentIcon(document?.type)}
                        <p className="text-gray-400 text-sm z-10 text-center px-4">{document?.name}</p>
                        <div className="flex items-center gap-2 z-10 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${document?.type === 'PDF' ? 'bg-red-500/20 text-red-400' :
                                document?.type === 'DOCX' ? 'bg-blue-500/20 text-blue-400' :
                                    document?.type === 'XLSX' ? 'bg-green-500/20 text-green-400' :
                                        document?.type === 'PPTX' ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-gray-500/20 text-gray-400'
                                }`}>
                                {document?.type}
                            </span>
                            <span className="text-xs text-gray-600">{document?.sizeFormatted}</span>
                        </div>

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

                    {/* Linked Tasks Card */}
                    <LinkedTasksCard
                        documentId={document?.id || ''}
                        documentName={document?.name || ''}
                    />
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
                                    {analysis.suggestedActions.length === 0 ? (
                                        <EmptyState
                                            variant="no-actions"
                                            className="py-6"
                                        />
                                    ) : (
                                        analysis.suggestedActions.map((action, index) => (
                                            <ActionCard
                                                key={action.id}
                                                id={action.id}
                                                text={action.text}
                                                priority={action.priority}
                                                addedAsTask={action.addedAsTask}
                                                taskId={action.taskId}
                                                type="ai"
                                                index={index}
                                                onCreateTask={(id, text) => handleCreateTask(id, text)}
                                                onViewTask={(taskId) => navigate(`/tasks/${taskId}`)}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Column 2: User's Custom Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-emerald-400 flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        Tasarlanan Aksiyonlar
                                    </h4>
                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                                        {customActions.length} aksiyon
                                    </span>
                                </div>

                                {/* Add New Action Form */}
                                <div className="p-4 bg-dark-700/50 rounded-xl border-2 border-dashed border-dark-500 hover:border-emerald-500/50 transition-colors">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newActionText}
                                                onChange={(e) => setNewActionText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomAction()}
                                                placeholder="Yeni aksiyon ekle..."
                                                className="flex-1 bg-dark-900/50 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                                            />
                                            <button
                                                onClick={handleAddCustomAction}
                                                disabled={!newActionText.trim()}
                                                className="p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400 shrink-0">Öncelik:</span>
                                            <div className="flex-1 max-w-[200px]">
                                                <PriorityDropdown
                                                    value={newActionPriority}
                                                    onChange={(val) => setNewActionPriority(val as 'low' | 'medium' | 'high')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-3">
                                        💡 Dokümanla ilgili notlarınızı ve aksiyon önerilerinizi ekleyin
                                    </p>
                                </div>

                                {/* Custom Post-it Cards */}
                                <div className="space-y-3 min-h-[150px]">
                                    {customActions.length === 0 ? (
                                        <EmptyState
                                            variant="no-custom-actions"
                                            className="py-6"
                                        />
                                    ) : (
                                        customActions.map((action, index) => (
                                            <ActionCard
                                                key={action.id}
                                                id={action.id}
                                                text={action.text}
                                                priority={action.priority}
                                                addedAsTask={action.addedAsTask}
                                                taskId={action.taskId}
                                                type="custom"
                                                index={index}
                                                isProcessing={isCustomActionProcessing === action.id}
                                                isNewlyAdded={newlyAddedActionId === action.id}
                                                isBeingConverted={taskCreatedActionId === action.id}
                                                onCreateTask={handleCreateCustomTask}
                                                onViewTask={(taskId) => navigate(`/tasks/${taskId}`)}
                                                onRemove={handleRemoveCustomAction}
                                            />
                                        ))
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

            {/* Undo Toast for deleted actions */}
            <UndoToast
                message={`"${deletedAction?.text?.substring(0, 30)}${(deletedAction?.text?.length || 0) > 30 ? '...' : ''}" silindi`}
                isVisible={showUndoToast}
                onUndo={handleUndoDelete}
                onDismiss={handleDismissUndo}
                duration={5000}
            />
        </div>
    );
};

export default DocumentAnalysis;