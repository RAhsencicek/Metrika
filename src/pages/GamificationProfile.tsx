import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Shield, Zap, TrendingUp, Users, FileText, CheckCircle, MessageSquare } from 'lucide-react';

const GamificationProfile: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="pb-20 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-white">Oyunlaştırma Profili</h1>
                <button onClick={() => navigate('/leaderboard')} className="bg-dark-800 hover:bg-dark-700 text-white px-4 py-2 rounded-lg border border-dark-600 transition flex items-center">
                    <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                    Liderlik Tablosu
                </button>
            </div>

            {/* Profile Header Card */}
            <div className="bg-gradient-to-r from-blue-900 to-dark-800 rounded-2xl p-8 mb-8 border border-blue-800/50 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <div className="flex flex-col md:flex-row items-center relative z-10">
                    <div className="relative mb-6 md:mb-0 md:mr-8">
                        <div className="w-24 h-24 rounded-full border-4 border-yellow-500 p-1">
                            <img src="https://picsum.photos/id/64/100/100" className="w-full h-full rounded-full" alt="Profile" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-dark-900">
                            12
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-3xl font-bold text-white mb-1">Emre Yılmaz</h2>
                        <p className="text-blue-300 font-medium mb-4">Uzman Yönetici</p>

                        <div className="max-w-md">
                            <div className="flex justify-between text-xs text-blue-200 mb-1">
                                <span>4,250 XP</span>
                                <span>Sonraki Seviye: 5,000 XP</span>
                            </div>
                            <div className="w-full bg-dark-900/50 rounded-full h-3 border border-blue-500/30">
                                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: '85%' }}></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-right">750 XP kaldı</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 md:mt-0">
                        <div className="bg-dark-900/40 p-3 rounded-xl border border-white/10 text-center min-w-[100px]">
                            <div className="text-2xl font-bold text-white">24k</div>
                            <div className="text-xs text-gray-400">Toplam XP</div>
                        </div>
                        <div className="bg-dark-900/40 p-3 rounded-xl border border-white/10 text-center min-w-[100px]">
                            <div className="text-2xl font-bold text-white">5</div>
                            <div className="text-xs text-gray-400">Sıralama</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Badges Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Kazanılan Rozetler</h3>
                            <span className="text-xs text-gray-400">8 / 24 Kazanıldı</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { name: 'Proje Ustası', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                                { name: 'Takım Lideri', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { name: 'Hız Ustası', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                { name: 'Dokümantasyon', icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
                                { name: 'İletişim Kralı', icon: Star, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                { name: 'Analitik', icon: TrendingUp, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                                { name: 'Teknoloji', icon: Shield, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                                { name: 'Kalite', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            ].map((badge, i) => (
                                <div key={i} className="flex flex-col items-center p-4 bg-dark-900 rounded-xl border border-dark-700 hover:border-dark-500 transition cursor-pointer group">
                                    <div className={`w-12 h-12 rounded-full ${badge.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <badge.icon className={`w-6 h-6 ${badge.color}`} />
                                    </div>
                                    <span className="text-sm font-medium text-white text-center">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2 bg-dark-700 rounded-lg text-sm text-gray-300 hover:bg-dark-600 transition">Tüm Rozetleri Görüntüle</button>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <h3 className="text-lg font-bold text-white mb-6">Son Aktiviteler</h3>
                        <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-dark-700">
                            {[
                                { title: 'Finansal Rapor Q3 tamamlandı', xp: '+25 XP', time: '2 saat önce', icon: CheckCircle, color: 'text-green-500' },
                                { title: '"Dokümantasyon Uzmanı" rozeti kazanıldı', xp: '+50 XP', time: '1 gün önce', icon: Trophy, color: 'text-yellow-500' },
                                { title: 'Yeni Pazarlama Projesi ekibine katıldı', xp: '+15 XP', time: '2 gün önce', icon: Users, color: 'text-blue-500' },
                                { title: 'Proje toplantısında 3 yorum yapıldı', xp: '+10 XP', time: '3 gün önce', icon: MessageSquare, color: 'text-purple-500' }
                            ].map((activity, i) => (
                                <div key={i} className="relative flex items-center justify-between group">
                                    <div className="absolute -left-[29px] bg-dark-800 p-1 rounded-full border border-dark-700 group-hover:border-primary transition-colors">
                                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                    <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">{activity.xp}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Right Column */}
                <div className="space-y-6">
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <h3 className="font-bold text-white mb-4">Beceri Dağılımı</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Proje Yönetimi', val: 92 },
                                { name: 'Ekip Liderliği', val: 85 },
                                { name: 'Analitik', val: 78 },
                                { name: 'İletişim', val: 90 }
                            ].map(skill => (
                                <div key={skill.name}>
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>{skill.name}</span>
                                        <span>{skill.val}%</span>
                                    </div>
                                    <div className="w-full bg-dark-900 rounded-full h-1.5">
                                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${skill.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Leaderboard Snippet */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <h3 className="font-bold text-white mb-4">Liderlik (Top 5)</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Emre Yılmaz', xp: '24,560', rank: 1, me: true },
                                { name: 'Ayşe Kaya', xp: '23,450', rank: 2 },
                                { name: 'Mehmet Demir', xp: '21,780', rank: 3 },
                                { name: 'Zeynep Yıldız', xp: '20,340', rank: 4 },
                                { name: 'Ali Yılmaz', xp: '19,120', rank: 5 }
                            ].map(user => (
                                <div key={user.rank} className={`flex items-center justify-between p-2 rounded-lg ${user.me ? 'bg-primary/10 border border-primary/20' : ''}`}>
                                    <div className="flex items-center">
                                        <span className={`w-6 text-center font-bold text-sm ${user.rank === 1 ? 'text-yellow-500' : 'text-gray-500'}`}>{user.rank}</span>
                                        <span className={`text-sm ml-2 ${user.me ? 'text-white font-bold' : 'text-gray-300'}`}>{user.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{user.xp} XP</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate('/leaderboard')} className="w-full mt-4 py-2 border border-dark-600 text-gray-400 text-sm rounded hover:bg-dark-700 hover:text-white transition">Tüm Tabloyu Gör</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationProfile;