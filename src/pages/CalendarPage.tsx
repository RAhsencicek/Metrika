import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { useTaskStore, useProjectStore } from '../store';
import AddEventModal from '../components/AddEventModal';

const CalendarPage: React.FC = () => {
    const { tasks, fetchTasks } = useTaskStore();
    const { getProjectById, fetchProjects } = useProjectStore();

    // All useState hooks MUST be called before any conditional returns (React rules of hooks)
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const [selectedEventDate, setSelectedEventDate] = useState<Date | undefined>(undefined);

    // Fetch data on mount
    useEffect(() => {
        fetchTasks();
        fetchProjects();
    }, [fetchTasks, fetchProjects]);

    // Safe access to tasks array that might be undefined from API
    const safeTasks = tasks || [];

    // Get current month info
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Month names in Turkish
    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

    // Calculate calendar days
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        // Get the day of week for the first day (0 = Sunday, adjust to Monday = 0)
        let startDay = firstDayOfMonth.getDay() - 1;
        if (startDay < 0) startDay = 6; // Sunday becomes 6

        // Previous month days
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        const prevMonthDays = Array.from({ length: startDay }, (_, i) => ({
            day: prevMonthLastDay - startDay + 1 + i,
            isCurrentMonth: false,
            isPrevMonth: true,
            date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - startDay + 1 + i)
        }));

        // Current month days
        const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            isCurrentMonth: true,
            isPrevMonth: false,
            date: new Date(currentYear, currentMonth, i + 1)
        }));

        // Next month days to fill the grid
        const totalDays = prevMonthDays.length + currentMonthDays.length;
        const nextMonthDaysCount = totalDays > 35 ? 42 - totalDays : 35 - totalDays;
        const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => ({
            day: i + 1,
            isCurrentMonth: false,
            isPrevMonth: false,
            date: new Date(currentYear, currentMonth + 1, i + 1)
        }));

        return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    }, [currentYear, currentMonth]);

    // Helper function to format date as YYYY-MM-DD using local timezone
    const formatLocalDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get events for a specific date
    const getEventsForDate = (date: Date) => {
        // Use local date format to avoid timezone issues
        const dateStr = formatLocalDate(date);
        return safeTasks
            .filter(task => {
                if (!task.dueDate) return false;
                // Normalize task dueDate to YYYY-MM-DD format for comparison
                const taskDateStr = task.dueDate.includes('T')
                    ? task.dueDate.split('T')[0]
                    : task.dueDate;
                return taskDateStr === dateStr;
            })
            .map(task => {
                const projectIds = task.projectIds || [];
                const firstProjectId = projectIds[0];
                const project = firstProjectId ? getProjectById(firstProjectId) : null;
                return {
                    id: task.id,
                    title: task.title,
                    type: task.status === 'Done' ? 'completed' : 'task',
                    color: project?.color || 'blue',
                    projectName: project?.title || ''
                };
            });
    };

    // Check if a date is today
    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Navigation
    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Color mapping for events (Tailwind-safe)
    const eventColorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 text-blue-300 border-blue-500',
        purple: 'bg-purple-500/10 text-purple-300 border-purple-500',
        green: 'bg-green-500/10 text-green-300 border-green-500',
        red: 'bg-red-500/10 text-red-300 border-red-500',
        yellow: 'bg-yellow-500/10 text-yellow-300 border-yellow-500',
        cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500',
        pink: 'bg-pink-500/10 text-pink-300 border-pink-500',
        orange: 'bg-orange-500/10 text-orange-300 border-orange-500',
    };

    return (
        <div className="pb-20 animate-fade-in h-full flex flex-col overflow-auto">
            {/* Add Event Modal - only render when open */}
            {isAddEventOpen && (
                <AddEventModal
                    isOpen={isAddEventOpen}
                    onClose={() => setIsAddEventOpen(false)}
                    selectedDate={selectedEventDate}
                />
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold text-white">Takvim</h1>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        Bugün
                    </button>
                    <div className="flex items-center bg-dark-800 rounded-lg p-1 border border-dark-700">
                        <button
                            onClick={goToPrevMonth}
                            className="p-1 hover:bg-dark-700 rounded transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <span className="px-4 text-sm font-medium text-white min-w-[140px] text-center">
                            {monthNames[currentMonth]} {currentYear}
                        </span>
                        <button
                            onClick={goToNextMonth}
                            className="p-1 hover:bg-dark-700 rounded transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsAddEventOpen(true)}
                        className="flex items-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Etkinlik Ekle
                    </button>
                </div>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-dark-700 bg-dark-900/50">
                    {weekDays.map(day => (
                        <div key={day} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.slice(0, 3)}</span>
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((dayInfo, index) => {
                        const dayEvents = getEventsForDate(dayInfo.date);
                        const today = isToday(dayInfo.date);

                        return (
                            <div
                                key={index}
                                className={`min-h-[100px] sm:min-h-[120px] p-2 border-b border-r border-dark-700/50 relative hover:bg-dark-700/20 transition-colors group ${!dayInfo.isCurrentMonth ? 'bg-dark-900/20' : ''}`}
                            >
                                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${today
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : dayInfo.isCurrentMonth
                                        ? 'text-gray-300'
                                        : 'text-gray-600'
                                    }`}>
                                    {dayInfo.day}
                                </span>

                                <div className="mt-1 space-y-1">
                                    {dayEvents.slice(0, 3).map((event) => (
                                        <div
                                            key={event.id}
                                            className={`text-[10px] px-1.5 py-0.5 rounded border-l-2 truncate cursor-pointer hover:opacity-80 transition ${eventColorClasses[event.color] || eventColorClasses.blue}`}
                                            title={`${event.title} - ${event.projectName}`}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className="text-[10px] text-gray-500 px-1.5">
                                            +{dayEvents.length - 3} daha
                                        </div>
                                    )}
                                </div>

                                {/* Add Button on Hover */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEventDate(dayInfo.date);
                                        setIsAddEventOpen(true);
                                    }}
                                    className="absolute bottom-1 right-1 p-1 rounded-full bg-dark-700 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-primary transition-all"
                                    title="Bu güne etkinlik ekle"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar with upcoming events */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <h3 className="text-white font-medium mb-3">Bu Aydaki Görevler</h3>
                    <div className="space-y-2">
                        {safeTasks
                            .filter(task => {
                                if (!task.dueDate) return false;
                                const taskDate = new Date(task.dueDate);
                                return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
                            })
                            .slice(0, 5)
                            .map(task => {
                                const projectIds = task.projectIds || [];
                                const firstProjectId = projectIds[0];
                                const project = firstProjectId ? getProjectById(firstProjectId) : null;
                                return (
                                    <div key={task.id} className="flex items-center justify-between bg-dark-700/50 rounded-lg p-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${task.status === 'Done' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                            <div>
                                                <p className="text-sm text-white">{task.title}</p>
                                                <p className="text-xs text-gray-500">{project?.title || 'Genel'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '-'}
                                        </div>
                                    </div>
                                );
                            })}
                        {safeTasks.filter(task => {
                            if (!task.dueDate) return false;
                            const taskDate = new Date(task.dueDate);
                            return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
                        }).length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">Bu ay için görev bulunmuyor</p>
                            )}
                    </div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <h3 className="text-white font-medium mb-3">Takvim İstatistikleri</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Bu aydaki görevler</span>
                            <span className="text-white font-medium">
                                {safeTasks.filter(task => {
                                    if (!task.dueDate) return false;
                                    const taskDate = new Date(task.dueDate);
                                    return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
                                }).length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Tamamlanan</span>
                            <span className="text-green-400 font-medium">
                                {safeTasks.filter(task => {
                                    if (!task.dueDate) return false;
                                    const taskDate = new Date(task.dueDate);
                                    return task.status === 'Done' && taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
                                }).length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Devam eden</span>
                            <span className="text-blue-400 font-medium">
                                {safeTasks.filter(task => {
                                    if (!task.dueDate) return false;
                                    const taskDate = new Date(task.dueDate);
                                    return task.status !== 'Done' && taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
                                }).length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;