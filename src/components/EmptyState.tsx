import React from 'react';
import {
    FileText,
    StickyNote,
    Brain,
    FolderOpen,
    Upload,
    Search,
    Inbox,
    type LucideIcon,
} from 'lucide-react';

type EmptyStateVariant =
    | 'no-documents'
    | 'no-analysis'
    | 'no-actions'
    | 'no-custom-actions'
    | 'no-results'
    | 'no-history';

interface EmptyStateProps {
    variant: EmptyStateVariant;
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

interface VariantConfig {
    icon: LucideIcon;
    iconColor: string;
    bgGradient: string;
    defaultTitle: string;
    defaultMessage: string;
    illustration?: React.ReactNode;
}

const variantConfigs: Record<EmptyStateVariant, VariantConfig> = {
    'no-documents': {
        icon: FolderOpen,
        iconColor: 'text-blue-400',
        bgGradient: 'from-blue-500/10 to-purple-500/10',
        defaultTitle: 'Henüz Doküman Yok',
        defaultMessage: 'Doküman yükleyerek yapay zeka ile analiz edebilirsiniz.',
    },
    'no-analysis': {
        icon: Brain,
        iconColor: 'text-purple-400',
        bgGradient: 'from-purple-500/10 to-pink-500/10',
        defaultTitle: 'Analiz Bulunamadı',
        defaultMessage: 'Bu doküman henüz analiz edilmemiş.',
    },
    'no-actions': {
        icon: StickyNote,
        iconColor: 'text-yellow-400',
        bgGradient: 'from-yellow-500/10 to-orange-500/10',
        defaultTitle: 'Aksiyon Önerisi Yok',
        defaultMessage: 'AI henüz bir aksiyon önerisi oluşturmadı.',
    },
    'no-custom-actions': {
        icon: StickyNote,
        iconColor: 'text-emerald-400',
        bgGradient: 'from-emerald-500/10 to-teal-500/10',
        defaultTitle: 'Henüz Aksiyon Eklenmedi',
        defaultMessage: 'Yukarıdan yeni aksiyon ekleyebilirsiniz.',
    },
    'no-results': {
        icon: Search,
        iconColor: 'text-gray-400',
        bgGradient: 'from-gray-500/10 to-gray-600/10',
        defaultTitle: 'Sonuç Bulunamadı',
        defaultMessage: 'Arama kriterlerinize uygun sonuç yok.',
    },
    'no-history': {
        icon: Inbox,
        iconColor: 'text-gray-400',
        bgGradient: 'from-gray-500/10 to-slate-500/10',
        defaultTitle: 'Geçmiş Boş',
        defaultMessage: 'Henüz analiz geçmişi bulunmuyor.',
    },
};

// Animated floating documents illustration
const FloatingDocsIllustration: React.FC = () => (
    <div className="relative w-24 h-24">
        {/* Main document */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-18 bg-dark-700 rounded-lg border border-dark-600 shadow-lg flex flex-col items-center justify-center animate-float">
                <FileText className="w-6 h-6 text-blue-400 mb-1" />
                <div className="space-y-1">
                    <div className="w-8 h-1 bg-dark-600 rounded" />
                    <div className="w-6 h-1 bg-dark-600 rounded" />
                    <div className="w-7 h-1 bg-dark-600 rounded" />
                </div>
            </div>
        </div>
        {/* Floating particles */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
        <div className="absolute bottom-4 left-2 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-6 left-4 w-1 h-1 bg-pink-400/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
);

// Animated brain/AI illustration
const BrainIllustration: React.FC = () => (
    <div className="relative w-24 h-24">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 flex items-center justify-center animate-float">
                <Brain className="w-8 h-8 text-purple-400" />
            </div>
        </div>
        {/* Sparkles */}
        <div className="absolute top-1 right-3 text-yellow-400 animate-pulse">✨</div>
        <div className="absolute bottom-2 left-4 text-yellow-400 animate-pulse" style={{ animationDelay: '0.7s' }}>✨</div>
        {/* Connection dots */}
        <div className="absolute top-4 left-2 w-2 h-2 bg-purple-400/40 rounded-full" />
        <div className="absolute bottom-6 right-2 w-2 h-2 bg-pink-400/40 rounded-full" />
    </div>
);

// Sticky notes illustration
const StickyNotesIllustration: React.FC = () => (
    <div className="relative w-24 h-24">
        {/* Stacked sticky notes */}
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-yellow-500/20 rounded-lg border border-yellow-500/30 rotate-[-8deg]" />
        <div className="absolute bottom-2 left-6 w-12 h-12 bg-pink-500/20 rounded-lg border border-pink-500/30 rotate-[4deg]" />
        <div className="absolute bottom-0 left-8 w-12 h-12 bg-blue-500/20 rounded-lg border border-blue-500/30 rotate-[-2deg] flex items-center justify-center animate-float">
            <StickyNote className="w-5 h-5 text-blue-400" />
        </div>
    </div>
);

const EmptyState: React.FC<EmptyStateProps> = ({
    variant,
    title,
    message,
    actionLabel,
    onAction,
    className = '',
}) => {
    const config = variantConfigs[variant];
    const Icon = config.icon;

    // Choose illustration based on variant
    const getIllustration = () => {
        switch (variant) {
            case 'no-documents':
                return <FloatingDocsIllustration />;
            case 'no-analysis':
                return <BrainIllustration />;
            case 'no-actions':
            case 'no-custom-actions':
                return <StickyNotesIllustration />;
            default:
                return (
                    <div className={`w-16 h-16 bg-gradient-to-br ${config.bgGradient} rounded-2xl flex items-center justify-center border border-dark-600`}>
                        <Icon className={`w-8 h-8 ${config.iconColor}`} />
                    </div>
                );
        }
    };

    return (
        <div className={`flex flex-col items-center justify-center py-10 text-center ${className}`}>
            {/* Illustration */}
            <div className="mb-5">
                {getIllustration()}
            </div>

            {/* Title */}
            <h4 className="text-base font-semibold text-white mb-2">
                {title || config.defaultTitle}
            </h4>

            {/* Message */}
            <p className="text-sm text-gray-400 max-w-xs">
                {message || config.defaultMessage}
            </p>

            {/* Action Button */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-5 px-5 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 flex items-center"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
