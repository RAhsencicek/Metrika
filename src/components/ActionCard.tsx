import React from 'react';
import {
    Check,
    Plus,
    Trash2,
    GripVertical,
    Loader2,
} from 'lucide-react';

export interface ActionCardProps {
    id: string;
    text: string;
    priority: 'low' | 'medium' | 'high';
    addedAsTask: boolean;
    taskId?: string;
    type: 'ai' | 'custom';
    index: number;
    isProcessing?: boolean;
    isNewlyAdded?: boolean;
    isBeingConverted?: boolean;
    onCreateTask: (id: string, text: string, priority: 'low' | 'medium' | 'high') => void;
    onViewTask?: (taskId: string) => void;
    onRemove?: (id: string) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
    id,
    text,
    priority,
    addedAsTask,
    taskId,
    type,
    index,
    isProcessing = false,
    isNewlyAdded = false,
    isBeingConverted = false,
    onCreateTask,
    onViewTask,
    onRemove,
}) => {
    // Color schemes based on type and index
    const aiColors = [
        'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
        'from-pink-500/20 to-pink-600/10 border-pink-500/30',
        'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        'from-green-500/20 to-green-600/10 border-green-500/30',
        'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    ];

    const customColors = [
        'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
        'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
        'from-teal-500/20 to-teal-600/10 border-teal-500/30',
    ];

    const colors = type === 'ai' ? aiColors : customColors;
    const colorClass = colors[index % colors.length];

    // Priority badge styling
    const getPriorityBadge = () => {
        const styles = {
            high: 'bg-red-500/20 text-red-400',
            medium: 'bg-yellow-500/20 text-yellow-400',
            low: 'bg-green-500/20 text-green-400',
        };
        const labels = {
            high: '🔥 Yüksek',
            medium: '⚡ Orta',
            low: '✨ Düşük',
        };
        return (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${styles[priority]}`}>
                {labels[priority]}
            </span>
        );
    };

    // Button styling based on type
    const buttonBaseClass = type === 'ai'
        ? 'text-primary hover:text-white bg-primary/10 hover:bg-primary/20'
        : 'text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20';

    // Calculate rotation for visual variety
    const rotation = type === 'ai'
        ? (index % 2 === 0 ? -1 : 1) * 0.5
        : (index % 2 === 0 ? 1 : -1) * 0.5;

    return (
        <div
            className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                bg-gradient-to-br ${colorClass}
                ${addedAsTask
                    ? 'opacity-60 scale-[0.98]'
                    : 'hover:scale-[1.02] hover:shadow-lg cursor-pointer'
                }
                ${isNewlyAdded ? 'animate-new-action' : ''}
                ${isBeingConverted ? 'animate-card-to-task animate-success-ring' : ''}
            `}
            style={{
                transform: isNewlyAdded || isBeingConverted ? undefined : `rotate(${rotation}deg)`
            }}
        >
            {/* Grip handle for AI suggestions */}
            {type === 'ai' && (
                <div className="absolute top-2 left-2 opacity-30">
                    <GripVertical className="w-3 h-3" />
                </div>
            )}

            {/* Delete button for custom actions */}
            {type === 'custom' && onRemove && !addedAsTask && (
                <button
                    onClick={() => onRemove(id)}
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                    aria-label="Aksiyonu sil"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            )}

            {/* Priority indicator dot */}
            <div
                className={`absolute ${type === 'ai' ? 'top-2 right-2' : 'top-2 left-2'} w-2 h-2 rounded-full ${priority === 'high'
                        ? 'bg-red-500 animate-pulse'
                        : priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                    }`}
            />

            {/* Content */}
            <div className={type === 'ai' ? 'pl-4' : 'pl-4 pr-6'}>
                <p
                    className={`text-sm leading-relaxed ${addedAsTask ? 'text-gray-500 line-through' : 'text-gray-200'
                        }`}
                >
                    {text}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                    {getPriorityBadge()}

                    {addedAsTask && taskId ? (
                        <button
                            onClick={() => onViewTask?.(taskId)}
                            className="text-green-400 hover:text-green-300 text-xs flex items-center font-medium"
                            aria-label="Görevi görüntüle"
                        >
                            <Check className="w-3 h-3 mr-1" />
                            Görevi Gör
                        </button>
                    ) : (
                        <button
                            onClick={() => onCreateTask(id, text, priority)}
                            disabled={isProcessing}
                            className={`text-xs flex items-center font-medium px-2 py-1 rounded-lg transition disabled:opacity-50 ${buttonBaseClass}`}
                            aria-label="Görev olarak ekle"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                                <Plus className="w-3 h-3 mr-1" />
                            )}
                            Görev Yap
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionCard;
