import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Clock, Tag,
    Paperclip, BarChart, Zap, Check, ThumbsUp,
    AlertCircle
} from 'lucide-react';
import { useTaskStore, useProjectStore, useUserStore } from '../store';
import { taskStatusClasses, priorityClasses, colorClasses } from '../utils/colorUtils';

const TaskDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // Store'lardan veri çekiyoruz
    const { getTaskById, updateTaskStatus } = useTaskStore();
    const { getProjectById } = useProjectStore();
    const { getUserById, currentUser } = useUserStore();

    const task = getTaskById(id || '');
    const project = task ? getProjectById(task.projectId) : null;
    const assignee = task ? getUserById(task.assigneeId) : null;

    // Status label helper
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Todo': return 'Yapılacak';
            case 'In Progress': return 'Devam Ediyor';
            case 'Review': return 'İncelemede';
            case 'Done': return 'Tamamlandı';
            default: return status;
        }
    };

    // Priority label helper
    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'Low': return 'Düşük';
            case 'Medium': return 'Orta';
            case 'High': return 'Yüksek';
            case 'Urgent': return 'Acil';
            default: return priority;
        }
    };

    // Calculate progress
    const progress = task ? Math.round((task.loggedHours / task.estimatedHours) * 100) : 0;

    // Handle complete task
    const handleCompleteTask = () => {
        if (task && id) {
            updateTaskStatus(id, 'Done');
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // If task not found
    if (!task) {
        return (
            <div className="pb-20 animate-fade-in">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Geri Dön
                </button>

                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Görev Bulunamadı</h2>
                    <p className="text-gray-400 mb-4">Aradığınız görev mevcut değil veya silinmiş olabilir.</p>
                    <button
                        onClick={() => navigate('/tasks')}
                        className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg"
                    >
                        Görevlere Dön
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = taskStatusClasses[task.status];
    const priorityConfig = priorityClasses[task.priority];
    const projectColor = project ? colorClasses[project.color] : null;

    return (
        <div className="pb-20 animate-fade-in">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Task Info */}
                <div className="w-full lg:w-3/4 space-y-6">
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                    {getStatusLabel(task.status)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${priorityConfig.bg} ${priorityConfig.text}`}>
                                    {getPriorityLabel(task.priority)}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button className="p-2 hover:bg-dark-700 rounded-lg text-gray-400">
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                {task.status !== 'Done' && (
                                    <button
                                        onClick={handleCompleteTask}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Görevi Tamamla
                                    </button>
                                )}
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-4">{task.title}</h1>

                        <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-dark-700">
                            {/* Assignee */}
                            <div className="flex items-center">
                                <img
                                    src={`https://picsum.photos/id/${assignee?.avatar || 64}/32/32`}
                                    className="w-8 h-8 rounded-full mr-3"
                                    alt="Assignee"
                                />
                                <div>
                                    <p className="text-xs text-gray-400">Atanan Kişi</p>
                                    <p className="text-sm text-white font-medium">{assignee?.name || 'Atanmamış'}</p>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className="flex items-center">
                                <div className="bg-dark-700 p-2 rounded-full mr-3">
                                    <Calendar className="w-4 h-4 text-gray-300" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Son Tarih</p>
                                    <p className="text-sm text-white font-medium">{formatDate(task.dueDate)}</p>
                                </div>
                            </div>

                            {/* Estimated Time */}
                            <div className="flex items-center">
                                <div className="bg-dark-700 p-2 rounded-full mr-3">
                                    <Clock className="w-4 h-4 text-gray-300" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Tahmini Süre</p>
                                    <p className="text-sm text-white font-medium">{task.estimatedHours} Saat</p>
                                </div>
                            </div>

                            {/* Project */}
                            {project && (
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${projectColor?.dot || 'bg-gray-500'} mr-2`}></div>
                                    <div>
                                        <p className="text-xs text-gray-400">Proje</p>
                                        <p className="text-sm text-white font-medium">{project.title}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Açıklama</h3>
                            <div className="text-gray-300 text-sm leading-relaxed">
                                <p>{task.description}</p>
                            </div>
                        </div>

                        {/* Tags */}
                        {task.tags.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-400 mb-2">Etiketler</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {task.tags.map(tag => (
                                        <span key={tag} className="flex items-center px-3 py-1 bg-dark-700 rounded-full text-xs text-gray-300">
                                            <Tag className="w-3 h-3 mr-1" /> {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Progress Bar */}
                        <div className="bg-dark-900 rounded-lg p-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Görev İlerlemesi</span>
                                <span className="text-white">{Math.min(progress, 100)}%</span>
                            </div>
                            <div className="w-full bg-dark-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-right">
                                {task.loggedHours}/{task.estimatedHours} saat tamamlandı
                            </p>
                        </div>
                    </div>

                    {/* Timeline & Comments */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <h3 className="font-bold text-white mb-6">Aktivite Geçmişi</h3>

                        <div className="relative space-y-8 pl-8 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-dark-700">
                            <div className="relative">
                                <div className="absolute -left-8 top-0 w-6 h-6 bg-dark-800 border-2 border-primary rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                </div>
                                <p className="text-sm text-gray-300">Görev oluşturuldu.</p>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(task.createdAt)}</p>
                            </div>

                            {task.loggedHours > 0 && (
                                <div className="relative">
                                    <div className="absolute -left-8 top-0 w-6 h-6 bg-dark-800 border-2 border-blue-400 rounded-full flex items-center justify-center">
                                        <Clock className="w-3 h-3 text-blue-400" />
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        <span className="font-semibold text-white">{task.loggedHours} saat</span> çalışma kaydedildi.
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Son güncelleme: {formatDate(task.updatedAt)}</p>
                                </div>
                            )}

                            {task.status === 'Done' && (
                                <div className="relative">
                                    <div className="absolute -left-8 top-0 w-6 h-6 bg-dark-800 border-2 border-green-500 rounded-full flex items-center justify-center">
                                        <ThumbsUp className="w-3 h-3 text-green-500" />
                                    </div>
                                    <p className="text-sm text-gray-300">Görev tamamlandı.</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatDate(task.updatedAt)}</p>
                                </div>
                            )}
                        </div>

                        {/* Comment Input */}
                        <div className="mt-8 flex gap-4">
                            <img
                                src={`https://picsum.photos/id/${currentUser?.avatar || 64}/40/40`}
                                className="w-10 h-10 rounded-full"
                                alt="Me"
                            />
                            <div className="flex-1">
                                <textarea
                                    className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                                    rows={3}
                                    placeholder="Yorum yaz..."
                                ></textarea>
                                <div className="flex justify-end mt-2">
                                    <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">Gönder</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="w-full lg:w-1/4 space-y-6">
                    {/* AI Suggestions */}
                    <div className="bg-gradient-to-br from-indigo-900 to-dark-800 rounded-xl p-5 border border-indigo-500/30">
                        <div className="flex items-center space-x-2 mb-3">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <h3 className="font-bold text-white text-sm">YZ Önerileri</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="text-xs text-gray-300 bg-black/20 p-2 rounded border-l-2 border-yellow-400">
                                Bu görev için kalan süre {task.estimatedHours - task.loggedHours} saat olarak hesaplandı.
                            </li>
                            <li className="text-xs text-gray-300 bg-black/20 p-2 rounded border-l-2 border-blue-400">
                                {project ? `"${project.title}" projesindeki diğer görevlerle bağlantı kurabilirsiniz.` : 'Görevi bir projeye bağlamanız önerilir.'}
                            </li>
                        </ul>
                    </div>

                    {/* Task Stats */}
                    <div className="bg-dark-800 rounded-xl p-5 border border-dark-700">
                        <div className="flex items-center space-x-2 mb-4">
                            <BarChart className="w-4 h-4 text-purple-400" />
                            <h3 className="font-bold text-white text-sm">Görev İstatistikleri</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Zaman Kullanımı</span>
                                    <span className="text-blue-400">{task.loggedHours}/{task.estimatedHours} saat</span>
                                </div>
                                <div className="w-full bg-dark-700 h-1.5 rounded-full">
                                    <div
                                        className="bg-blue-500 h-1.5 rounded-full"
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Oluşturulma</span>
                                <span className="text-white">{formatDate(task.createdAt)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Son Güncelleme</span>
                                <span className="text-white">{formatDate(task.updatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Documents Placeholder */}
                    <div className="bg-dark-800 rounded-xl p-5 border border-dark-700">
                        <h3 className="font-bold text-white text-sm mb-4">İlgili Dokümanlar</h3>
                        <div className="text-center py-4 text-gray-500 text-sm">
                            Henüz doküman eklenmedi
                        </div>
                        <button className="w-full mt-2 text-xs text-gray-400 hover:text-white border border-dashed border-dark-600 rounded p-2 hover:bg-dark-700 transition">
                            + Doküman Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;