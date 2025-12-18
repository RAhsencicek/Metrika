import React, { useEffect, useState, useCallback } from 'react';
import { Undo2, X, CheckCircle } from 'lucide-react';

interface UndoToastProps {
    message: string;
    duration?: number;
    onUndo: () => void;
    onDismiss: () => void;
    isVisible: boolean;
}

const UndoToast: React.FC<UndoToastProps> = ({
    message,
    duration = 5000,
    onUndo,
    onDismiss,
    isVisible,
}) => {
    const [progress, setProgress] = useState(100);
    const [isUndone, setIsUndone] = useState(false);

    useEffect(() => {
        if (!isVisible || isUndone) {
            setProgress(100);
            return;
        }

        const interval = 50; // Update every 50ms
        const decrement = (100 / duration) * interval;

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev - decrement;
                if (next <= 0) {
                    clearInterval(timer);
                    onDismiss();
                    return 0;
                }
                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [isVisible, duration, onDismiss, isUndone]);

    const handleUndo = useCallback(() => {
        setIsUndone(true);
        onUndo();
        // Show success state briefly before dismissing
        setTimeout(() => {
            setIsUndone(false);
            onDismiss();
        }, 1500);
    }, [onUndo, onDismiss]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className={`
                relative overflow-hidden rounded-xl shadow-2xl border
                ${isUndone
                    ? 'bg-green-900/90 border-green-500/50'
                    : 'bg-dark-800/95 border-dark-600/50'
                }
                backdrop-blur-md px-5 py-4 flex items-center gap-4 min-w-[320px]
            `}>
                {/* Progress bar at bottom */}
                {!isUndone && (
                    <div className="absolute bottom-0 left-0 h-1 bg-primary/30 w-full">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Icon */}
                <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                    ${isUndone
                        ? 'bg-green-500/20'
                        : 'bg-orange-500/20'
                    }
                `}>
                    {isUndone ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                        <Undo2 className="w-5 h-5 text-orange-400" />
                    )}
                </div>

                {/* Message */}
                <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                        {isUndone ? 'Geri alındı!' : message}
                    </p>
                    {!isUndone && (
                        <p className="text-gray-400 text-xs mt-0.5">
                            İşlemi geri almak için tıklayın
                        </p>
                    )}
                </div>

                {/* Actions */}
                {!isUndone && (
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleUndo}
                            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg 
                                     hover:bg-blue-600 transition-colors flex items-center gap-1.5
                                     shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                        >
                            <Undo2 className="w-4 h-4" />
                            Geri Al
                        </button>
                        <button
                            onClick={onDismiss}
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all"
                            aria-label="Kapat"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UndoToast;
