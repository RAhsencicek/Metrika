import type { ProjectColor } from '../types';

// Color utility maps for dynamic Tailwind class usage
// Tailwind v4 doesn't support dynamic class names like `bg-${color}-500`
// We need to map colors to their full class names

export const colorClasses: Record<ProjectColor, {
    bg: string;
    bgLight: string;
    text: string;
    border: string;
    dot: string;
}> = {
    blue: {
        bg: 'bg-blue-500',
        bgLight: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500',
        dot: 'bg-blue-500',
    },
    purple: {
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500',
        dot: 'bg-purple-500',
    },
    green: {
        bg: 'bg-green-500',
        bgLight: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500',
        dot: 'bg-green-500',
    },
    yellow: {
        bg: 'bg-yellow-500',
        bgLight: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500',
        dot: 'bg-yellow-500',
    },
    red: {
        bg: 'bg-red-500',
        bgLight: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500',
        dot: 'bg-red-500',
    },
    cyan: {
        bg: 'bg-cyan-500',
        bgLight: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500',
        dot: 'bg-cyan-500',
    },
    orange: {
        bg: 'bg-orange-500',
        bgLight: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500',
        dot: 'bg-orange-500',
    },
    pink: {
        bg: 'bg-pink-500',
        bgLight: 'bg-pink-500/10',
        text: 'text-pink-400',
        border: 'border-pink-500',
        dot: 'bg-pink-500',
    },
};

// Priority color classes
export const priorityClasses = {
    Low: {
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        dot: 'bg-gray-400',
        border: 'border-gray-500/30',
    },
    Medium: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        dot: 'bg-blue-400',
        border: 'border-blue-500/30',
    },
    High: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        dot: 'bg-orange-400',
        border: 'border-orange-500/30',
    },
    Urgent: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        dot: 'bg-red-400',
        border: 'border-red-500/30',
    },
};

// Status color classes for tasks
export const taskStatusClasses = {
    'Todo': {
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
    },
    'In Progress': {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
    },
    'Review': {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
    },
    'Done': {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500/30',
    },
};

// Status color classes for projects
export const projectStatusClasses = {
    'Active': {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500/30',
        label: 'Aktif',
    },
    'Completed': {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        label: 'Tamamlandı',
    },
    'On Hold': {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        label: 'Beklemede',
    },
    'At Risk': {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        label: 'Riskli',
    },
};

// Methodology badge classes
export const methodologyClasses = {
    'Scrum': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'Waterfall': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'Hybrid': 'bg-green-500/10 text-green-400 border-green-500/30',
};

// Helper function to get color dot class
export const getColorDot = (color: ProjectColor): string => colorClasses[color]?.dot || 'bg-gray-500';

// Helper function to get full progress bar class
export const getProgressBarClass = (color: ProjectColor): string => colorClasses[color]?.bg || 'bg-blue-500';
