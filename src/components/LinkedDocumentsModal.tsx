import React, { useEffect, useRef } from 'react';
import { X, FileText, File, FileSpreadsheet, Presentation, ExternalLink, Calendar } from 'lucide-react';
import { useDocumentStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface LinkedDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentIds: string[];
    taskTitle?: string;
}

const LinkedDocumentsModal: React.FC<LinkedDocumentsModalProps> = ({
    isOpen,
    onClose,
    documentIds,
    taskTitle,
}) => {
    const navigate = useNavigate();
    const modalRef = useRef<HTMLDivElement>(null);
    const { analyses, setCurrentAnalysis } = useDocumentStore();

    // Find analyses for the given document IDs
    const linkedDocuments = analyses.filter(analysis =>
        documentIds.includes(analysis.document.id)
    );

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    // Navigate to document analysis
    const handleDocumentClick = (analysis: typeof analyses[0]) => {
        setCurrentAnalysis(analysis);
        onClose();
        navigate('/documents/analysis');
    };

    // Get document icon based on type
    const getDocumentIcon = (type: string) => {
        const iconClass = "w-8 h-8";
        switch (type) {
            case 'PDF':
                return <FileText className={`${iconClass} text-red-400`} />;
            case 'DOCX':
                return <File className={`${iconClass} text-blue-400`} />;
            case 'XLSX':
                return <FileSpreadsheet className={`${iconClass} text-green-400`} />;
            case 'PPTX':
                return <Presentation className={`${iconClass} text-orange-400`} />;
            default:
                return <FileText className={`${iconClass} text-gray-400`} />;
        }
    };

    // Get type badge color
    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'PDF': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'DOCX': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'XLSX': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'PPTX': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
            >
                {/* Header with gradient */}
                <div className="relative px-6 py-5 border-b border-dark-700 bg-gradient-to-r from-primary/10 via-dark-800 to-purple-500/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Bağlı Dokümanlar
                            </h2>
                            {taskTitle && (
                                <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                    {taskTitle}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Document count badge */}
                    <div className="absolute top-5 right-16">
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                            {linkedDocuments.length} doküman
                        </span>
                    </div>
                </div>

                {/* Document List */}
                <div className="p-4 max-h-[400px] overflow-y-auto">
                    {linkedDocuments.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400">Bağlı doküman bulunamadı</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {linkedDocuments.map((analysis, index) => (
                                <button
                                    key={analysis.id}
                                    onClick={() => handleDocumentClick(analysis)}
                                    className="w-full group relative p-4 bg-dark-900/50 hover:bg-dark-700/80 rounded-xl border border-dark-600 hover:border-primary/50 transition-all duration-200 text-left"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Document Icon */}
                                        <div className="shrink-0 p-2 bg-dark-800 rounded-lg border border-dark-600 group-hover:border-primary/30 transition-colors">
                                            {getDocumentIcon(analysis.document.type)}
                                        </div>

                                        {/* Document Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-white group-hover:text-primary transition-colors line-clamp-1">
                                                {analysis.document.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${getTypeBadgeColor(analysis.document.type)}`}>
                                                    {analysis.document.type}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {analysis.document.sizeFormatted}
                                                </span>
                                                <span className="text-gray-600">•</span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(analysis.analyzedAt)}
                                                </span>
                                            </div>
                                            {/* Summary preview */}
                                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                                {analysis.summary}
                                            </p>
                                        </div>

                                        {/* Arrow Icon */}
                                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="w-4 h-4 text-primary" />
                                        </div>
                                    </div>

                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-dark-700 bg-dark-900/30">
                    <p className="text-xs text-gray-500 text-center">
                        Dokümanı görüntülemek için tıklayın
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LinkedDocumentsModal;
