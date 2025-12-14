import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trophy, Star, Zap, TrendingUp, Users, FileText, CheckCircle,
    Flame, Target, Award, Crown, Clock, ArrowRight, Lock, Sparkles,
    X, ExternalLink, Medal, ChevronRight
} from 'lucide-react';
import { useUserStore, useTaskStore, useProjectStore } from '../store';

// Unvan tanımları - SVG karakterler
const TITLES = [
    { minLevel: 1, maxLevel: 5, name: 'Çaylak', key: 'caylak', icon: '🌱', emoji: '🐣', color: 'text-green-400', bg: 'bg-green-500/20', glow: 'shadow-green-500/50', gradient: 'from-green-500 to-emerald-400', description: 'Yeni başlayan, öğrenmeye hevesli' },
    { minLevel: 6, maxLevel: 10, name: 'Geliştirici', key: 'gelistirici', icon: '⚡', emoji: '🦊', color: 'text-blue-400', bg: 'bg-blue-500/20', glow: 'shadow-blue-500/50', gradient: 'from-blue-500 to-cyan-400', description: 'Yeteneklerini geliştiren, çalışkan' },
    { minLevel: 11, maxLevel: 20, name: 'Uzman', key: 'uzman', icon: '🔥', emoji: '🦁', color: 'text-orange-400', bg: 'bg-orange-500/20', glow: 'shadow-orange-500/50', gradient: 'from-orange-500 to-amber-400', description: 'Deneyimli ve güvenilir profesyonel' },
    { minLevel: 21, maxLevel: 30, name: 'Usta', key: 'usta', icon: '💎', emoji: '🐉', color: 'text-purple-400', bg: 'bg-purple-500/20', glow: 'shadow-purple-500/50', gradient: 'from-purple-500 to-pink-400', description: 'Alanında söz sahibi, mentor' },
    { minLevel: 31, maxLevel: 999, name: 'Efsane', key: 'efsane', icon: '👑', emoji: '🦅', color: 'text-yellow-400', bg: 'bg-yellow-500/20', glow: 'shadow-yellow-500/50', gradient: 'from-yellow-500 to-orange-400', description: 'Efsanevi başarıların sahibi' },
];

// Başarım tanımları
const ACHIEVEMENTS = [
    { id: 'first_task', name: 'İlk Adım', description: 'İlk görevini tamamla', howTo: 'Herhangi bir görevi "Tamamlandı" durumuna getirerek bu başarımı kazanabilirsiniz.', icon: Target, xp: 50, color: 'green', requirement: 1, type: 'tasks', link: '/tasks', linkText: 'Görevlere Git' },
    { id: 'task_hunter', name: 'Görev Avcısı', description: '10 görev tamamla', howTo: 'Toplam 10 görevi başarıyla tamamlayın.', icon: CheckCircle, xp: 100, color: 'blue', requirement: 10, type: 'tasks', link: '/tasks', linkText: 'Görevlere Git' },
    { id: 'task_master', name: 'Görev Ustası', description: '50 görev tamamla', howTo: 'Toplam 50 görevi tamamlayarak gerçek bir görev ustası olduğunuzu kanıtlayın!', icon: Award, xp: 300, color: 'purple', requirement: 50, type: 'tasks', link: '/tasks', linkText: 'Görevlere Git' },
    { id: 'task_legend', name: 'Görev Efsanesi', description: '100 görev tamamla', howTo: 'Efsanevi 100 görev barajını aşın.', icon: Crown, xp: 500, color: 'yellow', requirement: 100, type: 'tasks', link: '/tasks', linkText: 'Görevlere Git' },
    { id: 'streak_starter', name: 'Ateş Başlatıcı', description: '7 günlük streak', howTo: 'Arka arkaya 7 gün sistemde aktif olun.', icon: Flame, xp: 150, color: 'orange', requirement: 7, type: 'streak', link: '/calendar', linkText: 'Takvimi Gör' },
    { id: 'streak_master', name: 'Tutarlılık Ustası', description: '30 günlük streak', howTo: 'Tam bir ay boyunca her gün aktif olun.', icon: Zap, xp: 500, color: 'red', requirement: 30, type: 'streak', link: '/calendar', linkText: 'Takvimi Gör' },
    { id: 'level_5', name: 'Yükselen Yıldız', description: 'Level 5\'e ulaş', howTo: 'Görevleri tamamlayarak XP kazanın.', icon: Star, xp: 200, color: 'cyan', requirement: 5, type: 'level', link: '/leaderboard', linkText: 'Sıralamayı Gör' },
    { id: 'level_10', name: 'Deneyimli', description: 'Level 10\'a ulaş', howTo: 'Level 10\'a ulaşarak deneyimli olduğunuzu gösterin.', icon: TrendingUp, xp: 400, color: 'pink', requirement: 10, type: 'level', link: '/leaderboard', linkText: 'Sıralamayı Gör' },
    { id: 'team_player', name: 'Takım Oyuncusu', description: '3 projede çalış', howTo: 'En az 3 farklı projede görev alın.', icon: Users, xp: 150, color: 'indigo', requirement: 3, type: 'projects', link: '/projects', linkText: 'Projelere Git' },
    { id: 'documenter', name: 'Belgeleyici', description: '5 doküman yükle', howTo: 'Doküman analizi bölümünden 5 dosya yükleyin.', icon: FileText, xp: 200, color: 'emerald', requirement: 5, type: 'documents', link: '/documents/analysis', linkText: 'Dokümanlara Git' },
];

