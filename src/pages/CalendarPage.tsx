import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { useTaskStore, useProjectStore } from '../store';
import AddEventModal from '../components/AddEventModal';

const CalendarPage: React.FC = () => {
    const { tasks } = useTaskStore();
    const { getProjectById } = useProjectStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const [selectedEventDate, setSelectedEventDate] = useState<Date | undefined>(undefined);

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

    // Get events for a specific date
    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return tasks.filter(task => task.dueDate === dateStr).map(task => {
            // Birden fazla projeye bağlı olabilir, ilk projeyi göster
            const firstProjectId = task.projectIds[0];
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

    // Open modal for adding event
    const openAddEvent = (date?: Date) => {
        setSelectedEventDate(date);
        setIsAddEventOpen(true);
    };

    return (
        <div className="pb-20 animate-fade-in h-full flex flex-col">
            {/* Add Event Modal */}
            <AddEventModal
                isOpen={isAddEventOpen}
                onClose={() => setIsAddEventOpen(false)}
                selectedDate={selectedEventDate}
            />

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
                        onClick={() => openAddEvent()}
                        className="flex items-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Etkinlik Ekle
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-dark-800 rounded-xl border border-dark-700 overflow-hidden flex flex-col">
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
                <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {calendarDays.map((dayInfo, index) => {
                        const dayEvents = getEventsForDate(dayInfo.date);
                        const today = isToday(dayInfo.date);

                        return (
                            <div
                                key={index}
                                className={`min-h-[100px] sm:min-h-[120px] p-2 border-b border-r border-dark-700/50 relative hover:bg-dark-700/20 transition-colors group ${!dayInfo.isCurrentMonth ? 'bg-dark-900/20' : ''
                                    }`}
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
                                            className={`text-[10px] px-1.5 py-0.5 rounded border-l-2 truncate cursor-pointer hover:opacity-80 transition ${eventColorClasses[event.color] || eventColorClasses.blue
                                                }`}
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
                                        openAddEvent(dayInfo.date);
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

            {/* Upcoming Tasks Summary */}
            <div className="mt-6 bg-dark-800 rounded-xl border border-dark-700 p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    Yaklaşan Görevler
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {tasks
                        .filter(t => t.status !== 'Done' && new Date(t.dueDate) >= new Date())
                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                        .slice(0, 4)
                        .map(task => {
                            // Birden fazla projeye bağlı olabilir, ilk projeyi göster
                            const firstProjectId = task.projectIds[0];
                            const project = firstProjectId ? getProjectById(firstProjectId) : null;
                            const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={task.id} className="bg-dark-900 p-3 rounded-lg border border-dark-600">
                                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{project?.title || 'Projesiz'}</p>
                                    <p className={`text-xs mt-2 ${daysLeft <= 2 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {daysLeft === 0 ? 'Bugün' : daysLeft === 1 ? 'Yarın' : `${daysLeft} gün kaldı`}
                                    </p>
                                </div>
                            );
                        })}
                    {tasks.filter(t => t.status !== 'Done' && new Date(t.dueDate) >= new Date()).length === 0 && (
                        <p className="text-gray-500 text-sm col-span-full">Yaklaşan görev bulunmuyor</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;