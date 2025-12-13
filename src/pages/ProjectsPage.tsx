import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, MoreHorizontal, Users,
  TrendingUp, Clock, CheckCircle, AlertCircle,
  LayoutGrid, List
} from 'lucide-react';
import { useProjectStore, useUserStore } from '../store';
import { colorClasses, projectStatusClasses, methodologyClasses } from '../utils/colorUtils';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  const { getUserById } = useUserStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [methodologyFilter, setMethodologyFilter] = useState<string>('All');

  // Filtering
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
      const matchesMethodology = methodologyFilter === 'All' || project.methodology === methodologyFilter;
      return matchesSearch && matchesStatus && matchesMethodology;
    });
  }, [projects, searchQuery, statusFilter, methodologyFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === 'Active').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    atRisk: projects.filter(p => p.status === 'At Risk').length,
  }), [projects]);

  return (
    <div className="pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projeler</h1>
          <p className="text-gray-400 text-sm mt-1">Tüm projeleri görüntüleyin ve yönetin</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="flex items-center px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Proje
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
              <p className="text-gray-400 text-xs uppercase font-medium">Aktif</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.active}</p>
            </div>
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase font-medium">Tamamlanan</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{stats.completed}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase font-medium">Riskli</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{stats.atRisk}</p>
            </div>
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
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
              placeholder="Proje ara..."
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
                <option value="Active">Aktif</option>
                <option value="Completed">Tamamlandı</option>
                <option value="On Hold">Beklemede</option>
                <option value="At Risk">Riskli</option>
              </select>
            </div>

            {/* Methodology Filter */}
            <select
              value={methodologyFilter}
              onChange={(e) => setMethodologyFilter(e.target.value)}
              className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="All">Tüm Metodolojiler</option>
              <option value="Scrum">Scrum</option>
              <option value="Waterfall">Waterfall</option>
              <option value="Hybrid">Hibrit</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-600">
              <button
                onClick={() => setViewMode('grid')}
                className={`p - 2 rounded ${viewMode === 'grid' ? 'bg-dark-700 text-white' : 'text-gray-400 hover:text-white'} `}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p - 2 rounded ${viewMode === 'list' ? 'bg-dark-700 text-white' : 'text-gray-400 hover:text-white'} `}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const statusConfig = projectStatusClasses[project.status];
            const colors = colorClasses[project.color];
            const manager = getUserById(project.managerId);

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/ projects / ${project.id} `)}
                className="bg-dark-800 rounded-xl border border-dark-700 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden"
              >
                {/* Color Bar */}
                <div className={`h - 1 ${colors.bg} `}></div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text - xs px - 2 py - 1 rounded - full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} `}>
                          {statusConfig.label}
                        </span>
                        <span className={`text - xs px - 2 py - 1 rounded - full border ${methodologyClasses[project.methodology]} `}>
                          {project.methodology}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white truncate group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      <span>İlerleme</span>
                      <span className="text-white font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div
                        className={`h - 2 rounded - full ${colors.bg} transition - all`}
                        style={{ width: `${project.progress}% ` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-dark-900/50 p-2 rounded-lg">
                      <div className="flex items-center text-xs text-gray-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        <span>Görevler</span>
                      </div>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {project.tasksCompleted}/{project.totalTasks}
                      </p>
                    </div>
                    <div className="bg-dark-900/50 p-2 rounded-lg">
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Bitiş</span>
                      </div>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {new Date(project.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                    <div className="flex items-center">
                      {manager && (
                        <>
                          <img
                            src={`https://picsum.photos/id/${manager.avatar}/32/32`}
                            className="w-7 h-7 rounded-full border border-dark-600"
                            alt={manager.name}
                          />
                          <span className="text-xs text-gray-400 ml-2">{manager.name}</span>
                        </>
                      )}
                    </div >
                    <div className="flex items-center text-xs text-gray-400">
                      <Users className="w-3 h-3 mr-1" />
                      {project.teamSize}
                    </div>
                  </div >
                </div >
              </div >
            );
          })}

          {/* Add New Project Card */}
          <div
            onClick={() => navigate('/projects/new')}
            className="bg-dark-800/30 border-2 border-dashed border-dark-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-dark-800 hover:border-primary/50 transition-all min-h-[320px] group"
          >
            <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary" />
            </div>
            <h3 className="font-bold text-gray-400 group-hover:text-white transition-colors">Yeni Proje Oluştur</h3>
            <p className="text-xs text-gray-500 mt-2 text-center">Metodoloji seçerek başlayın</p>
          </div>
        </div >
      ) : (
        /* List View */
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-900/50">
              <tr className="text-left text-xs text-gray-400 uppercase">
                <th className="px-6 py-4 font-semibold">Proje</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold">Metodoloji</th>
                <th className="px-6 py-4 font-semibold">İlerleme</th>
                <th className="px-6 py-4 font-semibold">Ekip</th>
                <th className="px-6 py-4 font-semibold">Bitiş</th>
                <th className="px-6 py-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredProjects.map((project) => {
                const statusConfig = projectStatusClasses[project.status];
                const colors = colorClasses[project.color];
                const manager = getUserById(project.managerId);

                return (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="hover:bg-dark-700/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${colors.dot} mr-3`}></div>
                        <div>
                          <p className="font-medium text-white">{project.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{manager?.name || 'Yönetici atanmamış'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${methodologyClasses[project.methodology]}`}>
                        {project.methodology}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-dark-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${colors.bg}`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <Users className="w-4 h-4 mr-1 text-gray-500" />
                        {project.teamSize}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(project.dueDate).toLocaleDateString('tr-TR')}
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

      {/* Empty State */}
      {
        filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Proje bulunamadı</h3>
            <p className="text-gray-400 text-sm">Arama kriterlerinize uygun proje bulunmamaktadır.</p>
          </div>
        )
      }
    </div >
  );
};

export default ProjectsPage;
