import React, { useState } from 'react';
import { X, CheckCircle, Calendar, User, Tag, Flag } from 'lucide-react';
import { useTaskStore, useProjectStore, useUserStore, useNotificationStore, useDocumentStore } from '../store';
import type { TaskPriority } from '../types';

interface CreateTaskFromDocModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysisId: string;
    actionId?: string; // If provided, create task from specific action
    actionText?: string;
    createAll?: boolean; // If true, create tasks from all pending actions
}

const CreateTaskFromDocModal: React.FC<CreateTaskFromDocModalProps> = ({
    isOpen,
    onClose,
    analysisId,
    actionId,
    actionText,
    createAll = false,
}) => {
    const { addTask } = useTaskStore();
    const { projects } = useProjectStore();
    const { users: teamMembers, currentUser } = useUserStore();
    const { addNotification } = useNotificationStore();
    const { markActionAsTask, getAnalysisById } = useDocumentStore();

    const analysis = getAnalysisById(analysisId);
    const pendingActions = analysis?.suggestedActions.filter((a) => !a.addedAsTask) || [];

    const [formData, setFormData] = useState({
        title: actionText || '',
        description: '',
        priority: 'Medium' as TaskPriority,
        projectId: analysis?.document.projectId || projects[0]?.id || '',
        assigneeId: currentUser?.id || '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
        tags: ['Doküman Analizi'],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateSingleTask = async () => {
        if (!formData.title.trim()) {
            addNotification({
                type: 'error',
                title: 'Hata',
                message: 'Görev başlığı gereklidir.',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const newTask = await addTask({
                title: formData.title,
                description: formData.description || `Bu görev "${analysis?.document.name}" doküman analizinden oluşturulmuştur.`,
                status: 'Todo',
                priority: formData.priority,
                projectIds: formData.projectId ? [formData.projectId] : [], // Array olarak güncellendi
                assigneeId: formData.assigneeId,
                dueDate: formData.dueDate,
                tags: formData.tags,
                estimatedHours: 4,
                loggedHours: 0,
            });

            if (actionId) {
                markActionAsTask(analysisId, actionId, newTask.id);
            }

            addNotification({
                type: 'success',
                title: 'Görev Oluşturuldu',
                message: `"${formData.title}" görevi başarıyla oluşturuldu.`,
                actionUrl: `/tasks/${newTask.id}`,
            });

            onClose();
        } catch {
            addNotification({
                type: 'error',
                title: 'Hata',
                message: 'Görev oluşturulamadı.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateAllTasks = async () => {
        setIsSubmitting(true);

        try {
            let createdCount = 0;

            for (const action of pendingActions) {
                const newTask = await addTask({
                    title: action.text,
                    description: `Bu görev "${analysis?.document.name}" doküman analizinden otomatik olarak oluşturulmuştur.`,
                    status: 'Todo',
                    priority: action.priority === 'high' ? 'High' : action.priority === 'medium' ? 'Medium' : 'Low',
                    projectIds: formData.projectId ? [formData.projectId] : [], // Array olarak güncellendi
                    assigneeId: formData.assigneeId,
                    dueDate: formData.dueDate,
                    tags: ['Doküman Analizi', 'Otomatik'],
                    estimatedHours: 4,
                    loggedHours: 0,
                });

                markActionAsTask(analysisId, action.id, newTask.id);
                createdCount++;
            }

            addNotification({
                type: 'success',
                title: 'Görevler Oluşturuldu',
                message: `${createdCount} görev başarıyla oluşturuldu.`,
                actionUrl: '/tasks',
            });

            onClose();
        } catch {
            addNotification({
                type: 'error',
                title: 'Hata',
                message: 'Görevler oluşturulamadı.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
        { value: 'Low', label: 'Düşük', color: 'text-green-400' },
        { value: 'Medium', label: 'Orta', color: 'text-yellow-400' },
        { value: 'High', label: 'Yüksek', color: 'text-orange-400' },
        { value: 'Urgent', label: 'Acil', color: 'text-red-400' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-dark-800 rounded-xl border border-dark-700 w-full max-w-lg mx-4 animate-fade-in shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-700 shrink-0">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                            <CheckCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {createAll ? 'Tüm Aksiyonları Görevlere Ekle' : 'Görev Oluştur'}
                            </h2>
                            <p className="text-xs text-gray-400">
                                {createAll
                                    ? `${pendingActions.length} aksiyon görev olarak eklenecek`
                                    : 'Aksiyonu görev olarak ekle'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">
                    {createAll ? (
                        // Create All Tasks View
                        <div className="space-y-4">
                            <div className="bg-dark-900 rounded-lg p-4 border border-dark-600">
                                <h4 className="text-sm font-medium text-white mb-3">Oluşturulacak Görevler:</h4>
                                <ul className="space-y-2">
                                    {pendingActions.map((action, index) => (
                                        <li key={action.id} className="flex items-start text-sm">
                                            <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center mr-2 shrink-0 text-xs">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-300">{action.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Common settings for all tasks */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Atanan Kişi
                                    </label>
                                    <select
                                        value={formData.assigneeId}
                                        onChange={(e) => handleChange('assigneeId', e.target.value)}
                                        className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                                    >
                                        {teamMembers.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Teslim Tarihi
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => handleChange('dueDate', e.target.value)}
                                        className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Create Single Task View
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Görev Başlığı *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="Görev başlığını girin"
                                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Açıklama
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Görev açıklaması (opsiyonel)"
                                    rows={3}
                                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <Flag className="w-4 h-4 inline mr-2" />
                                        Öncelik
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => handleChange('priority', e.target.value)}
                                        className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                                    >
                                        {priorityOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <Tag className="w-4 h-4 inline mr-2" />
                                        Proje
                                    </label>
                                    <select
                                        value={formData.projectId}
                                        onChange={(e) => handleChange('projectId', e.target.value)}
                                        className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                                    >
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Atanan Kişi
                                    </label>
                                    <select
                                        value={formData.assigneeId}
                                        onChange={(e) => handleChange('assigneeId', e.target.value)}
                                        className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                                    >
                                        {teamMembers.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Teslim Tarihi
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => handleChange('dueDate', e.target.value)}
                                        className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-dark-700 flex justify-end space-x-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={createAll ? handleCreateAllTasks : handleCreateSingleTask}
                        disabled={isSubmitting || (createAll ? pendingActions.length === 0 : !formData.title.trim())}
                        className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Oluşturuluyor...
                            </>
                        ) : createAll ? (
                            `${pendingActions.length} Görev Oluştur`
                        ) : (
                            'Görev Oluştur'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTaskFromDocModal;