// Animasyonlu Karakter Component'i - CSS ile yapılmış
const AnimatedCharacter: React.FC<{
    title: typeof TITLES[0];
    isHovered: boolean;
    onClick: () => void
}> = ({ title, isHovered, onClick }) => {
    return (
        <div
            className={`relative cursor-pointer transition-all duration-500 ${isHovered ? 'scale-110' : ''}`}
            onClick={onClick}
        >
            {/* Outer glow ring */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${title.gradient} opacity-30 blur-2xl animate-pulse`}></div>

            {/* Rotating ring */}
            <div className={`absolute inset-[-10px] rounded-full border-4 border-dashed ${title.color} opacity-20 ${isHovered ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}></div>

            {/* Main character circle */}
            <div className={`relative w-48 h-48 rounded-full bg-gradient-to-br ${title.gradient} flex items-center justify-center shadow-2xl ${title.glow}`}>
                {/* Inner pattern */}
                <div className="absolute inset-2 rounded-full bg-dark-900/30 backdrop-blur-sm"></div>

                {/* Platform reflection */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/10 rounded-full blur-sm"></div>

                {/* Character emoji */}
                <span className={`relative text-8xl transition-all duration-300 ${isHovered ? 'scale-125 -translate-y-2' : ''}`}>
                    {title.emoji}
                </span>

                {/* Sparkle effects */}
                <div className="absolute top-4 left-6 text-2xl animate-pulse">✨</div>
                <div className="absolute top-8 right-4 text-xl animate-pulse" style={{ animationDelay: '0.3s' }}>✨</div>
                <div className="absolute bottom-12 left-4 text-lg animate-pulse" style={{ animationDelay: '0.6s' }}>✨</div>
                <div className="absolute bottom-8 right-6 text-xl animate-pulse" style={{ animationDelay: '0.9s' }}>✨</div>
            </div>

            {/* Floor shadow */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/40 rounded-full blur-md"></div>
        </div>
    );
};

const GamificationProfile: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useUserStore();
    const { tasks } = useTaskStore();
    const { projects } = useProjectStore();

    // States
    const [selectedAchievement, setSelectedAchievement] = useState<typeof ACHIEVEMENTS[0] | null>(null);
    const [isCharacterHovered, setIsCharacterHovered] = useState(false);
    const [characterClicked, setCharacterClicked] = useState(false);

    // Streak verisi
    const currentStreak = currentUser?.currentStreak || 12;
    const longestStreak = currentUser?.longestStreak || 24;
    const [streakAnimation, setStreakAnimation] = useState(false);

    // Gerçek veriler
    const userLevel = currentUser?.level || 1;
    const userXP = currentUser?.xp || 0;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const totalTasks = tasks.length;
    const userProjects = projects.filter(p => p.teamMemberIds?.includes(currentUser?.id || '') || p.managerId === currentUser?.id).length;
    const documentsUploaded = 3;

    // XP hesaplamaları
    const xpInCurrentLevel = userXP - ((userLevel - 1) * 1000);
    const xpProgress = Math.min((xpInCurrentLevel / 1000) * 100, 100);
    const xpRemaining = Math.max((userLevel * 1000) - userXP, 0);

    // Mevcut unvanı bul
    const currentTitle = TITLES.find(t => userLevel >= t.minLevel && userLevel <= t.maxLevel) || TITLES[0];
    const nextTitle = TITLES.find(t => t.minLevel > userLevel);

    // Başarım durumlarını hesapla
    const getAchievementProgress = (achievement: typeof ACHIEVEMENTS[0]) => {
        switch (achievement.type) {
            case 'tasks': return Math.min(completedTasks, achievement.requirement);
            case 'streak': return Math.min(currentStreak, achievement.requirement);
            case 'level': return Math.min(userLevel, achievement.requirement);
            case 'projects': return Math.min(userProjects, achievement.requirement);
            case 'documents': return Math.min(documentsUploaded, achievement.requirement);
            default: return 0;
        }
    };

    const isAchievementUnlocked = (achievement: typeof ACHIEVEMENTS[0]) => {
        return getAchievementProgress(achievement) >= achievement.requirement;
    };

    const unlockedCount = ACHIEVEMENTS.filter(a => isAchievementUnlocked(a)).length;

    // Streak animasyonu
    useEffect(() => {
        if (currentStreak > 0) {
            setStreakAnimation(true);
            const timer = setTimeout(() => setStreakAnimation(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [currentStreak]);

    // Karakter tıklama animasyonu
    const handleCharacterClick = () => {
        setCharacterClicked(true);
        setTimeout(() => setCharacterClicked(false), 500);
    };

    // Streak günleri
    const streakDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
            day: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
            date: date.getDate(),
            completed: i <= Math.min(currentStreak - 1, 6)
        };
    });

    return (
        <div className="pb-10 animate-fade-in max-w-7xl mx-auto">
            {/* Achievement Detail Modal */}
            {selectedAchievement && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedAchievement(null)}>
                    <div className="bg-dark-800 rounded-2xl border border-dark-600 max-w-md w-full p-6 relative animate-scale-in shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedAchievement(null)} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="text-center mb-6">
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${isAchievementUnlocked(selectedAchievement) ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/20' : 'bg-dark-700'}`}>
                                {isAchievementUnlocked(selectedAchievement) ? <selectedAchievement.icon className="w-10 h-10 text-green-400" /> : <Lock className="w-10 h-10 text-gray-500" />}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{selectedAchievement.name}</h3>
                            <p className="text-gray-400 text-sm">{selectedAchievement.description}</p>
                        </div>
                        <div className="bg-dark-900/50 rounded-xl p-4 mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">İlerleme</span>
                                <span className={isAchievementUnlocked(selectedAchievement) ? 'text-green-400 font-bold' : 'text-white'}>
                                    {getAchievementProgress(selectedAchievement)} / {selectedAchievement.requirement}
                                </span>
                            </div>
                            <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
                                <div className={`h-3 rounded-full transition-all duration-500 ${isAchievementUnlocked(selectedAchievement) ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-primary to-purple-500'}`} style={{ width: `${(getAchievementProgress(selectedAchievement) / selectedAchievement.requirement) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-dark-900/50 rounded-xl p-4 mb-4">
                            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" />Nasıl Kazanılır?</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">{selectedAchievement.howTo}</p>
                        </div>
                        <div className="flex items-center justify-between bg-yellow-500/10 rounded-xl p-4 mb-4 border border-yellow-500/20">
                            <span className="text-yellow-400 font-medium">Ödül</span>
                            <span className="text-yellow-400 font-bold text-lg flex items-center gap-1"><Sparkles className="w-4 h-4" />+{selectedAchievement.xp} XP</span>
                        </div>
                        {!isAchievementUnlocked(selectedAchievement) ? (
                            <button onClick={() => { setSelectedAchievement(null); navigate(selectedAchievement.link); }} className="w-full py-3 gradient-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/30">
                                {selectedAchievement.linkText}<ExternalLink className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="text-center py-3 bg-green-500/10 rounded-xl border border-green-500/20">
                                <span className="text-green-400 font-medium flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" />Tamamlandı!</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Başarılarım</h1>
                    <p className="text-gray-400 text-sm">İlerlemenizi takip edin, başarılarınızı kutlayın</p>
                </div>
                <button onClick={() => navigate('/leaderboard')} className="gradient-primary hover:opacity-90 text-white px-4 py-2 rounded-lg transition flex items-center text-sm shadow-lg shadow-primary/20 hover-lift">
                    <Trophy className="w-4 h-4 mr-2" />Liderlik Tablosu
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover-lift group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{currentTitle.icon}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${currentTitle.bg} ${currentTitle.color}`}>{currentTitle.name}</span>
                    </div>
                    <div className="text-3xl font-bold text-white">Lv. {userLevel}</div>
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{xpInCurrentLevel.toLocaleString()} XP</span><span>1,000 XP</span></div>
                        <div className="w-full bg-dark-700 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary to-purple-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${xpProgress}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover-lift group">
                    <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-yellow-400" /><span className="text-xs text-gray-400">Toplam XP</span></div>
                    <div className="text-3xl font-bold text-white">{userXP.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">Sonraki seviyeye {xpRemaining.toLocaleString()} XP</p>
                </div>
                <div onClick={() => navigate('/tasks')} className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover-lift cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-green-400 group-hover:scale-125 transition-transform" /><span className="text-xs text-gray-400">Tamamlanan Görev</span><ChevronRight className="w-3 h-3 text-gray-600 ml-auto group-hover:translate-x-1 transition-transform" /></div>
                    <div className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">{completedTasks}</div>
                    <p className="text-xs text-gray-500 mt-1">Toplam {totalTasks} görevden</p>
                </div>
                <div onClick={() => navigate('/calendar')} className="bg-gradient-to-br from-orange-900/30 to-dark-800 rounded-xl p-4 border border-orange-500/20 hover-lift cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2"><Flame className={`w-4 h-4 text-orange-400 ${streakAnimation ? 'animate-bounce' : ''}`} /><span className="text-xs text-gray-400">Günlük Streak</span><ChevronRight className="w-3 h-3 text-gray-600 ml-auto group-hover:translate-x-1 transition-transform" /></div>
                    <div className="text-3xl font-bold text-orange-400">{currentStreak} <span className="text-lg">gün</span></div>
                    <p className="text-xs text-gray-500 mt-1">En uzun: {longestStreak} gün</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Achievements */}
                    <div className="bg-dark-800 rounded-xl p-5 border border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Award className="w-5 h-5 text-yellow-500" />Başarımlar</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-24 bg-dark-700 rounded-full h-2 overflow-hidden">
                                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}></div>
                                </div>
                                <span className="text-sm text-gray-400">{unlockedCount}/{ACHIEVEMENTS.length}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {ACHIEVEMENTS.map((achievement) => {
                                const progress = getAchievementProgress(achievement);
                                const unlocked = isAchievementUnlocked(achievement);
                                const progressPercent = Math.min((progress / achievement.requirement) * 100, 100);
                                return (
                                    <div key={achievement.id} onClick={() => setSelectedAchievement(achievement)} className={`relative p-3 rounded-lg border transition-all cursor-pointer group ${unlocked ? 'bg-gradient-to-br from-green-900/30 to-dark-800 border-green-500/30 hover:border-green-500/60' : 'bg-dark-900/50 border-dark-600 hover:border-primary/50'}`}>
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all group-hover:scale-110 ${unlocked ? 'bg-green-500/20' : 'bg-dark-700'}`}>
                                                {unlocked ? <achievement.icon className="w-5 h-5 text-green-400" /> : <achievement.icon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />}
                                            </div>
                                            <h4 className={`font-medium text-xs mb-1 ${unlocked ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{achievement.name}</h4>
                                            <div className="w-full mt-1">
                                                <div className="w-full bg-dark-600 rounded-full h-1 overflow-hidden">
                                                    <div className={`h-1 rounded-full transition-all ${unlocked ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${progressPercent}%` }}></div>
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">{progress}/{achievement.requirement}</div>
                                            </div>
                                        </div>
                                        {unlocked && <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 shadow-lg"><CheckCircle className="w-3 h-3 text-white" /></div>}
                                        <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-xs text-white font-medium">Detaylar</span></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CHARACTER SHOWCASE */}
                    <div className="bg-gradient-to-br from-dark-800 via-dark-800 to-dark-900 rounded-2xl border border-dark-600 overflow-hidden relative">
                        {/* Animated background */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r ${currentTitle.gradient} opacity-10 blur-3xl`}></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>

                            {/* Floating particles */}
                            <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-float"></div>
                            <div className="absolute top-20 right-20 w-3 h-3 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute bottom-20 left-20 w-2 h-2 bg-white/15 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                        </div>

                        <div className="relative z-10 p-8">
                            {/* Title */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                                    <span className="text-2xl">{currentTitle.icon}</span>
                                    Karakterim
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">Tıklayarak etkileşime girin</p>
                            </div>

                            {/* Character Area */}
                            <div
                                className="flex justify-center mb-6"
                                onMouseEnter={() => setIsCharacterHovered(true)}
                                onMouseLeave={() => setIsCharacterHovered(false)}
                            >
                                <AnimatedCharacter
                                    title={currentTitle}
                                    isHovered={isCharacterHovered || characterClicked}
                                    onClick={handleCharacterClick}
                                />
                            </div>

                            {/* Character Info Cards */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-dark-900/60 backdrop-blur rounded-xl p-4 text-center border border-dark-600">
                                    <div className={`text-xl font-bold ${currentTitle.color}`}>{currentTitle.name}</div>
                                    <div className="text-xs text-gray-400 mt-1">Unvan</div>
                                </div>
                                <div className="bg-dark-900/60 backdrop-blur rounded-xl p-4 text-center border border-dark-600">
                                    <div className="text-xl font-bold text-white">Lv.{userLevel}</div>
                                    <div className="text-xs text-gray-400 mt-1">Seviye</div>
                                </div>
                                <div className="bg-dark-900/60 backdrop-blur rounded-xl p-4 text-center border border-dark-600">
                                    <div className="text-xl font-bold text-yellow-400">{userXP.toLocaleString()}</div>
                                    <div className="text-xs text-gray-400 mt-1">Toplam XP</div>
                                </div>
                            </div>

                            {/* Character Description */}
                            <div className="bg-dark-900/40 backdrop-blur rounded-xl p-4 border border-dark-600 text-center">
                                <p className="text-gray-300 text-sm italic">"{currentTitle.description}"</p>
                            </div>

                            {/* Next Title Progress */}
                            {nextTitle && (
                                <div className="mt-4 p-4 bg-dark-900/40 backdrop-blur rounded-xl border border-dark-600">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{nextTitle.emoji}</span>
                                            <div>
                                                <p className="text-xs text-gray-400">Sonraki Unvan</p>
                                                <p className={`font-bold ${nextTitle.color}`}>{nextTitle.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-white">{nextTitle.minLevel - userLevel}</p>
                                            <p className="text-xs text-gray-400">level kaldı</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full bg-gradient-to-r ${nextTitle.gradient}`}
                                            style={{ width: `${((userLevel - currentTitle.minLevel) / (currentTitle.maxLevel - currentTitle.minLevel + 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TITLE JOURNEY - Simple Icons */}
                    <div className="bg-dark-800 rounded-xl p-5 border border-dark-700">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <Crown className="w-5 h-5 text-purple-500" />
                            Unvan Yolculuğu
                        </h3>

                        <div className="relative py-4">
                            {/* Progress line */}
                            <div className="absolute top-1/2 left-8 right-8 h-1 bg-dark-700 rounded-full -translate-y-1/2"></div>
                            <div
                                className="absolute top-1/2 left-8 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full -translate-y-1/2 transition-all duration-1000"
                                style={{ width: `calc(${Math.min(((userLevel - 1) / 30) * 100, 100)}% - 32px)` }}
                            ></div>

                            <div className="flex justify-between relative">
                                {TITLES.map((title) => {
                                    const isActive = userLevel >= title.minLevel && userLevel <= title.maxLevel;
                                    const isPast = userLevel > title.maxLevel;

                                    return (
                                        <div key={title.name} className="flex flex-col items-center z-10 group cursor-pointer">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 ${isActive
                                                    ? `bg-gradient-to-br ${title.gradient} shadow-lg ${title.glow} ring-2 ring-white/30`
                                                    : isPast
                                                        ? `${title.bg} opacity-80`
                                                        : 'bg-dark-700 opacity-40'
                                                }`}>
                                                {title.icon}
                                            </div>
                                            <span className={`mt-2 text-xs font-medium transition-colors ${isActive ? title.color : isPast ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {title.name}
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                Lv.{title.minLevel}+
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* This Week Calendar */}
                    <div onClick={() => navigate('/calendar')} className="bg-dark-800 rounded-xl p-5 border border-dark-700 cursor-pointer hover-lift group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400" />Bu Hafta</h3>
                            <span className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-primary transition-colors"><Clock className="w-3 h-3" />Takvimi Aç<ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {streakDays.map((day, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-[10px] text-gray-500 mb-1">{day.day}</div>
                                    <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-xs font-medium transition-all ${day.completed ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md' : 'bg-dark-700 text-gray-500'} ${i === 6 && day.completed ? 'ring-2 ring-orange-400' : ''}`}>
                                        {day.completed ? '🔥' : day.date}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-dark-900/50 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Günlük Bonus</span>
                                <span className="text-orange-400 font-bold">+{Math.min(currentStreak, 7) * 10} XP</span>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-dark-800 rounded-xl p-5 border border-dark-700">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-cyan-400" />İstatistikler</h3>
                        <div className="space-y-3">
                            <div onClick={() => navigate('/tasks')} className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg cursor-pointer hover:bg-green-500/10 border border-transparent hover:border-green-500/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform"><CheckCircle className="w-4 h-4 text-green-400" /></div>
                                    <span className="text-sm text-gray-300">Görevler</span>
                                </div>
                                <div className="flex items-center gap-2"><span className="text-sm font-bold text-white">{completedTasks}/{totalTasks}</span><ChevronRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 group-hover:text-green-400 transition-all" /></div>
                            </div>
                            <div onClick={() => navigate('/projects')} className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg cursor-pointer hover:bg-blue-500/10 border border-transparent hover:border-blue-500/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform"><Users className="w-4 h-4 text-blue-400" /></div>
                                    <span className="text-sm text-gray-300">Projeler</span>
                                </div>
                                <div className="flex items-center gap-2"><span className="text-sm font-bold text-white">{userProjects}</span><ChevronRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" /></div>
                            </div>
                            <div onClick={() => navigate('/documents/analysis')} className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg cursor-pointer hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform"><FileText className="w-4 h-4 text-purple-400" /></div>
                                    <span className="text-sm text-gray-300">Dokümanlar</span>
                                </div>
                                <div className="flex items-center gap-2"><span className="text-sm font-bold text-white">{documentsUploaded}</span><ChevronRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 group-hover:text-purple-400 transition-all" /></div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center"><Award className="w-4 h-4 text-yellow-400" /></div>
                                    <span className="text-sm text-gray-300">Başarımlar</span>
                                </div>
                                <span className="text-sm font-bold text-yellow-400">{unlockedCount}/{ACHIEVEMENTS.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ranking Card */}
                    <div onClick={() => navigate('/leaderboard')} className="relative bg-gradient-to-br from-yellow-900/30 via-orange-900/20 to-red-900/20 rounded-xl p-5 border border-yellow-500/30 cursor-pointer hover-lift overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-orange-500/5"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-yellow-500/20 transition-colors"></div>
                        <div className="absolute top-4 left-4 text-yellow-400/30 animate-ping">✨</div>
                        <div className="absolute bottom-4 right-4 text-orange-400/30 animate-ping" style={{ animationDelay: '0.5s' }}>✨</div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" />Sıralamanız</h3>
                                <span className="text-xs text-yellow-400/70 flex items-center gap-1 group-hover:text-yellow-400 transition-colors">Tabloyu Gör<ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
                            </div>
                            <div className="text-center py-6">
                                <div className="relative inline-block">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl">👑</div>
                                    <div className="text-6xl font-black bg-gradient-to-b from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">#{currentUser?.rank || 1}</div>
                                    <div className="flex justify-center mt-2 gap-1">
                                        <Medal className="w-6 h-6 text-yellow-400" />
                                        <Medal className="w-6 h-6 text-yellow-500" />
                                        <Medal className="w-6 h-6 text-orange-400" />
                                    </div>
                                </div>
                                <p className="text-yellow-400/70 text-sm mt-3">Liderlik Tablosunda</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div className="bg-dark-900/50 rounded-lg p-3 text-center border border-yellow-500/10">
                                    <div className="text-lg font-bold text-white">{userXP.toLocaleString()}</div>
                                    <div className="text-[10px] text-gray-400">Toplam XP</div>
                                </div>
                                <div className="bg-dark-900/50 rounded-lg p-3 text-center border border-yellow-500/10">
                                    <div className="text-lg font-bold text-white">Lv.{userLevel}</div>
                                    <div className="text-[10px] text-gray-400">Seviye</div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-dark-900/30 rounded-lg text-center border border-yellow-500/10">
                                <p className="text-xs text-yellow-400/80">{currentUser?.rank === 1 ? '🏆 Zirvede kalın!' : '🚀 Zirveye ulaşmak için çalışmaya devam!'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationProfile;