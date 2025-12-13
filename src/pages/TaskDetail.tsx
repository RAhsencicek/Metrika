import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Calendar, Clock, Tag, MessageSquare, 
    Paperclip, BarChart, Zap, Check, ThumbsUp, FileText 
} from 'lucide-react';

const TaskDetail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-20 animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Task Info */}
            <div className="w-full lg:w-3/4 space-y-6">
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/30">Devam Ediyor</span>
                        <div className="flex space-x-2">
                             <button className="p-2 hover:bg-dark-700 rounded-lg text-gray-400">
                                 <Paperclip className="w-4 h-4" />
                             </button>
                             <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                                 <Check className="w-4 h-4 mr-2" />
                                 Görevi Tamamla
                             </button>
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-white mb-4">Pazarlama Kampanyası Ölçütleme Raporu Hazırlama</h1>
                    
                    <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-dark-700">
                        <div className="flex items-center">
                            <img src="https://picsum.photos/id/100/32/32" className="w-8 h-8 rounded-full mr-3" alt="Assignee" />
                            <div>
                                <p className="text-xs text-gray-400">Atanan Kişi</p>
                                <p className="text-sm text-white font-medium">Ayşe Kaya</p>
                            </div>
                        </div>
                         <div className="flex items-center">
                            <div className="bg-dark-700 p-2 rounded-full mr-3">
                                <Calendar className="w-4 h-4 text-gray-300" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Son Tarih</p>
                                <p className="text-sm text-white font-medium">25 Haziran 2023</p>
                            </div>
                        </div>
                         <div className="flex items-center">
                            <div className="bg-dark-700 p-2 rounded-full mr-3">
                                <Clock className="w-4 h-4 text-gray-300" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Tahmini Süre</p>
                                <p className="text-sm text-white font-medium">12 Saat</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Açıklama</h3>
                        <div className="text-gray-300 text-sm leading-relaxed space-y-4">
                            <p>Son çeyrekte gerçekleştirilen dijital pazarlama kampanyalarının performans analizini içeren kapsamlı bir rapor hazırlanması gerekmektedir.</p>
                            <p>Raporda bulunması gereken başlıklar:</p>
                            <ul className="list-disc list-inside pl-4">
                                <li>Kanal bazlı dönüşüm oranları</li>
                                <li>Maliyet/Edinim (CPA) analizi</li>
                                <li>Rakip karşılaştırması</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Etiketler</h3>
                        <div className="flex gap-2">
                            {['Pazarlama', 'Rapor', 'Analiz'].map(tag => (
                                <span key={tag} className="flex items-center px-3 py-1 bg-dark-700 rounded-full text-xs text-gray-300">
                                    <Tag className="w-3 h-3 mr-1" /> {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-dark-900 rounded-lg p-4">
                        <div className="flex justify-between text-sm mb-2">
                             <span className="text-gray-400">Görev İlerlemesi</span>
                             <span className="text-white">75%</span>
                        </div>
                        <div className="w-full bg-dark-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-right">9/12 saat tamamlandı</p>
                    </div>
                </div>

                {/* Timeline & Comments */}
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                     <h3 className="font-bold text-white mb-6">Aktivite Geçmişi</h3>
                     
                     <div className="relative space-y-8 pl-8 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-dark-700">
                        <div className="relative">
                            <div className="absolute -left-8 top-0 w-6 h-6 bg-dark-800 border-2 border-primary rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                            </div>
                            <p className="text-sm text-gray-300"><span className="font-semibold text-white">Mehmet Demir</span> görevi oluşturdu.</p>
                            <p className="text-xs text-gray-500 mt-1">15 Haziran 2023, 10:23</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-8 top-0 w-6 h-6 bg-dark-800 border-2 border-blue-400 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-3 h-3 text-blue-400" />
                            </div>
                            <div className="bg-dark-900 p-4 rounded-lg rounded-tl-none border border-dark-700">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-white text-sm">Ayşe Kaya</span>
                                    <span className="text-xs text-gray-500">20 Haziran 2023, 11:30</span>
                                </div>
                                <p className="text-sm text-gray-300">İlk taslak tamamlandı, dosyalara ekledim. Geri bildirim bekliyorum.</p>
                            </div>
                        </div>
                        <div className="relative">
                             <div className="absolute -left-8 top-0 w-6 h-6 bg-dark-800 border-2 border-green-500 rounded-full flex items-center justify-center">
                                <ThumbsUp className="w-3 h-3 text-green-500" />
                            </div>
                            <p className="text-sm text-gray-300"><span className="font-semibold text-white">Mehmet Demir</span> taslağı onayladı.</p>
                            <p className="text-xs text-gray-500 mt-1">21 Haziran 2023, 09:15</p>
                        </div>
                     </div>

                     {/* Comment Input */}
                     <div className="mt-8 flex gap-4">
                        <img src="https://picsum.photos/id/64/40/40" className="w-10 h-10 rounded-full" alt="Me" />
                        <div className="flex-1">
                            <textarea 
                                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                                rows={3}
                                placeholder="Yorum yaz..."
                            ></textarea>
                            <div className="flex justify-end mt-2">
                                <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">Gönder</button>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="w-full lg:w-1/4 space-y-6">
                {/* AI Suggestions */}
                <div className="bg-gradient-to-br from-indigo-900 to-dark-800 rounded-xl p-5 border border-indigo-500/30">
                     <div className="flex items-center space-x-2 mb-3">
                         <Zap className="w-4 h-4 text-yellow-400" />
                         <h3 className="font-bold text-white text-sm">YZ Önerileri</h3>
                     </div>
                     <ul className="space-y-3">
                         <li className="text-xs text-gray-300 bg-black/20 p-2 rounded border-l-2 border-yellow-400">
                             Raporunuza rakip kampanyalarla karşılaştırmalı analiz ekleyebilirsiniz.
                         </li>
                         <li className="text-xs text-gray-300 bg-black/20 p-2 rounded border-l-2 border-blue-400">
                             Hedef kitle segmentasyonu analizi derinleştirilmelidir.
                         </li>
                     </ul>
                </div>

                {/* KPIs Impact */}
                <div className="bg-dark-800 rounded-xl p-5 border border-dark-700">
                     <div className="flex items-center space-x-2 mb-4">
                         <BarChart className="w-4 h-4 text-purple-400" />
                         <h3 className="font-bold text-white text-sm">Etkilediği KPI'lar</h3>
                     </div>
                     <div className="space-y-4">
                         <div>
                             <div className="flex justify-between text-xs mb-1">
                                 <span className="text-gray-400">Pazarlama ROI</span>
                                 <span className="text-green-400">+12%</span>
                             </div>
                             <div className="w-full bg-dark-700 h-1.5 rounded-full">
                                 <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                             </div>
                         </div>
                         <div>
                             <div className="flex justify-between text-xs mb-1">
                                 <span className="text-gray-400">Dönüşüm Oranı</span>
                                 <span className="text-blue-400">+3%</span>
                             </div>
                             <div className="w-full bg-dark-700 h-1.5 rounded-full">
                                 <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                             </div>
                         </div>
                     </div>
                </div>

                {/* Documents */}
                <div className="bg-dark-800 rounded-xl p-5 border border-dark-700">
                    <h3 className="font-bold text-white text-sm mb-4">İlgili Dokümanlar</h3>
                    <div className="space-y-3">
                        <div className="flex items-center p-2 bg-dark-900 rounded border border-dark-700 hover:border-gray-500 cursor-pointer transition">
                            <FileText className="w-8 h-8 text-red-500 bg-red-500/10 p-1.5 rounded mr-3" />
                            <div className="overflow-hidden">
                                <p className="text-xs font-medium text-white truncate">Kampanya_Raporu.pdf</p>
                                <p className="text-[10px] text-gray-500">4.7 MB</p>
                            </div>
                        </div>
                        <div className="flex items-center p-2 bg-dark-900 rounded border border-dark-700 hover:border-gray-500 cursor-pointer transition">
                            <FileText className="w-8 h-8 text-green-500 bg-green-500/10 p-1.5 rounded mr-3" />
                            <div className="overflow-hidden">
                                <p className="text-xs font-medium text-white truncate">Veri_Seti.xlsx</p>
                                <p className="text-[10px] text-gray-500">2.4 MB</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-4 text-xs text-gray-400 hover:text-white border border-dashed border-dark-600 rounded p-2 hover:bg-dark-700 transition">
                        + Doküman Ekle
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TaskDetail;