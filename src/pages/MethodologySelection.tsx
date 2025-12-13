import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Layers, RefreshCw, GitMerge, FileText, PenTool, Code, Bug, Rocket } from 'lucide-react';

const MethodologySelection: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>('Waterfall');

  const methodologies = [
    {
      id: 'Waterfall',
      icon: Layers,
      description: 'Aşamalı ve doğrusal bir yaklaşım. Her aşama bir önceki tamamlandıktan sonra başlar.',
      types: 'Altyapı, inşaat, net kapsamlı projeler',
      color: 'blue'
    },
    {
      id: 'Scrum',
      icon: RefreshCw,
      description: 'Çevik, iteratif bir yaklaşım. Kısa sprintlerle sürekli geri bildirim ve gelişim sağlar.',
      types: 'Yazılım geliştirme, ürün tasarımı',
      color: 'purple'
    },
    {
      id: 'Hibrit',
      icon: GitMerge,
      description: 'Waterfall ve Agile\'ın en iyi yanlarını birleştiren esnek bir yapı.',
      types: 'Kurumsal dönüşüm, karmaşık projeler',
      color: 'green'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in pb-20">
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-400 mb-2">
            <span>Yeni Proje Oluşturma</span>
            <span className="mx-2">/</span>
            <span className="text-white">Adım 2/5</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Metodoloji Seçimi</h1>
        <p className="text-gray-400">Projenizin doğasına en uygun yönetim şeklini belirleyin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {methodologies.map((m) => (
            <div 
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selected === m.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-dark-700 bg-dark-800 hover:border-dark-600'
                }`}
            >
                {selected === m.id && (
                    <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full">
                        <Check className="w-4 h-4" />
                    </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    selected === m.id ? 'bg-primary text-white' : 'bg-dark-700 text-gray-400'
                }`}>
                    <m.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{m.id}</h3>
                <p className="text-sm text-gray-400 mb-4 h-20">{m.description}</p>
                <div className="pt-4 border-t border-dark-700/50">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Uygun Türler</span>
                    <p className="text-xs text-gray-300 mt-1">{m.types}</p>
                </div>
            </div>
        ))}
      </div>

      {selected === 'Waterfall' && (
        <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-4">Waterfall Metodolojisi Hakkında</h3>
            <p className="text-gray-300 mb-6">
                Waterfall metodolojisi, projenin önceden belirlenmiş aşamalar halinde (Analiz, Tasarım, Geliştirme, Test, Yayınlama) ilerlemesini sağlar. Geri dönüşlerin maliyetli olduğu projeler için idealdir.
            </p>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-200">
                    <span className="font-bold">Bilgi:</span> Bu metodoloji seçildiğinde, sistem otomatik olarak faz bazlı bir Gantt şeması oluşturacak ve kalite kapıları (quality gates) tanımlayacaktır.
                </p>
            </div>

            <div className="flex justify-between items-center relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-dark-700 -z-10 transform -translate-y-1/2"></div>
                
                {[
                    { icon: FileText, label: 'Gereksinimler' },
                    { icon: PenTool, label: 'Tasarım' },
                    { icon: Code, label: 'Geliştirme' },
                    { icon: Bug, label: 'Test' },
                    { icon: Rocket, label: 'Yayınlama' }
                ].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-dark-800 px-2">
                        <div className="w-10 h-10 rounded-full bg-dark-700 border-2 border-primary flex items-center justify-center text-primary mb-2">
                            <step.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-gray-400">{step.label}</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="mt-10 flex justify-between">
         <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg border border-dark-600 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors flex items-center"
         >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
         </button>
         <button 
            onClick={() => navigate('/projects/1')}
            className="px-8 py-3 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-lg shadow-primary/20"
         >
            İleri
         </button>
      </div>
    </div>
  );
};

export default MethodologySelection;