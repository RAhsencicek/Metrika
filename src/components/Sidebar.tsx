import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  FileText,
  BarChart2,
  Trophy,
  Users,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';
import { useUIStore } from '../store';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, closeSidebar } = useUIStore();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Projeler', icon: FolderOpen, path: '/projects' },
    { name: 'Görevler', icon: CheckSquare, path: '/tasks' },
    { name: 'Dokümanlar', icon: FileText, path: '/documents/analysis' },
    { name: 'KPI\'lar', icon: BarChart2, path: '/kpi' },
    { name: 'Oyunlaştırma', icon: Trophy, path: '/gamification' },
    { name: 'Ekip', icon: Users, path: '/team' },
    { name: 'Takvim', icon: Calendar, path: '/calendar' },
    { name: 'Ayarlar', icon: Settings, path: '/settings' },
  ];

  // Close sidebar on route change (mobile)
  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  // Close sidebar on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeSidebar]);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-dark-800 border-r border-dark-700 
          flex flex-col h-full shrink-0 pt-16
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Mobile Close Button */}
        <div className="absolute top-4 right-4 md:hidden">
          <button
            onClick={closeSidebar}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Spacer removed, handled by pt-16 */}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            // Custom active check - also matches child routes
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary border-r-2 border-primary'
                    : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-dark-700 space-y-1">
          <NavLink
            to="/help"
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-dark-700 hover:text-white transition-colors"
          >
            <HelpCircle className="w-5 h-5 mr-3" />
            Yardım
          </NavLink>
          <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-dark-700 hover:text-red-300 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Çıkış
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;