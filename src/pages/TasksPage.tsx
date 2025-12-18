import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, MoreHorizontal, Clock,
  CheckCircle, Circle, Pause, ArrowUpRight,
  LayoutGrid, List, Filter
} from 'lucide-react';
import { useTaskStore, useProjectStore, useUserStore } from '../store';
import { colorClasses, taskStatusClasses, priorityClasses } from '../utils/colorUtils';
import CreateTaskModal from '../components/CreateTaskModal';
import type { TaskStatus, TaskPriority } from '../types';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();

  // Store'lardan veri çekiyoruz
  const { tasks } = useTaskStore();
  const { getProjectById } = useProjectStore();
  const { getUserById } = useUserStore();

  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Status config helper
  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'Todo':
        return { icon: Circle, label: 'Yapılacak', ...taskStatusClasses['Todo'] };
      case 'In Progress':
        return { icon: ArrowUpRight, label: 'İşlemde', ...taskStatusClasses['In Progress'] };
      case 'Review':
        return { icon: Pause, label: 'İncelemede', ...taskStatusClasses['Review'] };
      case 'Done':
        return { icon: CheckCircle, label: 'Tamamlandı', ...taskStatusClasses['Done'] };
    }
  };

  // Priority config helper
  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case 'Low':
        return { label: 'Düşük', ...priorityClasses['Low'] };
      case 'Medium':
        return { label: 'Orta', ...priorityClasses['Medium'] };
      case 'High':
        return { label: 'Yüksek', ...priorityClasses['High'] };
      case 'Urgent':
        return { label: 'Acil', ...priorityClasses['Urgent'] };
    }
  };

  // Enhanced task with project and user info
  const enhancedTasks = useMemo(() => {
    return tasks.map(task => {
      // Birden fazla projeye bağlı olabilir, ilk projeyi göster
      const firstProjectId = task.projectIds[0];
      const project = firstProjectId ? getProjectById(firstProjectId) : null;
      const assignee = getUserById(task.assigneeId);
      return {
        ...task,
        projectName: project?.title || (task.projectIds.length === 0 ? 'Projesiz' : 'Proje Yok'),
        projectColor: project?.color || 'blue',
        projectCount: task.projectIds.length,
        assigneeName: assignee?.name || 'Atanmamış',
        assigneeAvatar: assignee?.avatar || 64,
      };
    });
  }, [tasks, getProjectById, getUserById]);

  // Unique projects for filter
  const uniqueProjects = useMemo(() => {
    return [...new Set(enhancedTasks.map(t => t.projectName))];
  }, [enhancedTasks]);

  // Filtering
  const filteredTasks = useMemo(() => {
    return enhancedTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesProject = projectFilter === 'All' || task.projectName === projectFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [enhancedTasks, searchQuery, statusFilter, priorityFilter, projectFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'Todo').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    review: tasks.filter(t => t.status === 'Review').length,
    done: tasks.filter(t => t.status === 'Done').length,
  }), [tasks]);

  // Group tasks by status for Kanban board
  const tasksByStatus = useMemo(() => ({
    'Todo': filteredTasks.filter(t => t.status === 'Todo'),
    'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'Review': filteredTasks.filter(t => t.status === 'Review'),
    'Done': filteredTasks.filter(t => t.status === 'Done'),
  }), [filteredTasks]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Bugün';
    if (date.toDateString() === tomorrow.toDateString()) return 'Yarın';

    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} gün önce`;
    if (diff <= 7) return `${diff} gün sonra`;

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="pb-20 animate-fade-in">
      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Görevler</h1>
          <p className="text-gray-400 text-sm mt-1">Tüm görevleri görüntüleyin ve yönetin</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Görev
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <p className="text-gray-400 text-xs uppercase font-medium">Toplam</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <p className="text-gray-400 text-xs uppercase font-medium">Yapılacak</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{stats.todo}</p>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <p className="text-gray-400 text-xs uppercase font-medium">İşlemde</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <p className="text-gray-400 text-xs uppercase font-medium">İncelemede</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{stats.review}</p>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <p className="text-gray-400 text-xs uppercase font-medium">Tamamlandı</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{stats.done}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Görev ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="All">Tüm Durumlar</option>
                <option value="Todo">Yapılacak</option>
                <option value="In Progress">İşlemde</option>
                <option value="Review">İncelemede</option>
                <option value="Done">Tamamlandı</option>
              </select>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="All">Tüm Öncelikler</option>
              <option value="Urgent">Acil</option>
              <option value="High">Yüksek</option>
              <option value="Medium">Orta</option>
              <option value="Low">Düşük</option>
            </select>

            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="All">Tüm Projeler</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-600">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-dark-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-2 rounded ${viewMode === 'board' ? 'bg-dark-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-900/50">
              <tr className="text-left text-xs text-gray-400 uppercase">
                <th className="px-6 py-4 font-semibold">Görev</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold">Öncelik</th>
                <th className="px-6 py-4 font-semibold">Proje</th>
                <th className="px-6 py-4 font-semibold">Atanan</th>
                <th className="px-6 py-4 font-semibold">Bitiş</th>
                <th className="px-6 py-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredTasks.map((task) => {
                const statusConfig = getStatusConfig(task.status);
                const priorityConfig = getPriorityConfig(task.priority);
                const colors = colorClasses[task.projectColor as keyof typeof colorClasses];

                return (
                  <tr
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="hover:bg-dark-700/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${priorityConfig.dot} mr-3`}></div>
                        <div>
                          <p className="font-medium text-white">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${priorityConfig.bg} ${priorityConfig.text}`}>
                        {priorityConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${colors?.dot || 'bg-gray-500'} mr-2`}></div>
                        <span className="text-sm text-gray-300">{task.projectName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={`https://picsum.photos/id/${task.assigneeAvatar}/32/32`}
                          className="w-6 h-6 rounded-full mr-2"
                          alt={task.assigneeName}
                        />
                        <span className="text-sm text-gray-300">{task.assigneeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <Clock className="w-3 h-3 mr-1 text-gray-500" />
                        {formatDate(task.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-2 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-white"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTasks.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Görev bulunamadı</h3>
              <p className="text-gray-400 text-sm">Arama kriterlerinize uygun görev bulunmamaktadır.</p>
            </div>
          )}
        </div>
      )}

      {/* BOARD VIEW (Kanban) */}
      {viewMode === 'board' && (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {(['Todo', 'In Progress', 'Review', 'Done'] as TaskStatus[]).map((status) => {
            const config = getStatusConfig(status);
            const StatusIcon = config.icon;
            const columnTasks = tasksByStatus[status];

            return (
              <div key={status} className="flex-shrink-0 w-80 bg-dark-800 rounded-xl p-4 border border-dark-700">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-700">
                  <div className="flex items-center">
                    <StatusIcon className={`w-4 h-4 mr-2 ${config.text}`} />
                    <h3 className="font-semibold text-white">{config.label}</h3>
                    <span className="ml-2 bg-dark-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button className="p-1 hover:bg-dark-700 rounded text-gray-400 hover:text-white">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Tasks */}
                <div className="space-y-3">
                  {columnTasks.map((task) => {
                    const priorityConfig = getPriorityConfig(task.priority);
                    const colors = colorClasses[task.projectColor as keyof typeof colorClasses];

                    return (
                      <div
                        key={task.id}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="bg-dark-900 p-4 rounded-lg border border-dark-600 hover:border-primary/50 cursor-pointer group transition-all"
                      >
                        {/* Priority & Menu */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${priorityConfig.bg} ${priorityConfig.text}`}>
                            {priorityConfig.label}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-700 rounded text-gray-400 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Title */}
                        <h4 className="font-medium text-white mb-2 line-clamp-2">{task.title}</h4>

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {task.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="text-xs bg-dark-700 text-gray-400 px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Project */}
                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <div className={`w-2 h-2 rounded-full ${colors?.dot || 'bg-gray-500'} mr-2`}></div>
                          {task.projectName}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-dark-700">
                          <img
                            src={`https://picsum.photos/id/${task.assigneeAvatar}/32/32`}
                            className="w-6 h-6 rounded-full"
                            alt={task.assigneeName}
                          />
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(task.dueDate)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      Bu durumda görev yok
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
