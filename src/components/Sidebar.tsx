import React from 'react';
import { NavLink } from 'react-router-dom';
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
  LogOut 
} from 'lucide-react';

const Sidebar: React.FC = () => {
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

  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col h-full hidden md:flex shrink-0 pt-16">
      <div className="p-4">
         {/* Spacer removed, handled by pt-16 */}
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-gray-400 hover:bg-dark-700 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
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
  );
};

export default Sidebar;