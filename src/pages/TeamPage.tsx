import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, Phone, MoreHorizontal, Plus, Briefcase, MapPin } from 'lucide-react';
import { useUserStore } from '../store';

const TeamPage: React.FC = () => {
    const navigate = useNavigate();
    const { users } = useUserStore();

    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Get unique departments from users
    const departments = useMemo(() => {
        const depts = [...new Set(users.map(u => u.department))];
        return ['All', ...depts];
    }, [users]);

    // Filter users by department and search query
    const filteredMembers = useMemo(() => {
        return users.filter(member => {
            const matchesDept = departmentFilter === 'All' || member.department === departmentFilter;
            const matchesSearch = searchQuery === '' ||
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.role.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesDept && matchesSearch;
        });
    }, [users, departmentFilter, searchQuery]);

    // Status class helper
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'busy': return 'bg-red-500';
            case 'away': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    // Status label helper
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'online': return 'Çevrimiçi';
            case 'busy': return 'Meşgul';
            case 'away': return 'Uzakta';
            default: return 'Çevrimdışı';
        }
    };

    return (
        <div className="pb-20 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Ekip Üyeleri</h1>
                    <p className="text-gray-400 text-sm">
                        Şirket genelindeki tüm çalışanları yönetin ve iletişim kurun.
                        <span className="text-white ml-1">{users.length} üye</span>
                    </p>
                </div>
                <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Kişi Ekle
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto no-scrollbar">
                    {departments.map(dept => (
                        <button
                            key={dept}
                            onClick={() => setDepartmentFilter(dept)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${departmentFilter === dept
                                ? 'bg-primary text-white'
                                : 'bg-dark-900 text-gray-400 hover:bg-dark-700 hover:text-white'
                                }`}
                        >
                            {dept === 'All' ? 'Tümü' : dept}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="İsim veya pozisyon ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-600 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member) => (
                    <div
                        key={member.id}
                        onClick={() => navigate(`/team/${member.id}`)}
                        className="bg-dark-800 rounded-xl border border-dark-700 p-6 flex flex-col items-center relative group hover:border-primary/50 transition-colors cursor-pointer"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>

                        <div className="relative mb-4">
                            <img
                                src={`https://picsum.photos/id/${member.avatar}/100/100`}
                                className="w-24 h-24 rounded-full border-4 border-dark-700"
                                alt={member.name}
                            />
                            <div
                                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-dark-800 ${getStatusClass(member.status)}`}
                                title={getStatusLabel(member.status)}
                            ></div>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                        <p className="text-primary text-sm font-medium mb-1">{member.role}</p>
                        <p className="text-xs text-gray-500 mb-4">Seviye {member.level}</p>

                        <div className="w-full space-y-3 mb-6">
                            <div className="flex items-center text-xs text-gray-400 bg-dark-900/50 p-2 rounded">
                                <Briefcase className="w-3 h-3 mr-2" />
                                {member.department} Departmanı
                            </div>
                            <div className="flex items-center text-xs text-gray-400 bg-dark-900/50 p-2 rounded">
                                <MapPin className="w-3 h-3 mr-2" />
                                {member.location}
                            </div>
                        </div>

                        <div className="flex gap-2 w-full mt-auto">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (member.email) window.location.href = `mailto:${member.email}`;
                                }}
                                className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg text-sm flex items-center justify-center transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (member.phone) window.location.href = `tel:${member.phone}`;
                                }}
                                className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg text-sm flex items-center justify-center transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Card Placeholder */}
                <div className="bg-dark-800/30 border-2 border-dashed border-dark-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-dark-800 hover:border-primary/50 transition text-gray-500 hover:text-white min-h-[320px]">
                    <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold">Yeni Takım Arkadaşı</h3>
                    <p className="text-xs text-center mt-2 px-4">Ekibe yeni bir üye davet etmek için tıklayın.</p>
                </div>
            </div>

            {/* Empty State */}
            {filteredMembers.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Üye bulunamadı</h3>
                    <p className="text-gray-400 text-sm">Arama kriterlerinize uygun ekip üyesi bulunmamaktadır.</p>
                </div>
            )}
        </div>
    );
};

export default TeamPage;