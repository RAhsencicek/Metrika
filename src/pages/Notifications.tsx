import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Star, Zap, Calendar, X } from 'lucide-react';

const Notifications: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="pb-20 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 bg-dark-800 rounded-lg hover:bg-dark-700 text-gray-400">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-white">Bildirimler ve Uyarılar</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Col: System Notifications */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-400 mb-4">Sistem Bildirimleri</h2>

                    {/* XP Gain */}
                    <div className="bg-dark-800 p-5 rounded-xl border-l-4 border-green-500 shadow-lg relative group">
                        <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition"><X className="w-4 h-4" /></button>
                        <div className="flex items-start">
                            <div className="p-2 bg-green-500/10 rounded-full mr-3 shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">XP Kazanma</h4>
                                <p className="text-xs text-gray-500 mb-2">Şimdi</p>
                                <p className="text-sm text-gray-300">Tebrikler! 'YZ Rapor Analizi' görevini tamamlayarak <span className="text-green-400 font-bold">+250 XP</span> kazandınız.</p>
                                <button onClick={() => navigate('/')} className="mt-3 text-xs bg-dark-700 hover:bg-dark-600 px-3 py-1.5 rounded text-white transition">Dashboard'a Dön</button>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-dark-800 p-5 rounded-xl border-l-4 border-yellow-500 shadow-lg relative">
                        <div className="flex items-start">
                            <div className="p-2 bg-yellow-500/10 rounded-full mr-3 shrink-0">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Metodoloji Uyum Uyarısı</h4>
                                <p className="text-xs text-gray-500 mb-2">10 dakika önce</p>
                                <p className="text-sm text-gray-300">'Yazılım Geliştirme' projesinde Scrum metodolojisine uygun olmayan bir görev akışı tespit edildi.</p>
                                <div className="mt-3 flex space-x-2">
                                    <button className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded border border-dark-600">Yoksay</button>
                                    <button className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1.5 rounded">Düzelt</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Badge Win */}
                    <div className="bg-gradient-to-r from-orange-900/40 to-dark-800 p-5 rounded-xl border-l-4 border-orange-500 shadow-lg relative">
                        <div className="flex items-start">
                            <div className="p-2 bg-orange-500/10 rounded-full mr-3 shrink-0">
                                <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Başarı Rozeti Kazandınız!</h4>
                                <p className="text-xs text-gray-500 mb-2">2 saat önce</p>
                                <p className="text-sm text-gray-300">Tebrikler! <span className="text-orange-400 font-bold">'Sprint Ustası'</span> rozetini kazandınız.</p>
                                <button onClick={() => navigate('/gamification')} className="mt-3 text-xs bg-dark-700 hover:bg-dark-600 px-3 py-1.5 rounded text-white transition">Profile Git</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: AI & Work Alerts */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-400 mb-4">İş & AI Uyarıları</h2>

                    {/* AI Context Alert */}
                    <div className="bg-dark-800 p-5 rounded-xl border-l-4 border-blue-500 shadow-lg relative">
                        <div className="flex items-start">
                            <div className="p-2 bg-blue-500/10 rounded-full mr-3 shrink-0">
                                <Zap className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">YZ Bağlamsal Uyarısı</h4>
                                <p className="text-xs text-gray-500 mb-2">30 dakika önce</p>
                                <p className="text-sm text-gray-300">Yapay zeka asistanınız, 'Finansal Analiz' projesinde risk tespit etti.</p>
                                <div className="bg-dark-900/50 p-2 mt-2 rounded border border-dark-700">
                                    <p className="text-xs text-gray-400">Tahmin edilen bütçe sapması: <span className="text-red-400">15%</span></p>
                                </div>
                                <button onClick={() => navigate('/documents/analysis')} className="mt-3 text-xs text-primary hover:underline">Analizi Görüntüle</button>
                            </div>
                        </div>
                    </div>

                    {/* Meeting Reminder */}
                    <div className="bg-dark-800 p-5 rounded-xl border-l-4 border-purple-500 shadow-lg relative">
                        <div className="flex items-start">
                            <div className="p-2 bg-purple-500/10 rounded-full mr-3 shrink-0">
                                <Calendar className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Toplantı Hatırlatması</h4>
                                <p className="text-xs text-gray-500 mb-2">Önemli</p>
                                <p className="text-sm text-gray-300">'Sprint Değerlendirme' toplantısı 15 dakika içinde başlayacak.</p>
                                <div className="mt-3 flex space-x-2">
                                    <button className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded border border-dark-600">Ertele</button>
                                    <button className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded">Katıl (Zoom)</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Completed */}
                    <div className="bg-dark-800 p-5 rounded-xl border-l-4 border-gray-600 shadow-lg relative opacity-75">
                        <div className="flex items-start">
                            <div className="p-2 bg-gray-500/10 rounded-full mr-3 shrink-0">
                                <CheckCircle className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Görev Tamamlandı</h4>
                                <p className="text-xs text-gray-500 mb-2">Başarılı</p>
                                <p className="text-sm text-gray-300">Emre Yılmaz, 'Kullanıcı Arayüzü Tasarımı' görevini başarıyla tamamladı.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;