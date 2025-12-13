import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const CalendarPage: React.FC = () => {
  // Mock calendar data
  const days = Array.from({ length: 35 }, (_, i) => i + 1);
  const events = [
    { day: 5, title: 'Sprint Review', type: 'meeting', color: 'purple' },
    { day: 12, title: 'Web Sitesi Lansmanı', type: 'deadline', color: 'red' },
    { day: 12, title: 'Müşteri Toplantısı', type: 'meeting', color: 'purple' },
    { day: 18, title: 'API Testleri', type: 'task', color: 'blue' },
    { day: 24, title: 'Veritabanı Bakımı', type: 'task', color: 'yellow' },
    { day: 28, title: 'Q3 Planlama', type: 'meeting', color: 'green' },
  ];

  const getEventsForDay = (day: number) => {
    // Adjust logic for real calendar (this assumes day numbers match index for simplicity)
    const actualDay = day > 0 && day <= 30 ? day : -1;
    return events.filter(e => e.day === actualDay);
  };

  return (
    <div className="pb-20 animate-fade-in h-full flex flex-col">
       <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Takvim</h1>
            <div className="flex items-center space-x-4">
                <div className="flex items-center bg-dark-800 rounded-lg p-1 border border-dark-700">
                    <button className="p-1 hover:bg-dark-700 rounded"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
                    <span className="px-4 text-sm font-medium text-white">Haziran 2023</span>
                    <button className="p-1 hover:bg-dark-700 rounded"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
                </div>
                <button className="flex items-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    Etkinlik Ekle
                </button>
            </div>
       </div>

       <div className="flex-1 bg-dark-800 rounded-xl border border-dark-700 overflow-hidden flex flex-col">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-dark-700 bg-dark-900/50">
                {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {/* Previous month padding */}
                {[29, 30, 31].map(day => (
                    <div key={`prev-${day}`} className="min-h-[120px] p-2 border-b border-r border-dark-700/50 bg-dark-900/20 text-gray-600">
                        <span className="text-sm font-medium">{day}</span>
                    </div>
                ))}
                
                {/* Current month */}
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                    const dayEvents = getEventsForDay(day);
                    return (
                        <div key={day} className="min-h-[120px] p-2 border-b border-r border-dark-700/50 relative hover:bg-dark-700/20 transition-colors group">
                            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${day === 15 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-300'}`}>
                                {day}
                            </span>
                            
                            <div className="mt-2 space-y-1">
                                {dayEvents.map((event, idx) => (
                                    <div key={idx} className={`text-[10px] px-2 py-1 rounded border-l-2 truncate cursor-pointer hover:opacity-80 transition bg-${event.color}-500/10 text-${event.color}-300 border-${event.color}-500`}>
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Add Button on Hover */}
                            <button className="absolute bottom-2 right-2 p-1.5 rounded-full bg-dark-700 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-primary transition-all">
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
                 
                 {/* Next month padding */}
                 {[1, 2].map(day => (
                    <div key={`next-${day}`} className="min-h-[120px] p-2 border-b border-r border-dark-700/50 bg-dark-900/20 text-gray-600">
                        <span className="text-sm font-medium">{day}</span>
                    </div>
                ))}
            </div>
       </div>
    </div>
  );
};

export default CalendarPage;