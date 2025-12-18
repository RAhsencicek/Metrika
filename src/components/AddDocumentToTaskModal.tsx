import React, { useState, useMemo } from 'react';
import {
    X,
    Search,
    ListTodo,
    Plus,
    CheckCircle2,
    Loader2,
    Clock,
    AlertCircle,
    Link2,
    Filter,
} from 'lucide-react';
import { useTaskStore, useNotificationStore } from '../store';
import type { Task, TaskStatus } from '../types';

interface AddDocumentToTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    documentName: string;
    onSuccess?: () => void;
    excludeTaskIds?: string[];
}

const AddDocumentToTaskModal: React.FC<AddDocumentToTaskModalProps> = ({
    isOpen,
    onClose,
    documentId,
    documentName,
    onSuccess,
    excludeTaskIds = [],
}) => {
    const { tasks, addDocumentToTask } = useTaskStore();
    const { addNotification } = useNotificationStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // Exclude already linked tasks
            if (excludeTaskIds.includes(task.id)) return false;

            // Apply status filter
            if (statusFilter !== 'all' && task.status !== statusFilter) return false;

            // Apply search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    task.title.toLowerCase().includes(query) ||
                    task.description.toLowerCase().includes(query) ||
                    task.tags.some(tag => tag.toLowerCase().includes(query))
                );
            }

            return true;
        });
    }, [tasks, excludeTaskIds, statusFilter, searchQuery]);

    // Get status info
    const getStatusInfo = (status: Task['status']) => {
        switch (status) {
            case 'Done':
                return {
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    color: 'text-green-400',
                    bgColor: 'bg-green-500/10',
                    label: 'Tamamlandı'
                };
            case 'In Progress':
                return {
                    icon: <Loader2 className="w-4 h-4" />,
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-500/10',
                    label: 'Devam Ediyor'
                };
            case 'Review':
                return {
                    icon: <Clock className="w-4 h-4" />,
                    color: 'text-yellow-400',
                    bgColor: 'bg-yellow-500/10',
                    label: 'İncelemede'
                };
            case 'Todo':
            default:
                return {
                    icon: <AlertCircle className="w-4 h-4" />,
                    color: 'text-gray-400',
                    bgColor: 'bg-gray-500/10',
                    label: 'Bekliyor'
                };
        }
    };

    // Get priority color
    const getPriorityColor = (priority: Task['priority']) => {
        switch (priority) {
            case 'Urgent':
                return 'bg-red-500/20 text-red-400';
            case 'High':
                return 'bg-orange-500/20 text-orange-400';
            case 'Medium':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'Low':
            default:
                return 'bg-green-500/20 text-green-400';
        }
    };

    // Handle add document to task
    const handleAddToTask = async () => {
        if (!selectedTaskId) return;

        setIsAdding(true);
        try {
            // Small delay for UX feedback
            await new Promise(resolve => setTimeout(resolve, 500));

            addDocumentToTask(selectedTaskId, documentId);

            const selectedTask = tasks.find(t => t.id === selectedTaskId);
            addNotification({
                type: 'success',
                title: 'Doküman Bağlandı',
                message: `"${documentName}" dokümanı "${selectedTask?.title}" görevine eklendi.`,
                actionUrl: `/tasks/${selectedTaskId}`,
            });

            onSuccess?.();
            handleClose();
        } catch {
            addNotification({
                type: 'error',
                title: 'Hata',
                message: 'Doküman göreve eklenemedi.',
            });
        } finally {
            setIsAdding(false);
        }
    };

    // Handle close
    const handleClose = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setSelectedTaskId(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-dark-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-dark-600 shadow-2xl animate-fade-in mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-700">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <Link2 className="w-5 h-5 mr-2 text-primary" />
                            Göreve Ekle
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            "{documentName}" dokümanını bir göreve bağlayın
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="p-4 border-b border-dark-700 space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Görev ara..."
                            className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                        {(['all', 'Todo', 'In Progress', 'Review', 'Done'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === status
                                        ? 'bg-primary text-white'
                                        : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                                    }`}
                            >
                                {status === 'all' ? 'Tümü' :
                                    status === 'Todo' ? 'Bekleyen' :
                                        status === 'In Progress' ? 'Devam Eden' :
                                            status === 'Review' ? 'İnceleme' : 'Tamamlanan'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task List */}
                <div className="p-4 overflow-y-auto max-h-[45vh]">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ListTodo className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-sm mb-2">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Arama kriterlerine uygun görev bulunamadı'
                                    : 'Eklenebilecek görev bulunamadı'}
                            </p>
                            <p className="text-gray-500 text-xs">
                                {excludeTaskIds.length > 0 && 'Zaten bağlı olan görevler gösterilmiyor'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredTasks.map((task) => {
                                const statusInfo = getStatusInfo(task.status);
                                const priorityColor = getPriorityColor(task.priority);
                                const isSelected = selectedTaskId === task.id;

                                return (
                                    <button
                                        key={task.id}
                                        onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                                        className={`w-full text-left p-4 rounded-lg border transition-all ${isSelected
                                                ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/30'
                                                : 'bg-dark-900/50 border-dark-600 hover:border-dark-500'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Selection Indicator */}
                                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected
                                                    ? 'border-primary bg-primary'
                                                    : 'border-dark-500'
                                                }`}>
                                                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>

                                            {/* Task Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={statusInfo.color}>
                                                        {statusInfo.icon}
                                                    </span>
                                                    <h4 className="text-white font-medium text-sm truncate">
                                                        {task.title}
                                                    </h4>
                                                </div>

                                                <p className="text-gray-500 text-xs line-clamp-1 mb-2">
                                                    {task.description}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColor}`}>
                                                        {task.priority === 'Urgent' ? 'Acil' :
                                                            task.priority === 'High' ? 'Yüksek' :
                                                                task.priority === 'Medium' ? 'Orta' : 'Düşük'}
                                                    </span>
                                                    {task.dueDate && (
                                                        <span className="text-gray-500 text-xs flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-dark-700 flex items-center justify-between bg-dark-900/50">
                    <p className="text-sm text-gray-500">
                        {filteredTasks.length} görev listelendi
                        {selectedTaskId && (
                            <span className="text-primary"> • 1 seçili</span>
                        )}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleAddToTask}
                            disabled={!selectedTaskId || isAdding}
                            className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-5 py-2 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAdding ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Ekleniyor...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Göreve Ekle
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDocumentToTaskModal;
