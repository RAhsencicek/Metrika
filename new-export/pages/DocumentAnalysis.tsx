import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, AlertOctagon, List, ArrowLeft, Download, Share2 } from 'lucide-react';

const DocumentAnalysis: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-20 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
             <div className="flex items-center">
                <button onClick={() => navigate('/')} className="mr-4 p-2 bg-dark-800 rounded-lg hover:bg-dark-700 text-gray-400">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Yapay Zeka Doküman Analizi</h1>
                    <p className="text-sm text-gray-400">Dokümanlarınızı yükleyin ve yapay zeka ile analiz edin.</p>
                </div>
             </div>
             <div className="flex space-x-3">
                 <button className="bg-dark-800 text-white px-4 py-2 rounded-lg text-sm border border-dark-600 hover:bg-dark-700">Kaydet</button>
                 <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">Analizi Paylaş</button>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Document Card */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 h-fit">
                <div className="aspect-[3/4] bg-dark-900 rounded-lg border-2 border-dashed border-dark-600 flex flex-col items-center justify-center mb-6 relative group overflow-hidden">
                     {/* Mock Preview */}
                     <div className="absolute inset-0 bg-white opacity-5 p-8 text-[6px] text-black overflow-hidden leading-tight select-none">
                        lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
                        (repeated pattern)
                     </div>
                     <FileText className="w-16 h-16 text-primary mb-4 z-10" />
                     <p className="text-gray-400 text-sm z-10">SatisStratejisi_2023.pdf</p>
                     <p className="text-xs text-gray-600 z-10">2.4 MB</p>
                     
                     {/* Hover Overlay */}
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 space-x-4">
                        <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"><Download className="w-5 h-5"/></button>
                        <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"><Share2 className="w-5 h-5"/></button>
                     </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Yükleme Tarihi</span>
                        <span className="text-white">12 Mayıs 2023</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Durum</span>
                        <span className="text-green-400 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Analiz Tamamlandı</span>
                    </div>
                </div>
            </div>

            {/* Middle: Analysis Results */}
            <div className="lg:col-span-2 space-y-6">
                {/* Summary Card */}
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <List className="w-5 h-5 mr-2 text-primary" />
                        Yönetici Özeti
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                        Bu stratejik doküman, şirketin 2023 yılı için satış hedeflerini ve stratejilerini detaylandırmaktadır. 
                        Belgede, pazar analizi, hedef müşteri segmentleri, rekabet avantajları ve gelir tahminleri ele alınmaktadır. 
                        Özellikle <strong className="text-white">KOBI segmentinde %25 büyüme</strong> hedefi ve dijital pazarlama kanallarına <strong className="text-white">%30 bütçe artışı</strong> öne çıkmaktadır.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {['KOBI', 'Pazarlama', 'Bütçe Artışı', 'Satış Hedefi', 'Rekabet Analizi'].map(tag => (
                            <span key={tag} className="bg-dark-900 text-gray-400 px-3 py-1 rounded-full text-xs border border-dark-600">#{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Findings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 border-l-4 border-l-green-500">
                        <h4 className="font-bold text-white mb-3">Öne Çıkan Bulgular</h4>
                        <ul className="space-y-2">
                            <li className="flex items-start text-sm text-gray-400">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                                Yeni ürün lansmanı için pazarlama stratejisi güçlü.
                            </li>
                            <li className="flex items-start text-sm text-gray-400">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                                Müşteri memnuniyetinde %15 artış hedefleniyor.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 border-l-4 border-l-red-500">
                         <h4 className="font-bold text-white mb-3 flex items-center">
                            Tespit Edilen Riskler
                            <span className="ml-2 bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full">Kritik</span>
                         </h4>
                         <ul className="space-y-2">
                            <li className="flex items-start text-sm text-gray-400">
                                <AlertOctagon className="w-4 h-4 text-red-500 mr-2 shrink-0 mt-0.5" />
                                Finansal projeksiyon detayları bazı bölümlerde eksik (Sayfa 14).
                            </li>
                             <li className="flex items-start text-sm text-gray-400">
                                <AlertOctagon className="w-4 h-4 text-red-500 mr-2 shrink-0 mt-0.5" />
                                Rekabet analizi verileri 2021 yılına ait, güncellenmeli.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Action Items */}
                <div className="bg-gradient-to-r from-dark-800 to-dark-700 rounded-xl p-6 border border-dark-600">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white">Önerilen Aksiyonlar</h3>
                        <button className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-blue-600 transition">Tümünü Görevlere Ekle</button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-dark-900/50 p-3 rounded-lg border border-dark-600">
                            <span className="text-sm text-gray-300">Finansal projeksiyonları revize et</span>
                            <button className="text-primary hover:text-white text-xs">+ Görev Oluştur</button>
                        </div>
                        <div className="flex items-center justify-between bg-dark-900/50 p-3 rounded-lg border border-dark-600">
                            <span className="text-sm text-gray-300">Rakip analizini Q3 verileriyle güncelle</span>
                            <button className="text-primary hover:text-white text-xs">+ Görev Oluştur</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* History Table (Simplified) */}
        <div className="mt-10">
            <h3 className="text-lg font-bold text-white mb-4">Analiz Geçmişi</h3>
            <div className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-dark-900 text-gray-200 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Doküman Adı</th>
                            <th className="px-6 py-3">Tarih</th>
                            <th className="px-6 py-3">Tür</th>
                            <th className="px-6 py-3">Durum</th>
                            <th className="px-6 py-3 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                        <tr className="hover:bg-dark-700/50 transition">
                            <td className="px-6 py-4 font-medium text-white">Satış Stratejisi.pdf</td>
                            <td className="px-6 py-4">12 Mayıs 2023</td>
                            <td className="px-6 py-4">PDF</td>
                            <td className="px-6 py-4"><span className="bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs">Tamamlandı</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-primary hover:underline">Görüntüle</button></td>
                        </tr>
                         <tr className="hover:bg-dark-700/50 transition">
                            <td className="px-6 py-4 font-medium text-white">Pazar Araştırması.docx</td>
                            <td className="px-6 py-4">05 Mayıs 2023</td>
                            <td className="px-6 py-4">DOCX</td>
                            <td className="px-6 py-4"><span className="bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs">Tamamlandı</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-primary hover:underline">Görüntüle</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default DocumentAnalysis;