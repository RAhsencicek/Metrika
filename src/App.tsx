import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectWizard from './pages/CreateProjectWizard';
import ProjectDetail from './pages/ProjectDetail';
import TasksPage from './pages/TasksPage';
import TaskDetail from './pages/TaskDetail';
import DocumentAnalysis from './pages/DocumentAnalysis';
import GamificationProfile from './pages/GamificationProfile';
import Leaderboard from './pages/Leaderboard';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import CalendarPage from './pages/CalendarPage';
import TeamPage from './pages/TeamPage';
import TeamMemberProfile from './pages/TeamMemberProfile';
import KPIPage from './pages/KPIPage';
import HelpPage from './pages/HelpPage';

// Layout wrapper with Sidebar and Header
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
          {/* Projects */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<CreateProjectWizard />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          {/* Tasks */}
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          {/* Documents */}
          <Route path="/documents/analysis" element={<DocumentAnalysis />} />
          {/* Gamification */}
          <Route path="/gamification" element={<GamificationProfile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          {/* Other Pages */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/calendar" element={<CalendarPage />} />
          {/* Team */}
          <Route path="/team" element={<TeamPage />} />
          <Route path="/team/:id" element={<TeamMemberProfile />} />
          {/* KPI & Help */}
          <Route path="/kpi" element={<KPIPage />} />
          <Route path="/help" element={<HelpPage />} />
          {/* Fallback route */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </LayoutContent>
    </Router>
  );
};

export default App;
