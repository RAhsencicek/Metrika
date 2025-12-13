import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, MoreHorizontal, Clock,
  CheckCircle, Circle, Pause, ArrowUpRight,
  LayoutGrid, List
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  projectId: string;
  projectName: string;
  projectColor: string;
  assignee: {
    name: string;
    avatar: number;
  };
  dueDate: string;
  tags: string[];
  estimatedHours: number;
  loggedHours: number;
  createdAt: string;
}

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [projectFilter, setProjectFilter] = useState<string>('All');

  // Mock Tasks Data
  const tasks: Task[] = [
    {
      id: '1',
      title: 'API Dokümantasyonu Hazırlama',
      description: 'Tüm API endpointleri için Swagger dokümantasyonu oluşturulacak.',
      status: 'In Progress',
      priority: 'High',
      projectId: '1',
      projectName: 'E-Ticaret Platformu',
      projectColor: 'blue',
      assignee: { name: 'Ahmet Kaya', avatar: 60 },
      dueDate: '2023-06-15',
      tags: ['Backend', 'Dokümantasyon'],
      estimatedHours: 16,
      loggedHours: 10,
      createdAt: '2023-06-01'
    },
    {
      id: '2',
      title: 'Tasarım Revizyonu',
      description: 'Ana sayfa ve ürün detay sayfası tasarımlarının güncellenmesi.',
      status: 'Review',
      priority: 'Medium',
      projectId: '1',
      projectName: 'E-Ticaret Platformu',
      projectColor: 'blue',
      assignee: { name: 'Ayşe Öztürk', avatar: 63 },
      dueDate: '2023-06-18',
      tags: ['UI/UX', 'Tasarım'],
      estimatedHours: 24,
      loggedHours: 20,
      createdAt: '2023-05-28'
    },
    {
      id: '3',
      title: 'Push Notification Entegrasyonu',
      description: 'Firebase ile mobil bildirim sistemi kurulumu.',
      status: 'Todo',
      priority: 'High',
      projectId: '2',
      projectName: 'Mobil Uygulama',
      projectColor: 'purple',
      assignee: { name: 'Zeynep Demir', avatar: 61 },
      dueDate: '2023-06-20',
      tags: ['Mobile', 'Firebase'],
      estimatedHours: 20,
      loggedHours: 0,
      createdAt: '2023-06-05'
    },
    {
      id: '4',
      title: 'Veritabanı İndeks Optimizasyonu',
      description: 'Yavaş sorguların analizi ve indeks iyileştirmeleri.',
      status: 'In Progress',
      priority: 'Urgent',
      projectId: '4',
      projectName: 'Veritabanı Opt.',
      projectColor: 'yellow',
      assignee: { name: 'Mehmet Yıldız', avatar: 62 },
      dueDate: '2023-06-12',
      tags: ['Database', 'Performance'],
      estimatedHours: 12,
      loggedHours: 8,
      createdAt: '2023-06-02'
    },
    {
      id: '5',
      title: 'Kullanıcı Kabul Testleri',
      description: 'Son sprint için UAT senaryolarının hazırlanması ve uygulanması.',
      status: 'Todo',
      priority: 'Medium',
      projectId: '1',
      projectName: 'E-Ticaret Platformu',
      projectColor: 'blue',
      assignee: { name: 'Caner Erkin', avatar: 65 },
      dueDate: '2023-06-25',
      tags: ['QA', 'Test'],
      estimatedHours: 32,
      loggedHours: 0,
      createdAt: '2023-06-08'
    },
    {
      id: '6',
      title: 'Ödeme Sistemi Entegrasyonu',
      description: 'iyzico ve PayTR entegrasyonlarının tamamlanması.',
      status: 'Done',
      priority: 'High',
      projectId: '1',
      projectName: 'E-Ticaret Platformu',
      projectColor: 'blue',
      assignee: { name: 'Ahmet Kaya', avatar: 60 },
      dueDate: '2023-06-10',
      tags: ['Backend', 'Payment'],
      estimatedHours: 40,
      loggedHours: 38,
      createdAt: '2023-05-15'
    },
    {
      id: '7',
      title: 'Responsive Düzenlemeler',
      description: 'Mobil ve tablet görünümlerinin iyileştirilmesi.',
      status: 'Review',
      priority: 'Low',
      projectId: '6',
      projectName: 'Müşteri Portalı',
      projectColor: 'cyan',
      assignee: { name: 'Ayşe Öztürk', avatar: 63 },
      dueDate: '2023-06-22',
      tags: ['Frontend', 'CSS'],
      estimatedHours: 16,
      loggedHours: 14,
      createdAt: '2023-06-04'
    },
    {
      id: '8',
      title: 'Login/Register Akışı',
      description: 'Kullanıcı giriş ve kayıt işlemleri için yeni akış tasarımı.',
      status: 'Done',
      priority: 'Medium',
      projectId: '2',
      projectName: 'Mobil Uygulama',
      projectColor: 'purple',
      assignee: { name: 'Zeynep Demir', avatar: 61 },
      dueDate: '2023-06-08',
      tags: ['Mobile', 'Auth'],
      estimatedHours: 24,
      loggedHours: 22,
      createdAt: '2023-05-20'
    }
  ];

  const getStatusConfig = (status: Task['status']) => {
    switch (status) {
      case 'Todo':
        return { icon: Circle, label: 'Yapılacak', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' };
      case 'In Progress':
        return { icon: ArrowUpRight, label: 'İşlemde', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'Review':
        return { icon: Pause, label: 'İncelemede', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' };
      case 'Done':
        return { icon: CheckCircle, label: 'Tamamlandı', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' };
    }
  };

  const getPriorityConfig = (priority: Task['priority']) => {
    switch (priority) {
      case 'Low':
        return { label: 'Düşük', bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' };
      case 'Medium':
        return { label: 'Orta', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' };
      case 'High':
        return { label: 'Yüksek', bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' };
      case 'Urgent':
        return { label: 'Acil', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' };
    }
  };

  // Unique projects for filter
  const uniqueProjects = [...new Set(tasks.map(t => t.projectName))];

  // Filtering
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'All' || task.projectName === projectFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  // Group tasks by status for board view
  const tasksByStatus = {
    'Todo': filteredTasks.filter(t => t.status === 'Todo'),
    'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'Review': filteredTasks.filter(t => t.status === 'Review'),
    'Done': filteredTasks.filter(t => t.status === 'Done'),
  };

  // Stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'Todo').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length,
  };

  const renderKanbanColumn = (status: Task['status'], taskList: Task[]) => {
    const statusConfig = getStatusConfig(status);
    const StatusIcon = statusConfig.icon;
    
    return (
      <div className="flex-1 min-w-[300px] bg-dark-800 rounded-xl p-4 border border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <StatusIcon className={`w-4 h-4 mr-2 ${statusConfig.text}`} />
            <h3 className="font-semibold text-white text-sm">{statusConfig.label}</h3>
            <span className="ml-2 bg-dark-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">
              {taskList.length}
            </span>
          </div>
          <button className="text-gray-400 hover:text-white">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          {taskList.map(task => {
            const priorityConfig = getPriorityConfig(task.priority);
            
            return (
              <div
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="bg-dark-900 p-4 rounded-lg border border-dark-600 hover:border-primary/50 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${priorityConfig.bg} ${priorityConfig.text}`}>
                    {priorityConfig.label}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                
                <h4 className="text-sm font-medium text-white mb-2 leading-snug">{task.title}</h4>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full bg-${task.projectColor}-500`}></span>
                  <span className="text-xs text-gray-500">{task.projectName}</span>
                </div>
                
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-dark-700 text-gray-400 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700">
                  <img 
                    src={`https://picsum.photos/id/${task.assignee.avatar}/24/24`}
                    className="w-6 h-6 rounded-full border border-dark-600"
                    alt={task.assignee.name}
                  />
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Görevler</h1>
          <p className="text-gray-400 text-sm mt-1">Tüm görevleri görüntüleyin ve yönetin</p>
        </div>
        <button 
          className="flex items-center px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Görev
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase font-medium">Toplam</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase font-medium">Yapılacak</p>
              <p className="text-2xl font-bold text-gray-400 mt-1">{stats.todo}</p>
            </div>
            <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
              <Circle className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase font-medium">İşlemde</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inProgress}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase font-medium">Tamamlanan</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.done}</p>
            </div>
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
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

      {/* Tasks List View */}
      {viewMode === 'list' && (
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-900/50">
              <tr className="text-left text-xs text-gray-400 uppercase">
                <th className="px-6 py-4 font-semibold">Görev</th>
                <th className="px-6 py-4 font-semibold">Proje</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold">Öncelik</th>
                <th className="px-6 py-4 font-semibold">Atanan</th>
                <th className="px-6 py-4 font-semibold">Bitiş</th>
                <th className="px-6 py-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredTasks.map((task) => {
                const statusConfig = getStatusConfig(task.status);
                const priorityConfig = getPriorityConfig(task.priority);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr 
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="hover:bg-dark-700/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        <div className="flex gap-1 mt-1">
                          {task.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-dark-700 text-gray-400 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full bg-${task.projectColor}-500 mr-2`}></span>
                        <span className="text-sm text-gray-300">{task.projectName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${priorityConfig.bg} ${priorityConfig.text}`}>
                        {priorityConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={`https://picsum.photos/id/${task.assignee.avatar}/24/24`}
                          className="w-6 h-6 rounded-full mr-2"
                          alt={task.assignee.name}
                        />
                        <span className="text-sm text-gray-300">{task.assignee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(task.dueDate).toLocaleDateString('tr-TR')}
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
        </div>
      )}

      {/* Tasks Board View (Kanban) */}
      {viewMode === 'board' && (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {renderKanbanColumn('Todo', tasksByStatus['Todo'])}
          {renderKanbanColumn('In Progress', tasksByStatus['In Progress'])}
          {renderKanbanColumn('Review', tasksByStatus['Review'])}
          {renderKanbanColumn('Done', tasksByStatus['Done'])}
        </div>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Görev bulunamadı</h3>
          <p className="text-gray-400 text-sm">Arama kriterlerinize uygun görev bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
