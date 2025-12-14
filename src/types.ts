// ============== USER TYPES ==============
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: number;
  role: string;
  department: string;
  location: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  level: number;
  xp: number;
  xpToNextLevel: number;
  rank?: number;
  bio?: string;
  joinDate: string;
  skills?: Skill[];
  badges?: Badge[];
  // Gamification fields
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate?: string;
  unlockedAchievements?: string[];
}

export interface Skill {
  name: string;
  level: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  earnedAt?: string;
}

// ============== PROJECT TYPES ==============
export type ProjectStatus = 'Active' | 'Completed' | 'On Hold' | 'At Risk';
export type ProjectMethodology = 'Waterfall' | 'Scrum' | 'Hybrid';
export type ProjectColor = 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'cyan' | 'orange' | 'pink';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  methodology: ProjectMethodology;
  startDate: string;
  dueDate: string;
  teamSize: number;
  tasksCompleted: number;
  totalTasks: number;
  budget: number;
  budgetUsed: number;
  color: ProjectColor;
  managerId: string;
  teamMemberIds: string[];
  kpis: KPI[];
  createdAt: string;
  updatedAt: string;
}

export interface KPI {
  id: string;
  name: string;
  target: string;
  current?: string;
  unit: string;
}

// ============== TASK TYPES ==============
export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string;
  dueDate: string;
  tags: string[];
  estimatedHours: number;
  loggedHours: number;
  createdAt: string;
  updatedAt: string;
}

// ============== NOTIFICATION TYPES ==============
export type NotificationType = 'success' | 'warning' | 'info' | 'error' | 'xp' | 'badge' | 'meeting' | 'task';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// ============== CALENDAR TYPES ==============
export type CalendarEventType = 'meeting' | 'deadline' | 'task' | 'milestone';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: CalendarEventType;
  color: ProjectColor;
  projectId?: string;
}

// ============== DOCUMENT TYPES ==============
export interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'Link' | 'Other';
  size: string;
  uploaderId: string;
  projectId?: string;
  uploadDate: string;
  url?: string;
}

// ============== ACTIVITY TYPES ==============
export interface Activity {
  id: string;
  userId: string;
  action: string;
  projectId?: string;
  taskId?: string;
  xpEarned?: number;
  timestamp: string;
}
