import React from 'react';
import { Bell, Mail, Settings, Menu, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTitle = () => {
    switch(location.pathname) {
      case '/': return 'Dashboard';
      case '/projects/new': return 'Yeni Proje Oluşturma';
      case '/tasks/1': return 'Görev Detay';
      case '/documents/analysis': return 'Yapay Zeka Doküman Analizi';
      case '/gamification': return 'Oyunlaştırma Profili';
      case '/leaderboard': return 'Liderlik Tablosu';
      case '/notifications': return 'Bildirimler';
      default: return 'Metrika';
    }
  };

  return (
    <header className="h-16 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4 sm:px-6 fixed top-0 w-full z-50">
      <div className="flex items-center">
        <div className="flex items-center cursor-pointer mr-8" onClick={() => navigate('/')}>
           <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
             <span className="font-bold text-white text-xl">M</span>
           </div>
           <span className="text-xl font-bold text-white tracking-tight hidden sm:block">Metrika</span>
        </div>
        
        {/* Mobile menu button could go here */}
        
        <h1 className="text-lg font-semibold text-white ml-4 sm:ml-0 hidden md:block">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Search Bar - Hidden on small mobile */}
        <div className="relative hidden md:block mr-4">
            <input 
                type="text" 
                placeholder="Ara..." 
                className="bg-dark-900 border border-dark-600 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary text-gray-300 w-64"
            />
            <Search className="w-4 h-4 absolute left-3 top-2 text-gray-500" />
        </div>

        <button onClick={() => navigate('/notifications')} className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-full relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark-800"></span>
        </button>
        
        <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-full transition-colors relative">
          <Mail className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-dark-800"></span>
        </button>

        <div className="h-8 w-px bg-dark-600 mx-2 hidden sm:block"></div>

        <div className="flex items-center cursor-pointer hover:bg-dark-700 p-1.5 rounded-lg transition-colors" onClick={() => navigate('/gamification')}>
            <div className="text-right mr-3 hidden sm:block">
                <div className="text-sm font-medium text-white">Emre Yılmaz</div>
                <div className="text-xs text-primary">Seviye 12</div>
            </div>
            <img 
                src="https://picsum.photos/id/64/100/100" 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-dark-600"
            />
        </div>
      </div>
    </header>
  );
};

export default Header;