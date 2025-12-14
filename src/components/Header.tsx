import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Bell, Mail, Search, Menu, FolderOpen, CheckSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore, useNotificationStore, useUIStore, useProjectStore, useTaskStore } from '../store';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, users } = useUserStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  const unreadCount = useNotificationStore((state) => state.getUnreadCount());
  const { toggleSidebar } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Animate bell when unread count changes
  useEffect(() => {
    if (unreadCount > 0) {
      setBellAnimating(true);
      const timer = setTimeout(() => setBellAnimating(false), 800);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { projects: [], tasks: [], users: [] };

    const query = searchQuery.toLowerCase();

    const matchedProjects = projects
      .filter(p => p.title.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query))
      .slice(0, 3);

    const matchedTasks = tasks
      .filter(t => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))
      .slice(0, 3);

    const matchedUsers = users
      .filter(u => u.name.toLowerCase().includes(query) || u.role.toLowerCase().includes(query))
      .slice(0, 3);

    return { projects: matchedProjects, tasks: matchedTasks, users: matchedUsers };
  }, [searchQuery, projects, tasks, users]);

  const hasResults = searchResults.projects.length > 0 || searchResults.tasks.length > 0 || searchResults.users.length > 0;

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search on ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Handle result click
  const handleResultClick = (type: string, id: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/${type}/${id}`);
  };

  const getTitle = () => {
    const path = location.pathname;

    switch (path) {
      case '/': return 'Dashboard';
      case '/projects': return 'Projeler';
      case '/projects/new': return 'Yeni Proje Oluşturma';
      case '/tasks': return 'Görevler';
      case '/documents/analysis': return 'Yapay Zeka Doküman Analizi';
      case '/gamification': return 'Başarılarım';
      case '/leaderboard': return 'Liderlik Tablosu';
      case '/notifications': return 'Bildirimler';
      case '/settings': return 'Ayarlar';
      case '/calendar': return 'Takvim';
      case '/team': return 'Ekip Üyeleri';
      case '/kpi': return 'KPI Gösterge Paneli';
      case '/help': return 'Yardım Merkezi';
    }

    if (path.startsWith('/projects/')) return 'Proje Detayı';
    if (path.startsWith('/tasks/')) return 'Görev Detayı';
    if (path.startsWith('/team/')) return 'Üye Profili';

    return 'Metrika';
  };

  return (
    <header className="h-16 glass-strong border-b border-dark-700/50 flex items-center justify-between px-4 sm:px-6 fixed top-0 right-0 left-0 md:left-64 z-40">
      {/* Gradient overlay */}
      <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" />

      <div className="flex items-center relative z-10">
        {/* Hamburger Menu Button - Mobile Only */}
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-lg mr-3 md:hidden transition-all hover-scale"
          aria-label="Menüyü Aç"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Logo */}
        <div className="flex items-center cursor-pointer mr-4 md:hidden" onClick={() => navigate('/')}>
          <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center mr-2 shadow-md shadow-primary/30">
            <span className="font-bold text-white text-sm">M</span>
          </div>
        </div>

        <h1 className="text-lg font-semibold text-white">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Search Bar with Dropdown */}
        <div ref={searchRef} className="relative hidden md:block">
          <input
            type="text"
            placeholder="Proje, görev veya kişi ara..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            className="bg-dark-900 border border-dark-600 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary text-gray-300 w-72"
          />
          <Search className="w-4 h-4 absolute left-3 top-2 text-gray-500" />

          {/* Search Results Dropdown */}
          {searchOpen && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden z-50">
              {hasResults ? (
                <div className="max-h-96 overflow-y-auto">
                  {/* Projects */}
                  {searchResults.projects.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs text-gray-500 uppercase px-2 py-1">Projeler</p>
                      {searchResults.projects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => handleResultClick('projects', project.id)}
                          className="w-full flex items-center px-3 py-2 hover:bg-dark-700 rounded-lg text-left transition-colors"
                        >
                          <FolderOpen className="w-4 h-4 text-primary mr-3" />
                          <div>
                            <p className="text-sm text-white">{project.title}</p>
                            <p className="text-xs text-gray-500">{project.methodology}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tasks */}
                  {searchResults.tasks.length > 0 && (
                    <div className="p-2 border-t border-dark-700">
                      <p className="text-xs text-gray-500 uppercase px-2 py-1">Görevler</p>
                      {searchResults.tasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => handleResultClick('tasks', task.id)}
                          className="w-full flex items-center px-3 py-2 hover:bg-dark-700 rounded-lg text-left transition-colors"
                        >
                          <CheckSquare className="w-4 h-4 text-green-400 mr-3" />
                          <div>
                            <p className="text-sm text-white">{task.title}</p>
                            <p className="text-xs text-gray-500">{task.status}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Users */}
                  {searchResults.users.length > 0 && (
                    <div className="p-2 border-t border-dark-700">
                      <p className="text-xs text-gray-500 uppercase px-2 py-1">Ekip Üyeleri</p>
                      {searchResults.users.map(user => (
                        <button
                          key={user.id}
                          onClick={() => handleResultClick('team', user.id)}
                          className="w-full flex items-center px-3 py-2 hover:bg-dark-700 rounded-lg text-left transition-colors"
                        >
                          <img
                            src={`https://picsum.photos/id/${user.avatar}/32/32`}
                            className="w-6 h-6 rounded-full mr-3"
                            alt={user.name}
                          />
                          <div>
                            <p className="text-sm text-white">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Search className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Sonuç bulunamadı</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Search Button */}
        <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-full transition-all md:hidden icon-hover-bounce">
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className={`p-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-full relative transition-all icon-hover-shake ${bellAnimating ? 'animate-bell-ring' : ''}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 gradient-danger rounded-full border-2 border-dark-800 flex items-center justify-center text-[10px] font-bold text-white animate-bounce-in notification-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-full transition-all relative hidden sm:block icon-hover-bounce">
          <Mail className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 gradient-primary rounded-full border-2 border-dark-800 animate-pulse"></span>
        </button>

        <div className="h-8 w-px bg-dark-600 mx-2 hidden sm:block"></div>

        <div
          className="flex items-center cursor-pointer hover:bg-dark-700/50 p-1.5 rounded-lg transition-all group hover-scale"
          onClick={() => navigate('/gamification')}
        >
          <div className="text-right mr-3 hidden sm:block">
            <div className="text-sm font-medium text-white group-hover:text-gradient transition-all">{currentUser?.name || 'Kullanıcı'}</div>
            <div className="text-xs text-primary flex items-center justify-end gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Seviye {currentUser?.level || 1}
            </div>
          </div>
          <div className="relative">
            <img
              src={`https://picsum.photos/id/${currentUser?.avatar || 64}/100/100`}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-primary/50 group-hover:border-primary transition-all group-hover:shadow-lg group-hover:shadow-primary/30"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-800"></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;