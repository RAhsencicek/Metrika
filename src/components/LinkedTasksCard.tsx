import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ListTodo,
    Plus,
    ExternalLink,
    Trash2,
    Clock,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Link2,
} from 'lucide-react';
import { useTaskStore, useNotificationStore } from '../store';
import type { Task } from '../types';
import AddDocumentToTaskModal from './AddDocumentToTaskModal';

interface LinkedTasksCardProps {
    documentId: string;
    documentName: string;
}

const LinkedTasksCard: React.FC<LinkedTasksCardProps> = ({ documentId, documentName }) => {
    const navigate = useNavigate();
    const { getTasksByDocument, removeDocumentFromTask } = useTaskStore();
    const { addNotification } = useNotificationStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [removingTaskId, setRemovingTaskId] = useState<string | null>(null);

    // Get linked tasks
    const linkedTasks = getTasksByDocument(documentId);

    // Get status icon and color
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
                    icon: <Loader2 className="w-4 h-4 animate-spin" />,
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
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'High':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'Medium':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Low':
            default:
                return 'bg-green-500/20 text-green-400 border-green-500/30';
        }
    };

    // Handle remove document from task
    const handleRemoveFromTask = async (taskId: string, taskTitle: string) => {
        setRemovingTaskId(taskId);
        try {
            // Small delay for UX feedback
            await new Promise(resolve => setTimeout(resolve, 300));
            removeDocumentFromTask(taskId, documentId);
            addNotification({
                type: 'success',
                title: 'Bağlantı Kaldırıldı',
                message: `Doküman "${taskTitle}" görevinden kaldırıldı.`,
            });
        } catch {
            addNotification({
                type: 'error',
                title: 'Hata',
                message: 'Bağlantı kaldırılamadı.',
            });
        } finally {
            setRemovingTaskId(null);
        }
    };

    // Handle task creation success
    const handleTaskLinked = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 mb-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <Link2 className="w-5 h-5 mr-2 text-primary" />
                        Bağlı Görevler
                        {linkedTasks.length > 0 && (
                            <span className="ml-2 bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                                {linkedTasks.length}
                            </span>
                        )}
                    </h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-primary to-blue-600 text-white px-3 py-2 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Göreve Ekle
                    </button>
                </div>

                {/* Content */}
                {linkedTasks.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ListTodo className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400 text-sm mb-2">
                            Bu doküman henüz bir göreve bağlanmamış
                        </p>
                        <p className="text-gray-500 text-xs">
                            "Göreve Ekle" butonunu kullanarak mevcut bir göreve bağlayabilirsiniz
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {linkedTasks.map((task) => {
                            const statusInfo = getStatusInfo(task.status);
                            const priorityColor = getPriorityColor(task.priority);
                            const isRemoving = removingTaskId === task.id;

                            return (
                                <div
                                    key={task.id}
                                    className={`group relative bg-dark-900/50 rounded-lg p-4 border border-dark-600 hover:border-primary/30 transition-all ${isRemoving ? 'opacity-50 pointer-events-none' : ''
                                        }`}
                                >
                                    {/* Task Info */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Title & Status */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`${statusInfo.color}`}>
                                                    {statusInfo.icon}
                                                </span>
                                                <h4 className="text-white font-medium text-sm truncate">
                                                    {task.title}
                                                </h4>
                                            </div>

                                            {/* Meta Info */}
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                {/* Status Badge */}
                                                <span className={`px-2 py-0.5 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>

                                                {/* Priority Badge */}
                                                <span className={`px-2 py-0.5 rounded-full border ${priorityColor}`}>
                                                    {task.priority === 'Urgent' ? 'Acil' :
                                                        task.priority === 'High' ? 'Yüksek' :
                                                            task.priority === 'Medium' ? 'Orta' : 'Düşük'}
                                                </span>

                                                {/* Due Date */}
                                                {task.dueDate && (
                                                    <span className="text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                                className="p-2 bg-dark-700 text-gray-400 rounded-lg hover:bg-primary hover:text-white transition-colors"
                                                title="Görevi Aç"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveFromTask(task.id, task.title)}
                                                disabled={isRemoving}
                                                className="p-2 bg-dark-700 text-gray-400 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                                                title="Bağlantıyı Kaldır"
                                            >
                                                {isRemoving ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {task.tags && task.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-dark-600">
                                            {task.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="bg-dark-700 text-gray-400 px-2 py-0.5 rounded text-xs"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                            {task.tags.length > 3 && (
                                                <span className="text-gray-500 text-xs">
                                                    +{task.tags.length - 3} daha
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Document to Task Modal */}
            <AddDocumentToTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                documentId={documentId}
                documentName={documentName}
                onSuccess={handleTaskLinked}
                excludeTaskIds={linkedTasks.map(t => t.id)}
            />
        </>
    );
};

export default LinkedTasksCard;
