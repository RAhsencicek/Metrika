import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { create } from 'zustand';

// Toast types
export type ToastType = 'success' | 'warning' | 'info' | 'error';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message: string;
    duration?: number;
}

// Toast Store
interface ToastState {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (toastData) => {
        const id = crypto.randomUUID();
        const toast: Toast = { ...toastData, id };
        set((state) => ({ toasts: [...state.toasts, toast] }));

        // Auto remove after duration
        const duration = toastData.duration || 4000;
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, duration);
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));

// Toast Icon helper
const getToastIcon = (type: ToastType) => {
    switch (type) {
        case 'success':
            return <CheckCircle className="w-5 h-5 text-green-400" />;
        case 'warning':
            return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
        case 'error':
            return <AlertCircle className="w-5 h-5 text-red-400" />;
        case 'info':
        default:
            return <Info className="w-5 h-5 text-blue-400" />;
    }
};

// Toast color classes
const getToastColors = (type: ToastType) => {
    switch (type) {
        case 'success':
            return 'border-green-500/50 bg-green-900/20';
        case 'warning':
            return 'border-yellow-500/50 bg-yellow-900/20';
        case 'error':
            return 'border-red-500/50 bg-red-900/20';
        case 'info':
        default:
            return 'border-blue-500/50 bg-blue-900/20';
    }
};

// Single Toast Item
const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);

    const duration = toast.duration || 4000;

    useEffect(() => {
        const interval = 50;
        const decrement = (100 / duration) * interval;

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev - decrement;
                if (next <= 0) {
                    clearInterval(timer);
                    setIsExiting(true);
                    setTimeout(onRemove, 300);
                    return 0;
                }
                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [duration, onRemove]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onRemove, 300);
    };

    return (
        <div
            className={`
                relative overflow-hidden rounded-xl shadow-2xl border backdrop-blur-md
                px-4 py-3 flex items-start gap-3 min-w-[320px] max-w-[420px]
                bg-dark-800/95 ${getToastColors(toast.type)}
                transition-all duration-300 ease-out
                ${isExiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}
            `}
        >
            {/* Progress bar at bottom */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
                <div
                    className="h-full bg-white/30 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Icon */}
            <div className="shrink-0 mt-0.5">
                {getToastIcon(toast.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{toast.title}</p>
                <p className="text-gray-300 text-xs mt-0.5 line-clamp-2">{toast.message}</p>
            </div>

            {/* Close button */}
            <button
                onClick={handleClose}
                className="shrink-0 p-1 text-gray-400 hover:text-white hover:bg-dark-700 rounded transition-all"
                aria-label="Kapat"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// Toast Container - renders all toasts
const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
