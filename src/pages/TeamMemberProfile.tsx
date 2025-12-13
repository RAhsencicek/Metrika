import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, 
  Trophy, Star, Zap, CheckCircle, Clock, TrendingUp,
  MessageSquare, FileText, Target, Award
} from 'lucide-react';

const TeamMemberProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock Member Data (would come from API based on id)
  const member = {
    id: id || '1',
    name: 'Ahmet Kaya',
    email: 'ahmet.kaya@metrika.com',
    phone: '+90 555 234 56 78',
    role: 'Senior Backend Developer',
    department: 'Yazılım Geliştirme',
    location: 'İstanbul Ofis',
    joinDate: '2021-03-15',
    avatar: 60,
    status: 'online' as const,
    bio: 'Yazılım geliştirme alanında 8 yıllık deneyim. Node.js, Python ve Go konularında uzman. Mikroservis mimarileri ve cloud computing üzerine çalışmalar.',
    level: 18,
    xp: 15420,
    xpToNextLevel: 18000,
    rank: 3,
    skills: [
      { name: 'Backend Development', level: 95 },
      { name: 'Database Design', level: 88 },
      { name: 'API Design', level: 92 },
      { name: 'DevOps', level: 75 },
      { name: 'Problem Solving', level: 90 },
    ],
    badges: [
      { name: 'Kod Ustası', icon: Star, color: 'yellow' },
      { name: 'Hız Şampiyonu', icon: Zap, color: 'purple' },
      { name: 'Takım Oyuncusu', icon: Trophy, color: 'blue' },
      { name: 'Mentor', icon: Award, color: 'green' },
    ],
    stats: {
      completedTasks: 156,
      activeProjects: 3,
      totalProjects: 12,
      avgTaskTime: '2.4 gün',
      onTimeRate: 94,
    },
    currentTasks: [
      { id: '1', title: 'API Dokümantasyonu', project: 'E-Ticaret', status: 'In Progress', dueDate: '2023-06-15', priority: 'High' },
      { id: '2', title: 'Auth Servisi Güncelleme', project: 'E-Ticaret', status: 'Review', dueDate: '2023-06-18', priority: 'Medium' },
      { id: '3', title: 'Database Migration', project: 'CRM', status: 'Todo', dueDate: '2023-06-22', priority: 'High' },
    ],
    projects: [
      { id: '1', name: 'E-Ticaret Platformu', role: 'Lead Developer', progress: 65, color: 'blue' },
      { id: '3', name: 'CRM Entegrasyonu', role: 'Backend Developer', progress: 100, color: 'green' },
      { id: '4', name: 'Veritabanı Opt.', role: 'Consultant', progress: 35, color: 'yellow' },
    ],
    recentActivity: [
      { action: 'API Endpoint oluşturdu', project: 'E-Ticaret', time: '2 saat önce', xp: 25 },
      { action: 'Code review tamamladı', project: 'CRM', time: '5 saat önce', xp: 15 },
      { action: 'Bug fix commit etti', project: 'E-Ticaret', time: '1 gün önce', xp: 20 },
      { action: 'Dokümantasyon güncelledi', project: 'E-Ticaret', time: '2 gün önce', xp: 10 },
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Medium': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Low': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-500/10 text-blue-400';
      case 'Review': return 'bg-purple-500/10 text-purple-400';
      case 'Todo': return 'bg-gray-500/10 text-gray-400';
      case 'Done': return 'bg-green-500/10 text-green-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="pb-20 animate-fade-in">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/team')}
        className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Ekip Listesine Dön
      </button>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-dark-800 rounded-2xl p-8 mb-8 border border-blue-800/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <img 
              src={`https://picsum.photos/id/${member.avatar}/128/128`}
              className="w-28 h-28 rounded-full border-4 border-primary/30"
              alt={member.name}
            />
            <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-dark-800 ${getStatusColor(member.status)}`}></div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-dark-900">
              {member.level}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{member.name}</h1>
              <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
                #{member.rank} Sıralama
              </span>
            </div>
            <p className="text-primary font-medium mb-2">{member.role}</p>
            <p className="text-gray-400 text-sm max-w-2xl">{member.bio}</p>
            
            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center text-sm text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                {member.email}
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                {member.phone}
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                {member.location}
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Briefcase className="w-4 h-4 mr-2" />
                {member.department}
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="bg-dark-900/50 p-5 rounded-xl border border-dark-700 min-w-[200px]">
            <div className="text-center mb-3">
              <p className="text-2xl font-bold text-white">{member.xp.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Toplam XP</p>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                style={{ width: `${(member.xp / member.xpToNextLevel) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Seviye {member.level + 1}'e {(member.xpToNextLevel - member.xp).toLocaleString()} XP
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-center">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{member.stats.completedTasks}</p>
              <p className="text-xs text-gray-400">Tamamlanan Görev</p>
            </div>
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-center">
              <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{member.stats.activeProjects}</p>
              <p className="text-xs text-gray-400">Aktif Proje</p>
            </div>
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-center">
              <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{member.stats.avgTaskTime}</p>
              <p className="text-xs text-gray-400">Ort. Görev Süresi</p>
            </div>
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-center">
              <TrendingUp className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{member.stats.onTimeRate}%</p>
              <p className="text-xs text-gray-400">Zamanında Teslimat</p>
            </div>
          </div>

          {/* Current Tasks */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Güncel Görevler</h3>
              <span className="text-xs text-gray-400">{member.currentTasks.length} aktif</span>
            </div>
            
            <div className="space-y-3">
              {member.currentTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="bg-dark-900 p-4 rounded-lg border border-dark-700 hover:border-primary/50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${getTaskStatusBadge(task.status)}`}>
                        {task.status === 'In Progress' ? 'İşlemde' : task.status === 'Review' ? 'İncelemede' : 'Yapılacak'}
                      </span>
                    </div>
                    <p className="font-medium text-white truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{task.project}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Dahil Olduğu Projeler</h3>
              <span className="text-xs text-gray-400">{member.projects.length} proje</span>
            </div>
            
            <div className="space-y-4">
              {member.projects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="flex items-center justify-between p-4 bg-dark-900 rounded-lg hover:bg-dark-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full bg-${project.color}-500 mr-3`}></div>
                    <div>
                      <p className="font-medium text-white">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-dark-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full bg-${project.color}-500`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-white w-10 text-right">{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="text-lg font-bold text-white mb-6">Son Aktiviteler</h3>
            
            <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-dark-700">
              {member.recentActivity.map((activity, idx) => (
                <div key={idx} className="relative flex items-center justify-between">
                  <div className="absolute -left-[17px] w-3 h-3 rounded-full bg-primary border-2 border-dark-800"></div>
                  <div>
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.project} • {activity.time}</p>
                  </div>
                  <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                    +{activity.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="font-bold text-white mb-4">Kazanılan Rozetler</h3>
            <div className="grid grid-cols-2 gap-3">
              {member.badges.map((badge, idx) => (
                <div 
                  key={idx}
                  className="bg-dark-900 p-3 rounded-lg border border-dark-700 text-center hover:border-dark-500 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-full bg-${badge.color}-500/10 flex items-center justify-center`}>
                    <badge.icon className={`w-5 h-5 text-${badge.color}-500`} />
                  </div>
                  <p className="text-xs font-medium text-white">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="font-bold text-white mb-4">Beceriler</h3>
            <div className="space-y-4">
              {member.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>{skill.name}</span>
                    <span className="text-white">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="font-bold text-white mb-4">Hızlı İşlemler</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                <MessageSquare className="w-4 h-4" />
                Mesaj Gönder
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm font-medium transition-colors">
                <FileText className="w-4 h-4" />
                Görev Ata
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm font-medium transition-colors">
                <Star className="w-4 h-4" />
                Takdir Et
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="font-bold text-white mb-4">Bilgiler</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Katılım Tarihi</span>
                <span className="text-white">
                  {new Date(member.joinDate).toLocaleDateString('tr-TR', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Toplam Proje</span>
                <span className="text-white">{member.stats.totalProjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Departman</span>
                <span className="text-white">{member.department}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberProfile;
