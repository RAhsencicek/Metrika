import React, { useState } from 'react';
import { X, CalendarPlus, Clock, FileText } from 'lucide-react';
import { useTaskStore, useProjectStore, useUserStore } from '../store';
import type { TaskPriority } from '../types';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate?: Date;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, selectedDate }) => {
    const { addTask } = useTaskStore();
    const { projects } = useProjectStore();
    const { users } = useUserStore();

    // Safe access to arrays that might be undefined from API
    const safeProjects = projects || [];
    const safeUsers = users || [];

    const today = selectedDate || new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: formattedDate,
        projectId: safeProjects[0]?.id || '',
        assigneeId: '',
        priority: 'Medium' as TaskPriority,
        estimatedHours: 4,
    });

    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) {
            setError('Lütfen bir başlık girin.');
            return;
        }

        if (!formData.projectId) {
            setError('Lütfen bir proje seçin.');
            return;
        }

        addTask({
            title: formData.title.trim(),
            description: formData.description.trim(),
            status: 'Todo',
            priority: formData.priority,
            projectIds: formData.projectId ? [formData.projectId] : [], // Array olarak güncellendi
            assigneeId: formData.assigneeId,
            dueDate: formData.dueDate,
            estimatedHours: formData.estimatedHours,
            loggedHours: 0,
            tags: [],
        });

        // Reset form
        setFormData({
            title: '',
            description: '',
            dueDate: formattedDate,
            projectId: safeProjects[0]?.id || '',
            assigneeId: '',
            priority: 'Medium',
            estimatedHours: 4,
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-dark-800 rounded-xl border border-dark-700 w-full max-w-md shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-700">
                    <div className="flex items-center gap-2">
                        <CalendarPlus className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold text-white">Yeni Etkinlik/Görev</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Selected Date */}
                <div className="px-4 py-2 bg-dark-900/50 border-b border-dark-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">
                        Tarih: {new Date(formData.dueDate).toLocaleDateString('tr-TR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Başlık *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            placeholder="Etkinlik veya görev adı"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Açıklama</label>
                        <div className="relative">
                            <FileText className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-primary resize-none"
                                placeholder="Kısa açıklama..."
                            />
                        </div>
                    </div>

                    {/* Date & Project */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Tarih</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Proje *</label>
                            <select
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            >
                                <option value="">Seçiniz</option>
                                {safeProjects.map(project => (
                                    <option key={project.id} value={project.id}>{project.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Assignee & Priority */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Atanan Kişi</label>
                            <select
                                value={formData.assigneeId}
                                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            >
                                <option value="">Seçiniz</option>
                                {safeUsers.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Öncelik</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            >
                                <option value="Low">Düşük</option>
                                <option value="Medium">Orta</option>
                                <option value="High">Yüksek</option>
                                <option value="Urgent">Acil</option>
                            </select>
                        </div>
                    </div>

                    {/* Estimated Hours */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tahmini Süre (saat)</label>
                        <input
                            type="number"
                            value={formData.estimatedHours}
                            onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 1 })}
                            min="1"
                            max="100"
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <CalendarPlus className="w-4 h-4" />
                            Etkinlik Ekle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEventModal;
