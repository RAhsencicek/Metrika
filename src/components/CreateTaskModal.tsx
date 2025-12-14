import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTaskStore, useProjectStore, useUserStore, useNotificationStore } from '../store';
import type { TaskStatus, TaskPriority } from '../types';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
    const { addTask } = useTaskStore();
    const { projects } = useProjectStore();
    const { users } = useUserStore();
    const { addNotification } = useNotificationStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: '',
        assigneeId: '',
        dueDate: '',
        priority: 'Medium' as TaskPriority,
        estimatedHours: 8,
        tags: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Görev başlığı gerekli';
        if (!formData.projectId) newErrors.projectId = 'Proje seçimi gerekli';
        if (!formData.assigneeId) newErrors.assigneeId = 'Atanan kişi gerekli';
        if (!formData.dueDate) newErrors.dueDate = 'Bitiş tarihi gerekli';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        // addTask returns the new task with generated id, createdAt, updatedAt
        addTask({
            title: formData.title,
            description: formData.description,
            status: 'Todo' as TaskStatus,
            priority: formData.priority,
            projectId: formData.projectId,
            assigneeId: formData.assigneeId,
            dueDate: formData.dueDate,
            estimatedHours: formData.estimatedHours,
            loggedHours: 0,
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        });

        // Add notification
        addNotification({
            type: 'task',
            title: 'Yeni görev oluşturuldu',
            message: `"${formData.title}" görevi başarıyla oluşturuldu.`,
        });

        // Reset form
        setFormData({
            title: '',
            description: '',
            projectId: '',
            assigneeId: '',
            dueDate: '',
            priority: 'Medium',
            estimatedHours: 8,
            tags: '',
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-dark-800 rounded-xl border border-dark-700 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-700">
                    <h2 className="text-xl font-bold text-white">Yeni Görev Oluştur</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Görev Başlığı *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={`w-full bg-dark-900 border ${errors.title ? 'border-red-500' : 'border-dark-600'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary`}
                            placeholder="Görev başlığını girin"
                        />
                        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Açıklama
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary resize-none"
                            placeholder="Görev açıklaması..."
                        />
                    </div>

                    {/* Project & Assignee */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Proje *
                            </label>
                            <select
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                className={`w-full bg-dark-900 border ${errors.projectId ? 'border-red-500' : 'border-dark-600'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary`}
                            >
                                <option value="">Proje seçin</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>{project.title}</option>
                                ))}
                            </select>
                            {errors.projectId && <p className="text-red-400 text-xs mt-1">{errors.projectId}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Atanan Kişi *
                            </label>
                            <select
                                value={formData.assigneeId}
                                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                className={`w-full bg-dark-900 border ${errors.assigneeId ? 'border-red-500' : 'border-dark-600'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary`}
                            >
                                <option value="">Kişi seçin</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                            {errors.assigneeId && <p className="text-red-400 text-xs mt-1">{errors.assigneeId}</p>}
                        </div>
                    </div>

                    {/* Due Date & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Bitiş Tarihi *
                            </label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className={`w-full bg-dark-900 border ${errors.dueDate ? 'border-red-500' : 'border-dark-600'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary`}
                            />
                            {errors.dueDate && <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Öncelik
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                            >
                                <option value="Low">Düşük</option>
                                <option value="Medium">Orta</option>
                                <option value="High">Yüksek</option>
                                <option value="Urgent">Acil</option>
                            </select>
                        </div>
                    </div>

                    {/* Estimated Hours & Tags */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Tahmini Süre (saat)
                            </label>
                            <input
                                type="number"
                                value={formData.estimatedHours}
                                onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                                min="1"
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Etiketler
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                                placeholder="virgülle ayırın"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-700 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                        >
                            Görevi Oluştur
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
