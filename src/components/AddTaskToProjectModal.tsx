import React, { useState, useMemo } from 'react';
import { X, FolderPlus, Search, Check, Folder } from 'lucide-react';
import { useProjectStore, useTaskStore } from '../store';
import { colorClasses } from '../utils/colorUtils';
import { useToastStore } from './ToastContainer';

interface AddTaskToProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: string;
    currentProjectIds: string[];
}

const AddTaskToProjectModal: React.FC<AddTaskToProjectModalProps> = ({
    isOpen,
    onClose,
    taskId,
    currentProjectIds
}) => {
    const { projects } = useProjectStore();
    const { addTaskToProject } = useTaskStore();
    const { addToast } = useToastStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

    // Mevcut projelere ait olmayan projeleri filtrele
    const availableProjects = useMemo(() => {
        return projects.filter(p => !currentProjectIds.includes(p.id));
    }, [projects, currentProjectIds]);

    // Arama filtrelemesi
    const filteredProjects = useMemo(() => {
        if (!searchTerm) return availableProjects;
        return availableProjects.filter(p =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableProjects, searchTerm]);

    const handleToggleProject = (projectId: string) => {
        setSelectedProjectIds(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    const handleAddToProjects = () => {
        if (selectedProjectIds.length === 0) {
            addToast({
                type: 'warning',
                title: 'Proje Seçilmedi',
                message: 'Lütfen en az bir proje seçin.',
                duration: 3000,
            });
            return;
        }

        selectedProjectIds.forEach(projectId => {
            addTaskToProject(taskId, projectId);
        });

        const selectedProjects = projects.filter(p => selectedProjectIds.includes(p.id));
        const projectNames = selectedProjects.map(p => p.title).join(', ');

        addToast({
            type: 'success',
            title: 'Projelere Eklendi',
            message: `Görev şu projelere eklendi: ${projectNames}`,
            duration: 4000,
        });

        setSelectedProjectIds([]);
        setSearchTerm('');
        onClose();
    };

    const handleClose = () => {
        setSelectedProjectIds([]);
        setSearchTerm('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-dark-800 rounded-xl border border-dark-700 w-full max-w-md shadow-2xl animate-fade-in overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-gradient-to-r from-purple-900/20 to-dark-800">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <FolderPlus className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Projeye Ekle</h2>
                            <p className="text-xs text-gray-400">Görevi bir veya birden fazla projeye ekle</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-dark-700">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Proje ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                {/* Projects List */}
                <div className="p-4 max-h-[300px] overflow-y-auto">
                    {availableProjects.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-dark-700 flex items-center justify-center">
                                <Folder className="w-6 h-6 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-sm">Tüm projelere zaten eklenmiş</p>
                            <p className="text-gray-500 text-xs mt-1">Bu görev mevcut tüm projelerde bulunuyor.</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400 text-sm">Sonuç bulunamadı</p>
                            <p className="text-gray-500 text-xs mt-1">Farklı bir arama terimi deneyin.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredProjects.map(project => {
                                const projectColor = colorClasses[project.color];
                                const isSelected = selectedProjectIds.includes(project.id);

                                return (
                                    <button
                                        key={project.id}
                                        onClick={() => handleToggleProject(project.id)}
                                        className={`w-full flex items-center p-3 rounded-lg border transition-all ${isSelected
                                                ? 'bg-primary/10 border-primary/50'
                                                : 'bg-dark-900 border-dark-600 hover:border-primary/30'
                                            }`}
                                    >
                                        <div className={`w-3 h-3 rounded-full ${projectColor?.dot || 'bg-gray-500'} mr-3 shrink-0`} />
                                        <div className="flex-1 text-left min-w-0">
                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-white'}`}>
                                                {project.title}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {project.description}
                                            </p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 transition-all ${isSelected
                                                ? 'bg-primary border-primary'
                                                : 'border-dark-500'
                                            }`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {availableProjects.length > 0 && (
                    <div className="p-4 border-t border-dark-700 bg-dark-900/50">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                {selectedProjectIds.length} proje seçildi
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors text-sm"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleAddToProjects}
                                    disabled={selectedProjectIds.length === 0}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${selectedProjectIds.length > 0
                                            ? 'bg-primary hover:bg-blue-600 text-white'
                                            : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <FolderPlus className="w-4 h-4" />
                                    Ekle
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddTaskToProjectModal;
