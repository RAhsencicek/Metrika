import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar,
  Trophy, Star, CheckCircle, Clock, TrendingUp,
  FileText, Target, Award, AlertCircle
} from 'lucide-react';
import { useUserStore, useProjectStore, useTaskStore } from '../store';
import { colorClasses, priorityClasses, taskStatusClasses } from '../utils/colorUtils';

const TeamMemberProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Store'lardan veri çekiyoruz
  const { getUserById } = useUserStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();

  const member = getUserById(id || '');

  // Get member's projects
  const memberProjects = projects.filter(p => p.teamMemberIds.includes(id || ''));

  // Get member's tasks
  const memberTasks = tasks.filter(t => t.assigneeId === id);
  const activeTasks = memberTasks.filter(t => t.status !== 'Done').slice(0, 5);

  // Calculate stats
  const completedTasks = memberTasks.filter(t => t.status === 'Done').length;
  const activeProjects = memberProjects.filter(p => p.status === 'Active').length;

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'Çevrimiçi';
      case 'busy': return 'Meşgul';
      case 'away': return 'Uzakta';
      default: return 'Çevrimdışı';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // If member not found
  if (!member) {
    return (
      <div className="pb-20 animate-fade-in">
        <button onClick={() => navigate('/team')} className="flex items-center text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ekibe Dön
        </button>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Üye Bulunamadı</h2>
          <p className="text-gray-400 mb-4">Aradığınız ekip üyesi mevcut değil.</p>
          <button
            onClick={() => navigate('/team')}
            className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg"
          >
            Ekibe Dön
          </button>
        </div>
      </div>
    );
  }

  // XP progress calculation
  const xpProgress = Math.round((member.xp / member.xpToNextLevel) * 100);

  return (
    <div className="pb-20 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate('/team')}
        className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Ekibe Dön
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 text-center">
            <div className="relative inline-block mb-4">
              <img
                src={`https://picsum.photos/id/${member.avatar}/150/150`}
                className="w-32 h-32 rounded-full border-4 border-dark-600 mx-auto"
                alt={member.name}
              />
              <div
                className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-dark-800 ${getStatusColor(member.status)}`}
                title={getStatusLabel(member.status)}
              ></div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">{member.name}</h1>
            <p className="text-primary font-medium mb-4">{member.role}</p>

            {/* Level & XP */}
            <div className="bg-dark-900/50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Seviye {member.level}</span>
                <span className="text-yellow-400 text-sm font-medium">{member.xp.toLocaleString()} XP</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {member.xpToNextLevel - member.xp} XP sonraki seviyeye
              </p>
            </div>

            {/* Rank Badge */}
            <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Sıralama: #{member.rank}</span>
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-3">
              <a
                href={`mailto:${member.email}`}
                className="flex-1 flex items-center justify-center bg-dark-700 hover:bg-dark-600 text-white py-3 rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </a>
              <a
                href={`tel:${member.phone}`}
                className="flex-1 flex items-center justify-center bg-primary hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                Ara
              </a>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center mr-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Departman</p>
                <p className="text-white">{member.department}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Lokasyon</p>
                <p className="text-white">{member.location}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center mr-3">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-white text-sm">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center mr-3">
                <Phone className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Telefon</p>
                <p className="text-white">{member.phone}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Katılım Tarihi</p>
                <p className="text-white">{formatDate(member.joinDate)}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-400" />
              Yetenekler
            </h3>
            <div className="space-y-3">
              {(member.skills || []).map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{skill.name}</span>
                    <span className="text-gray-500">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-center">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{completedTasks}</p>
              <p className="text-xs text-gray-400">Tamamlanan Görev</p>
            </div>
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-center">
              <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{activeProjects}</p>
              <p className="text-xs text-gray-400">Aktif Proje</p>
            </div>
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-center">
              <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{memberProjects.length}</p>
              <p className="text-xs text-gray-400">Toplam Proje</p>
            </div>
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-center">
              <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{(member.badges || []).length}</p>
              <p className="text-xs text-gray-400">Rozet</p>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-400" />
              Kazanılan Rozetler
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(member.badges || []).map((badge, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border text-center bg-${badge.color}-500/10 border-${badge.color}-500/30`}
                >
                  <div className={`w-12 h-12 rounded-full bg-${badge.color}-500/20 flex items-center justify-center mx-auto mb-2`}>
                    <Star className={`w-6 h-6 text-${badge.color}-400`} />
                  </div>
                  <p className="text-white text-sm font-medium">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Current Tasks */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              Aktif Görevler
            </h3>

            {activeTasks.length > 0 ? (
              <div className="space-y-3">
                {activeTasks.map((task) => {
                  const statusConfig = taskStatusClasses[task.status];
                  const priorityConfig = priorityClasses[task.priority];
                  const project = projects.find(p => p.id === task.projectId);

                  return (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="bg-dark-900 p-4 rounded-lg border border-dark-600 hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{task.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.text}`}>
                          {task.status === 'Todo' ? 'Yapılacak' :
                            task.status === 'In Progress' ? 'İşlemde' :
                              task.status === 'Review' ? 'İncelemede' : 'Tamamlandı'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${colorClasses[project?.color || 'blue']?.dot || 'bg-gray-500'} mr-1`}></div>
                          {project?.title || 'Proje Yok'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(task.dueDate)}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${priorityConfig.bg} ${priorityConfig.text}`}>
                          {task.priority === 'High' ? 'Yüksek' :
                            task.priority === 'Medium' ? 'Orta' :
                              task.priority === 'Urgent' ? 'Acil' : 'Düşük'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aktif görev bulunmuyor</p>
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-green-400" />
              Projeler
            </h3>

            {memberProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberProjects.map((project) => {
                  const colors = colorClasses[project.color];
                  return (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="bg-dark-900 p-4 rounded-lg border border-dark-600 hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center mb-3">
                        <div className={`w-3 h-3 rounded-full ${colors.dot} mr-2`}></div>
                        <h4 className="font-medium text-white">{project.title}</h4>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>{project.methodology}</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-1.5">
                        <div
                          className={`${colors.bg} h-1.5 rounded-full transition-all`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Henüz bir projeye dahil değil</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberProfile;
