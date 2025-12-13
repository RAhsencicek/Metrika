import React from 'react';
import { HelpCircle, Book, MessageCircle, FileQuestion, ChevronRight, Search } from 'lucide-react';

const HelpPage: React.FC = () => {
  return (
    <div className="pb-20 animate-fade-in max-w-5xl mx-auto">
        <div className="text-center py-10">
            <h1 className="text-3xl font-bold text-white mb-4">Size nasıl yardımcı olabiliriz?</h1>
            <div className="relative max-w-xl mx-auto">
                <input 
                    type="text" 
                    placeholder="Soru veya konu arayın..." 
                    className="w-full bg-dark-800 border border-dark-600 rounded-full py-4 pl-12 pr-6 text-white focus:outline-none focus:border-primary shadow-lg"
                />
                <Search className="w-5 h-5 absolute left-4 top-4 text-gray-500" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 hover:border-primary/50 transition cursor-pointer group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition">
                    <Book className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Dokümantasyon</h3>
                <p className="text-gray-400 text-sm mb-4">Metrika'nın tüm özelliklerini detaylı rehberlerle öğrenin.</p>
                <span className="text-primary text-sm font-medium flex items-center">Rehberlere Git <ChevronRight className="w-4 h-4 ml-1" /></span>
            </div>

            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 hover:border-primary/50 transition cursor-pointer group">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 text-green-500 group-hover:bg-green-500 group-hover:text-white transition">
                    <FileQuestion className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Sıkça Sorulanlar</h3>
                <p className="text-gray-400 text-sm mb-4">En sık karşılaşılan soruların hızlı cevaplarını bulun.</p>
                <span className="text-primary text-sm font-medium flex items-center">SSS'yi İncele <ChevronRight className="w-4 h-4 ml-1" /></span>
            </div>

            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 hover:border-primary/50 transition cursor-pointer group">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition">
                    <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Canlı Destek</h3>
                <p className="text-gray-400 text-sm mb-4">Sorununuzu çözemediniz mi? Destek ekibimizle görüşün.</p>
                <span className="text-primary text-sm font-medium flex items-center">Destek Başlat <ChevronRight className="w-4 h-4 ml-1" /></span>
            </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-8 border border-dark-700">
            <h2 className="text-xl font-bold text-white mb-6">Popüler Konular</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    'Yeni bir proje nasıl oluşturulur?',
                    'XP puanları nasıl hesaplanır?',
                    'Takım üyeleri nasıl davet edilir?',
                    'API anahtarları nerede bulunur?',
                    'Bildirim ayarları nasıl değiştirilir?',
                    'Şifremi unuttum, ne yapmalıyım?'
                ].map((topic, i) => (
                    <div key={i} className="flex items-center p-3 bg-dark-900/50 rounded-lg hover:bg-dark-700 cursor-pointer transition">
                        <HelpCircle className="w-4 h-4 text-gray-500 mr-3" />
                        <span className="text-gray-300 text-sm">{topic}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default HelpPage;