import React, { useState, useRef, useCallback } from 'react';
import {
    X,
    Upload,
    FileText,
    File,
    FileSpreadsheet,
    Presentation,
    Loader2,
    Check,
    AlertCircle,
    Trash2,
    Brain,
    Sparkles,
    CloudUpload,
    FolderOpen
} from 'lucide-react';
import { useDocumentStore, useNotificationStore, useUserStore, useProjectStore } from '../store';
import { uploadDocument } from '../services/documentApi';
import type { DocumentType } from '../store/documentStore';
import { ProjectDropdown } from './CustomDropdown';

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete?: (documentId: string) => void;
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error';
    error?: string;
    documentId?: string;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
    isOpen,
    onClose,
    onUploadComplete
}) => {
    // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
    const { addDocument, triggerAnalysis, setCurrentAnalysis } = useDocumentStore();
    const { addNotification } = useNotificationStore();
    const { currentUser } = useUserStore();
    const { projects } = useProjectStore();

    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [autoAnalyze, setAutoAnalyze] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get icon for file type
    const getFileIcon = useCallback((fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return <FileText className="w-8 h-8 text-red-400" />;
            case 'doc':
            case 'docx':
                return <File className="w-8 h-8 text-blue-400" />;
            case 'xls':
            case 'xlsx':
                return <FileSpreadsheet className="w-8 h-8 text-green-400" />;
            case 'ppt':
            case 'pptx':
                return <Presentation className="w-8 h-8 text-orange-400" />;
            default:
                return <FileText className="w-8 h-8 text-gray-400" />;
        }
    }, []);

    // Get document type from file extension
    const getDocumentType = useCallback((fileName: string): DocumentType => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return 'PDF';
            case 'doc':
            case 'docx':
                return 'DOCX';
            case 'xls':
            case 'xlsx':
                return 'XLSX';
            case 'ppt':
            case 'pptx':
                return 'PPTX';
            case 'txt':
                return 'TXT';
            default:
                return 'Other';
        }
    }, []);

    // Format file size
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }, []);

    // Process a single file with REAL backend upload
    const processFile = useCallback(async (uploadingFile: UploadingFile) => {
        try {
            // Upload file to backend with real progress tracking
            const uploadedDocument = await uploadDocument(
                {
                    file: uploadingFile.file,
                    fileName: uploadingFile.file.name,
                    fileType: getDocumentType(uploadingFile.file.name),
                    uploaderId: currentUser?.id || '1',
                    projectId: selectedProjectId,
                },
                // Progress callback
                (progress) => {
                    setUploadingFiles(prev =>
                        prev.map(f =>
                            f.id === uploadingFile.id
                                ? { ...f, progress }
                                : f
                        )
                    );
                }
            );

            // Update status to processing
            setUploadingFiles(prev =>
                prev.map(f =>
                    f.id === uploadingFile.id
                        ? { ...f, status: 'processing', progress: 100 }
                        : f
                )
            );

            // Add document to store with backend response
            const newDocument = addDocument({
                id: uploadedDocument.id, // Use ID from backend
                name: uploadedDocument.name,
                type: uploadedDocument.type,
                size: uploadedDocument.size,
                sizeFormatted: formatFileSize(uploadedDocument.size),
                url: uploadedDocument.url, // URL from backend (e.g., S3 URL)
                uploaderId: currentUser?.id || '1',
                projectId: selectedProjectId || undefined,
                tags: [],
            });

            setUploadingFiles(prev =>
                prev.map(f =>
                    f.id === uploadingFile.id
                        ? { ...f, documentId: newDocument.id }
                        : f
                )
            );

            // If auto-analyze is enabled, trigger analysis
            if (autoAnalyze) {
                setUploadingFiles(prev =>
                    prev.map(f =>
                        f.id === uploadingFile.id
                            ? { ...f, status: 'analyzing' }
                            : f
                    )
                );

                try {
                    const analysis = await triggerAnalysis(newDocument.id);
                    setCurrentAnalysis(analysis);
                } catch {
                    console.warn('Analiz başarısız oldu, doküman yine de eklendi.');
                }
            }

            // Mark as completed
            setUploadingFiles(prev =>
                prev.map(f =>
                    f.id === uploadingFile.id
                        ? { ...f, status: 'completed' }
                        : f
                )
            );

            addNotification({
                type: 'success',
                title: 'Doküman Yüklendi',
                message: `"${uploadingFile.file.name}" başarıyla yüklendi${autoAnalyze ? ' ve analiz edildi' : ''}.`,
            });

            if (onUploadComplete && newDocument.id) {
                onUploadComplete(newDocument.id);
            }

        } catch (error) {
            console.error('File upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Yükleme başarısız oldu';

            setUploadingFiles(prev =>
                prev.map(f =>
                    f.id === uploadingFile.id
                        ? { ...f, status: 'error', error: errorMessage }
                        : f
                )
            );

            addNotification({
                type: 'error',
                title: 'Yükleme Hatası',
                message: `"${uploadingFile.file.name}" yüklenirken bir hata oluştu: ${errorMessage}`,
            });
        }
    }, [addDocument, addNotification, autoAnalyze, currentUser?.id, formatFileSize, getDocumentType, onUploadComplete, selectedProjectId, setCurrentAnalysis, triggerAnalysis]);

    // Process files
    const handleFiles = useCallback(async (files: File[]) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain'
        ];

        const validFiles = files.filter(file => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            const validExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext || '');
            return allowedTypes.includes(file.type) || validExt;
        });

        if (validFiles.length !== files.length) {
            addNotification({
                type: 'warning',
                title: 'Desteklenmeyen Dosya',
                message: 'Bazı dosyalar desteklenmiyor. Sadece PDF, DOCX, XLSX, PPTX ve TXT dosyaları yüklenebilir.',
            });
        }

        if (validFiles.length === 0) return;

        const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
            id: crypto.randomUUID(),
            file,
            progress: 0,
            status: 'uploading'
        }));

        setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

        for (const uploadingFile of newUploadingFiles) {
            await processFile(uploadingFile);
        }
    }, [addNotification, processFile]);

    // Handle file drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, [handleFiles]);

    // Handle file selection
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }
    }, [handleFiles]);

    // Remove file from list
    const removeFile = useCallback((fileId: string) => {
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    // Handle close
    const handleClose = useCallback(() => {
        const isUploading = uploadingFiles.some(f =>
            f.status === 'uploading' || f.status === 'processing' || f.status === 'analyzing'
        );

        if (isUploading) {
            addNotification({
                type: 'warning',
                title: 'Yükleme Devam Ediyor',
                message: 'Dosya yüklenirken pencereyi kapatamazsınız.',
            });
            return;
        }

        setUploadingFiles([]);
        onClose();
    }, [addNotification, onClose, uploadingFiles]);

    // Get status text
    const getStatusText = useCallback((status: UploadingFile['status']) => {
        switch (status) {
            case 'uploading':
                return 'Yükleniyor...';
            case 'processing':
                return 'İşleniyor...';
            case 'analyzing':
                return 'AI ile analiz ediliyor...';
            case 'completed':
                return 'Tamamlandı';
            case 'error':
                return 'Hata';
        }
    }, []);

    // Get status color
    const getStatusColor = useCallback((status: UploadingFile['status']) => {
        switch (status) {
            case 'uploading':
            case 'processing':
                return 'text-blue-400';
            case 'analyzing':
                return 'text-purple-400';
            case 'completed':
                return 'text-green-400';
            case 'error':
                return 'text-red-400';
        }
    }, []);

    // NOW we can have conditional return AFTER all hooks
    if (!isOpen) return null;

    const completedCount = uploadingFiles.filter(f => f.status === 'completed').length;
    const hasFiles = uploadingFiles.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with gradient */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-purple-900/30 backdrop-blur-md"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl border border-dark-600/50 w-full max-w-2xl mx-4 animate-fade-in shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Decorative gradient line at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-dark-700/50 shrink-0">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mr-4 border border-blue-500/20">
                            <CloudUpload className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center">
                                Doküman Yükle
                                <Sparkles className="w-4 h-4 ml-2 text-yellow-400" />
                            </h2>
                            <p className="text-sm text-gray-400">
                                AI destekli doküman analizi için dosyalarınızı yükleyin
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-dark-700 rounded-xl transition-all hover:rotate-90 duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1">
                    {/* Settings Row */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* Project Selection */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                                <FolderOpen className="w-4 h-4 mr-2 text-gray-400" />
                                Proje (Opsiyonel)
                            </label>
                            <ProjectDropdown
                                projects={projects}
                                value={selectedProjectId}
                                onChange={setSelectedProjectId}
                                showOptional={true}
                            />
                        </div>

                        {/* Auto Analyze Toggle */}
                        <div className="flex items-end pb-1">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={autoAnalyze}
                                    onChange={(e) => setAutoAnalyze(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`relative w-14 h-7 rounded-full transition-all duration-300 ${autoAnalyze
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30'
                                    : 'bg-dark-600'
                                    }`}>
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${autoAnalyze ? 'translate-x-8' : 'translate-x-1'
                                        }`} />
                                </div>
                                <span className="ml-3 text-sm text-gray-300 flex items-center group-hover:text-white transition-colors">
                                    <Brain className={`w-4 h-4 mr-1.5 transition-colors ${autoAnalyze ? 'text-purple-400' : 'text-gray-500'
                                        }`} />
                                    AI Analizi
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Drop Zone - Enhanced Design */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        className={`
                            relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 overflow-hidden
                            ${isDragging
                                ? 'border-primary bg-primary/10 scale-[1.02] shadow-xl shadow-primary/20'
                                : 'border-dark-500 hover:border-primary/50 hover:bg-dark-700/30'
                            }
                        `}
                    >
                        {/* Clickable file input - covers entire drop zone */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            style={{ zIndex: 20 }}
                        />

                        {/* Background pattern - non-interactive */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                                backgroundSize: '24px 24px'
                            }} />
                        </div>

                        {/* Content - all non-interactive */}
                        <div className="pointer-events-none relative z-10">
                            <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragging
                                ? 'bg-gradient-to-br from-primary/30 to-purple-500/30 scale-110'
                                : 'bg-dark-700'
                                }`}>
                                <Upload className={`w-10 h-10 transition-all duration-300 ${isDragging ? 'text-primary scale-110' : 'text-gray-400'
                                    }`} />
                                {isDragging && (
                                    <div className="absolute inset-0 rounded-2xl animate-ping bg-primary/20" />
                                )}
                            </div>

                            <p className="text-lg font-semibold text-white mb-2">
                                {isDragging ? '✨ Dosyayı Bırakın' : 'Dosyalarınızı Sürükleyin'}
                            </p>
                            <p className="text-gray-400">
                                veya <span className="text-primary font-medium hover:underline">bilgisayarınızdan seçin</span>
                            </p>

                            {/* File type badges */}
                            <div className="flex flex-wrap justify-center gap-2 mt-5">
                                {['PDF', 'DOCX', 'XLSX', 'PPTX', 'TXT'].map((type) => (
                                    <span
                                        key={type}
                                        className="px-3 py-1 bg-dark-700/80 text-gray-400 text-xs rounded-full border border-dark-600"
                                    >
                                        {type}
                                    </span>
                                ))}
                            </div>

                            <p className="text-xs text-gray-500 mt-4">
                                Maksimum dosya boyutu: 25 MB
                            </p>
                        </div>
                    </div>

                    {/* File List - Outside drop zone */}
                    {hasFiles && (
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-white flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                    Yüklenen Dosyalar
                                </h4>
                                {completedCount > 0 && (
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full">
                                        ✓ {completedCount}/{uploadingFiles.length} tamamlandı
                                    </span>
                                )}
                            </div>

                            {uploadingFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className={`
                                        flex items-center p-4 rounded-xl border transition-all duration-300
                                        ${file.status === 'completed'
                                            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/30'
                                            : file.status === 'error'
                                                ? 'bg-gradient-to-r from-red-500/10 to-rose-500/5 border-red-500/30'
                                                : file.status === 'analyzing'
                                                    ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/5 border-purple-500/30'
                                                    : 'bg-dark-800/80 border-dark-600'
                                        }
                                    `}
                                >
                                    {/* File Icon */}
                                    <div className="shrink-0 mr-4">
                                        <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center">
                                            {getFileIcon(file.file.name)}
                                        </div>
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {file.file.name}
                                        </p>
                                        <div className="flex items-center mt-1.5">
                                            <span className="text-xs text-gray-500 mr-3">
                                                {formatFileSize(file.file.size)}
                                            </span>
                                            <span className={`text-xs font-medium ${getStatusColor(file.status)}`}>
                                                {getStatusText(file.status)}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        {(file.status === 'uploading' || file.status === 'processing') && (
                                            <div className="mt-2.5 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-primary transition-all duration-300"
                                                    style={{ width: `${file.progress}%` }}
                                                />
                                            </div>
                                        )}

                                        {/* Analyzing animation */}
                                        {file.status === 'analyzing' && (
                                            <div className="mt-2.5 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse w-full" />
                                            </div>
                                        )}

                                        {file.status === 'error' && file.error && (
                                            <p className="text-xs text-red-400 mt-1.5">{file.error}</p>
                                        )}
                                    </div>

                                    {/* Status Icon / Actions */}
                                    <div className="shrink-0 ml-4 flex items-center">
                                        {file.status === 'uploading' && (
                                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                        )}
                                        {file.status === 'processing' && (
                                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                        )}
                                        {file.status === 'analyzing' && (
                                            <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                                        )}
                                        {file.status === 'completed' && (
                                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                                <Check className="w-5 h-5 text-green-400" />
                                            </div>
                                        )}
                                        {file.status === 'error' && (
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {file.status === 'completed' && (
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                className="ml-2 p-2 text-gray-400 hover:text-gray-300 hover:bg-dark-600 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl border border-blue-500/20">
                        <div className="flex items-start">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0 mr-3">
                                <AlertCircle className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-white mb-1">AI Destekli Analiz</p>
                                <p className="text-gray-400">
                                    Yüklediğiniz dokümanlar yapay zeka ile analiz edilerek
                                    <span className="text-blue-400"> özet</span>,
                                    <span className="text-green-400"> bulgular</span> ve
                                    <span className="text-orange-400"> risk analizi</span> çıkarılır.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-dark-700/50 flex justify-between items-center shrink-0 bg-dark-900/50">
                    <p className="text-sm text-gray-500">
                        {uploadingFiles.length > 0
                            ? `${completedCount}/${uploadingFiles.length} dosya yüklendi`
                            : '🔒 Dosyalarınız güvenle saklanır'
                        }
                    </p>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="px-5 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-dark-700 rounded-xl transition-all"
                        >
                            {completedCount > 0 ? 'Kapat' : 'İptal'}
                        </button>
                        {completedCount > 0 && completedCount === uploadingFiles.length && (
                            <button
                                onClick={handleClose}
                                className="px-6 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105"
                            >
                                ✓ Tamamla
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentUploadModal;
