import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Star } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  
  const users = [
    { rank: 1, name: 'Ahmet Yıldız', role: 'Ürün Yönetimi', xp: '12,450', level: 24, avatar: 'https://picsum.photos/id/10/40/40' },
    { rank: 2, name: 'Zeynep Kaya', role: 'Kıdemli Geliştirici', xp: '11,875', level: 23, avatar: 'https://picsum.photos/id/20/40/40' },
    { rank: 3, name: 'Mehmet Demir', role: 'Yönetim Ekibi', xp: '10,320', level: 21, avatar: 'https://picsum.photos/id/30/40/40' },
    { rank: 4, name: 'Ayşe Öztürk', role: 'Tasarım Ekibi', xp: '9,845', level: 20, avatar: 'https://picsum.photos/id/40/40/40' },
    { rank: 5, name: 'Emre Yılmaz', role: 'Yazılım Mühendisi', xp: '8,750', level: 12, avatar: 'https://picsum.photos/id/64/40/40', isMe: true },
    { rank: 6, name: 'Deniz Aydın', role: 'İçerik Uzmanı', xp: '7,980', level: 16, avatar: 'https://picsum.photos/id/50/40/40' },
  ];

  return (
    <div className="pb-20 animate-fade-in">
       <div className="flex items-center mb-8">
            <button onClick={() => navigate('/gamification')} className="mr-4 p-2 bg-dark-800 rounded-lg hover:bg-dark-700 text-gray-400">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Liderlik Tablosu</h1>
       </div>

       <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
            <div className="p-6 border-b border-dark-700 flex justify-between items-center">
                <div className="flex space-x-2 bg-dark-900 p-1 rounded-lg">
                    <button className="px-4 py-1.5 bg-dark-700 text-white text-sm font-medium rounded shadow">Bu Ay</button>
                    <button className="px-4 py-1.5 text-gray-400 hover:text-white text-sm font-medium rounded transition">Tüm Zamanlar</button>
                </div>
                <div className="text-sm text-gray-400">Sıralama: <span className="text-white">XP</span></div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-dark-900/50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Sıralama</th>
                            <th className="px-6 py-4 font-semibold">Kullanıcı</th>
                            <th className="px-6 py-4 font-semibold">Takım</th>
                            <th className="px-6 py-4 font-semibold">XP</th>
                            <th className="px-6 py-4 font-semibold">Seviye</th>
                            <th className="px-6 py-4 font-semibold text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700 text-sm">
                        {users.map((user) => (
                            <tr key={user.rank} className={`hover:bg-dark-700/30 transition ${user.isMe ? 'bg-primary/5' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        {user.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500 mr-2" />}
                                        {user.rank === 2 && <Medal className="w-5 h-5 text-gray-300 mr-2" />}
                                        {user.rank === 3 && <Medal className="w-5 h-5 text-orange-400 mr-2" />}
                                        <span className={`font-bold ${user.rank <= 3 ? 'text-white' : 'text-gray-400 ml-7'}`}>{user.rank}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <img src={user.avatar} className="w-10 h-10 rounded-full mr-3 border border-dark-600" alt={user.name} />
                                        <div>
                                            <p className={`font-medium ${user.isMe ? 'text-primary' : 'text-white'}`}>{user.name} {user.isMe && '(Sen)'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-400">{user.role}</td>
                                <td className="px-6 py-4 font-bold text-white">{user.xp} XP</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <span className="text-gray-300 mr-2">{user.level}</span>
                                        <div className="w-16 h-1.5 bg-dark-900 rounded-full overflow-hidden">
                                            <div className="bg-green-500 h-full rounded-full" style={{ width: `${(user.level/30)*100}%` }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!user.isMe ? (
                                        <button className="text-xs bg-dark-900 border border-dark-600 hover:border-yellow-500 hover:text-yellow-500 text-gray-400 px-3 py-1.5 rounded transition flex items-center justify-end ml-auto">
                                            <Star className="w-3 h-3 mr-1" />
                                            Takdir Et
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-500 italic">Takdir Edildi</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 border-t border-dark-700 flex justify-center">
                <nav className="flex space-x-1">
                    <button className="px-3 py-1 text-sm bg-primary text-white rounded">1</button>
                    <button className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-dark-700 rounded">2</button>
                    <button className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-dark-700 rounded">3</button>
                </nav>
            </div>
       </div>
       
       <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                <h4 className="font-bold text-white mb-2">Nasıl Daha Fazla XP Kazanabilirim?</h4>
                <p className="text-xs text-gray-400">Görevleri zamanında tamamlayarak, doküman analizleri yaparak ve ekip arkadaşlarınıza yardım ederek XP kazanabilirsiniz.</p>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                <h4 className="font-bold text-white mb-2">Aktif İletişim Kur</h4>
                <p className="text-xs text-gray-400">Görevlere yorum yapmak ve geri bildirim sağlamak ekstra puan kazandırır.</p>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                <h4 className="font-bold text-white mb-2">KPI'ları Geliştir</h4>
                <p className="text-xs text-gray-400">Proje performans metriklerini iyileştirmek büyük XP ödülleri sağlar.</p>
            </div>
       </div>
    </div>
  );
};

export default Leaderboard;