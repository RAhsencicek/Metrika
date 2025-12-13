import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MethodologySelection from './pages/MethodologySelection';
import ProjectDetail from './pages/ProjectDetail';
import TaskDetail from './pages/TaskDetail';
import DocumentAnalysis from './pages/DocumentAnalysis';
import GamificationProfile from './pages/GamificationProfile';
import Leaderboard from './pages/Leaderboard';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import CalendarPage from './pages/CalendarPage';

// Simple wrapper to add layout classes
const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto pt-20 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 scroll-smooth">
            {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <LayoutContent>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/new" element={<MethodologySelection />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/documents/analysis" element={<DocumentAnalysis />} />
          <Route path="/gamification" element={<GamificationProfile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/calendar" element={<CalendarPage />} />
          {/* Fallback routes for demo */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </LayoutContent>
    </Router>
  );
};

export default App;