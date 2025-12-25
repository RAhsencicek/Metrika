import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useUserStore, useProjectStore, useTaskStore, useAuthStore } from '../store';
import { colorClasses, priorityClasses } from '../utils/colorUtils';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentUser, fetchCurrentUser } = useUserStore();
  const { projects, fetchProjects, isLoading: projectsLoading } = useProjectStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore();

  // Fetch data on mount
  useEffect(() => {
    fetchProjects();
    fetchTasks();
    if (!currentUser) {
      fetchCurrentUser();
    }
  }, [fetchProjects, fetchTasks, fetchCurrentUser, currentUser]);

  const isLoading = projectsLoading || tasksLoading;

  // Calculate real stats
  const activeProjects = projects.filter(p => p.status === 'Active');
  const activeTasks = tasks.filter(t => t.status !== 'Done');
  const completedTasks = tasks.filter(t => t.status === 'Done');

  // Calculate completion percentage
  const completionPercentage = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const kpiData = [
    { name: 'Completed', value: completionPercentage, color: '#10b981' },
    { name: 'Remaining', value: 100 - completionPercentage, color: '#334155' },
  ];

  // Get upcoming tasks (excluding done)
  const upcomingTasks = tasks
    .filter(t => t.status !== 'Done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Bugün';
    if (date.toDateString() === tomorrow.toDateString()) return 'Yarın';
    return date.toLocaleDateString('tr-TR', { weekday: 'long' });
  };

  // Get display name (prefer auth user, fallback to currentUser from store)
  const displayName = user?.name || currentUser?.name || 'Kullanıcı';

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Loading State */}
      {isLoading && projects.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Veriler yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Welcome & Stats Row */}
      {(!isLoading || projects.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-2xl border border-primary/20 flex flex-col justify-between hover-lift card-shine">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Hoş Geldiniz, {displayName.split(' ')[0]}!
              </h2>
              <p className="text-sm text-gray-400">Bugün projelerinizde harika işler çıkarma zamanı.</p>
            </div>
            <button
              onClick={() => navigate('/projects/new')}
              className="mt-4 flex items-center justify-center w-full py-2 gradient-primary hover:opacity-90 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Proje
            </button>
          </div>

          <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 hover-lift card-shine animate-fade-in stagger-1" style={{ animationFillMode: 'both' }}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg icon-hover-bounce">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full animate-pulse">
                +{projects.length > 0 ? Math.round((activeProjects.length / projects.length) * 100) : 0}%
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1 animate-count-up">{projects.length}</div>
            <p className="text-sm text-gray-400">Toplam Proje</p>
          </div>

          <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 hover-lift card-shine animate-fade-in stagger-2" style={{ animationFillMode: 'both' }}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg icon-hover-bounce">
                <Zap className="w-5 h-5 text-purple-500 animate-float" />
              </div>
              <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                +{activeTasks.length}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1 animate-count-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>{activeTasks.length}</div>
            <p className="text-sm text-gray-400">Aktif Görevler</p>
          </div>

          <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 hover-lift card-shine animate-fade-in stagger-3" style={{ animationFillMode: 'both' }}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg icon-hover-bounce">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs font-medium text-gray-400">Bu Ay</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1 animate-count-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>{completedTasks.length}</div>
            <p className="text-sm text-gray-400">Tamamlanan Görevler</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Aktif Projeler</h3>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-primary hover:text-blue-400"
            >
              Tümü
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeProjects.slice(0, 4).map((project) => {
              const colors = colorClasses[project.color];
              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="bg-dark-800 p-5 rounded-xl border border-dark-700 hover:border-primary/50 transition-all cursor-pointer group hover-lift card-shine"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-full ${colors.bgLight} flex items-center justify-center ${colors.text} font-bold group-hover:scale-110 transition-transform`}>
                      {project.title.charAt(0)}
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="font-semibold text-white mb-1 group-hover:text-gradient">{project.title}</h4>
                  <p className="text-xs text-gray-400 mb-4">{project.description.substring(0, 40)}...</p>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>İlerleme</span>
                    <span className="text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-1.5 overflow-hidden">
                    <div className={`${colors.bg} h-1.5 rounded-full progress-bar-animated`} style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
              );
            })}

            {activeProjects.length === 0 && (
              <div
                onClick={() => navigate('/projects/new')}
                className="bg-dark-800/30 border-2 border-dashed border-dark-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-dark-800 hover:border-primary/50 transition-all group col-span-2"
              >
                <Plus className="w-8 h-8 text-gray-500 group-hover:text-primary mb-2" />
                <p className="text-gray-500 group-hover:text-white">İlk projenizi oluşturun</p>
              </div>
            )}
          </div>

          {/* AI Suggestions Panel */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Yapay Zeka Önerileri</h3>
              </div>
              <button onClick={() => navigate('/documents/analysis')} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-white transition-colors">
                Tümünü Gör
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-dark-900/50 p-3 rounded-lg flex items-start space-x-3 cursor-pointer hover:bg-dark-900/70">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-200">"Mobil Uygulama" projesi için sprint hızı düşüyor. Ek kaynak planlaması önerilir.</p>
                  <p className="text-xs text-gray-500 mt-1">AI Analizi • 2 saat önce</p>
                </div>
              </div>
              <div className="bg-dark-900/50 p-3 rounded-lg flex items-start space-x-3 cursor-pointer hover:bg-dark-900/70">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-200">Son yüklenen "Pazar Araştırması" dokümanında 3 kritik risk tespit edildi.</p>
                  <p className="text-xs text-gray-500 mt-1">Doküman Analizi • 5 saat önce</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: KPI & Tasks */}
        <div className="space-y-6">
          {/* KPI Summary */}
          <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">Proje Başarımı</h3>
              <button onClick={() => navigate('/kpi')} className="text-xs text-primary">Detay</button>
            </div>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kpiData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {kpiData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold text-white">{completionPercentage}%</div>
                <div className="text-xs text-gray-400">Tamamlanan</div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <div className="text-gray-400">Bütçe Kullanımı</div>
              <div className="text-white font-medium">
                {projects.length > 0
                  ? Math.round((projects.reduce((acc, p) => acc + p.budgetUsed, 0) / projects.reduce((acc, p) => acc + p.budget, 0)) * 100)
                  : 0}%
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Yaklaşan Görevler</h3>
            </div>
            <div className="space-y-4">
              {upcomingTasks.map((task) => {
                const priorityColor = priorityClasses[task.priority];
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="flex items-center justify-between p-3 bg-dark-900 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${priorityColor.dot}`}></div>
                      <div>
                        <p className="text-sm font-medium text-white">{task.title}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDueDate(task.dueDate)}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                );
              })}

              {upcomingTasks.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">Yaklaşan görev bulunmuyor</p>
              )}
            </div>
          </div>

          {/* Risk Alert */}
          {projects.some(p => p.status === 'At Risk') && (
            <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-400">Kritik Risk Uyarısı</h4>
                <p className="text-xs text-gray-300 mt-1">
                  {projects.filter(p => p.status === 'At Risk').length} projede risk tespit edildi.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;