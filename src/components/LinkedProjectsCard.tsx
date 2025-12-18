import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, X, ExternalLink, AlertCircle } from 'lucide-react';
import { useProjectStore, useTaskStore } from '../store';
import { colorClasses } from '../utils/colorUtils';
import { useToastStore } from './ToastContainer';
import AddTaskToProjectModal from './AddTaskToProjectModal';

interface LinkedProjectsCardProps {
    taskId: string;
    projectIds: string[];
}

const LinkedProjectsCard: React.FC<LinkedProjectsCardProps> = ({ taskId, projectIds }) => {
    const navigate = useNavigate();
    const { projects } = useProjectStore();
    const { removeTaskFromProject } = useTaskStore();
    const { addToast } = useToastStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // projectIds'ye göre projeleri filtrele
    const linkedProjects = projects.filter(p => projectIds.includes(p.id));

    const handleRemoveFromProject = (projectId: string, projectTitle: string) => {
        removeTaskFromProject(taskId, projectId);
        addToast({
            type: 'success',
            title: 'Projeden Çıkarıldı',
            message: `Görev "${projectTitle}" projesinden çıkarıldı.`,
            duration: 3000,
        });
    };

    const handleNavigateToProject = (projectId: string) => {
        navigate(`/projects/${projectId}`);
    };

    return (
        <>
            <div className="bg-dark-800 rounded-xl p-5 border border-dark-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <FolderOpen className="w-4 h-4 text-purple-400" />
                        <h3 className="font-bold text-white text-sm">Bağlı Projeler</h3>
                    </div>
                    <span className="text-xs text-gray-500 bg-dark-700 px-2 py-0.5 rounded-full">
                        {linkedProjects.length}
                    </span>
                </div>

                {linkedProjects.length === 0 ? (
                    <div className="text-center py-6">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-dark-700 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-gray-500" />
                        </div>
                        <p className="text-gray-400 text-sm mb-1">Herhangi bir projeye ait değil</p>
                        <p className="text-gray-500 text-xs">Bu görevi bir projeye ekleyebilirsiniz.</p>
                    </div>
                ) : (
                    <div className="space-y-2 mb-4">
                        {linkedProjects.map(project => {
                            const projectColor = colorClasses[project.color];
                            return (
                                <div
                                    key={project.id}
                                    className="group flex items-center justify-between p-3 bg-dark-900 rounded-lg border border-dark-600 hover:border-primary/50 transition-all"
                                >
                                    <div
                                        className="flex items-center flex-1 cursor-pointer"
                                        onClick={() => handleNavigateToProject(project.id)}
                                    >
                                        <div className={`w-3 h-3 rounded-full ${projectColor?.dot || 'bg-gray-500'} mr-3`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                                                {project.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {project.status === 'Active' ? 'Aktif' :
                                                    project.status === 'Completed' ? 'Tamamlandı' :
                                                        project.status === 'On Hold' ? 'Beklemede' : 'Risk Altında'}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFromProject(project.id, project.title);
                                        }}
                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        title="Projeden Çıkar"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-2.5 text-xs text-gray-400 hover:text-white border border-dashed border-dark-600 rounded-lg hover:bg-dark-700 hover:border-primary/50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Projeye Ekle
                </button>
            </div>

            <AddTaskToProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                taskId={taskId}
                currentProjectIds={projectIds}
            />
        </>
    );
};

export default LinkedProjectsCard;
