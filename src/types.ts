export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface Project {
  id: string;
  title: string;
  status: 'Active' | 'Completed' | 'On Hold';
  progress: number;
  methodology?: 'Waterfall' | 'Scrum' | 'Hybrid';
  description?: string;
  dueDate?: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  assignee: User;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}
