import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Zap, 
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const kpiData = [
    { name: 'Completed', value: 76, color: '#10b981' },
    { name: 'Remaining', value: 24, color: '#334155' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-2xl border border-primary/20 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Hoş Geldiniz, Emre!</h2>
            <p className="text-sm text-gray-400">Bugün projelerinizde harika işler çıkarma zamanı.</p>
          </div>
          <button 
            onClick={() => navigate('/projects/new')}
            className="mt-4 flex items-center justify-center w-full py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Proje
          </button>
        </div>

        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+2%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">24</div>
          <p className="text-sm text-gray-400">Toplam Proje</p>
        </div>

        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+5%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">78</div>
          <p className="text-sm text-gray-400">Aktif Görevler</p>
        </div>

        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
             <span className="text-xs font-medium text-gray-400">Bu Ay</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">156</div>
          <p className="text-sm text-gray-400">Tamamlanan Görevler</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Aktif Projeler</h3>
            <button className="text-sm text-primary hover:text-blue-400">Tümü</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Project Card 1 */}
             <div onClick={() => navigate('/projects/1')} className="bg-dark-800 p-5 rounded-xl border border-dark-700 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                   <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">W</div>
                   <MoreHorizontal className="w-5 h-5 text-gray-500 group-hover:text-white" />
                </div>
                <h4 className="font-semibold text-white mb-1">Web Sitesi Yenileme</h4>
                <p className="text-xs text-gray-400 mb-4">UI/UX Tasarım aşamasında</p>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>İlerleme</span>
                  <span className="text-white">65%</span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
             </div>

             {/* Project Card 2 */}
             <div onClick={() => navigate('/projects/2')} className="bg-dark-800 p-5 rounded-xl border border-dark-700 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                   <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">M</div>
                   <MoreHorizontal className="w-5 h-5 text-gray-500 group-hover:text-white" />
                </div>
                <h4 className="font-semibold text-white mb-1">Mobil Uygulama</h4>
                <p className="text-xs text-gray-400 mb-4">Backend geliştirme</p>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>İlerleme</span>
                  <span className="text-white">45%</span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
             </div>
             
             {/* Project Card 3 */}
             <div onClick={() => navigate('/projects/3')} className="bg-dark-800 p-5 rounded-xl border border-dark-700 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                   <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">C</div>
                   <MoreHorizontal className="w-5 h-5 text-gray-500 group-hover:text-white" />
                </div>
                <h4 className="font-semibold text-white mb-1">CRM Entegrasyonu</h4>
                <p className="text-xs text-gray-400 mb-4">Test aşamasında</p>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>İlerleme</span>
                  <span className="text-white">78%</span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                </div>
             </div>

              {/* Project Card 4 */}
              <div onClick={() => navigate('/projects/4')} className="bg-dark-800 p-5 rounded-xl border border-dark-700 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                   <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">V</div>
                   <MoreHorizontal className="w-5 h-5 text-gray-500 group-hover:text-white" />
                </div>
                <h4 className="font-semibold text-white mb-1">Veritabanı Opt.</h4>
                <p className="text-xs text-gray-400 mb-4">Analiz aşamasında</p>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>İlerleme</span>
                  <span className="text-white">35%</span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-1.5">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '35%' }}></div>
                </div>
             </div>
          </div>
          
          {/* AI Suggestions Panel */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 border border-indigo-500/30">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Yapay Zeka Önerileri</h3>
                </div>
                <button onClick={() => navigate('/documents/analysis')} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-white transition-colors">
                    Tümünü Gör
                </button>
             </div>
             <div className="space-y-3">
                <div className="bg-dark-900/50 p-3 rounded-lg flex items-start space-x-3 cursor-pointer hover:bg-dark-900/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                    <div>
                        <p className="text-sm text-gray-200">"Mobil Uygulama" projesi için sprint hızı düşüyor. Ek kaynak planlaması önerilir.</p>
                        <p className="text-xs text-gray-500 mt-1">AI Analizi • 2 saat önce</p>
                    </div>
                </div>
                <div className="bg-dark-900/50 p-3 rounded-lg flex items-start space-x-3 cursor-pointer hover:bg-dark-900/70">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></div>
                    <div>
                        <p className="text-sm text-gray-200">Son yüklenen "Pazar Araştırması" dokümanında 3 kritik risk tespit edildi.</p>
                         <p className="text-xs text-gray-500 mt-1">Doküman Analizi • 5 saat önce</p>
                    </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: KPI & Tasks */}
        <div className="space-y-6">
          {/* KPI Summary */}
          <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
             <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Proje Başarımı</h3>
                <button onClick={() => navigate('/kpi')} className="text-xs text-primary">Detay</button>
             </div>
             <div className="h-48 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={kpiData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {kpiData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-2xl font-bold text-white">76%</div>
                    <div className="text-xs text-gray-400">Tamamlanan</div>
                 </div>
             </div>
             <div className="flex justify-between mt-2 text-sm">
                <div className="text-gray-400">Bütçe Kullanımı</div>
                <div className="text-white font-medium">65%</div>
             </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Yaklaşan Görevler</h3>
             </div>
             <div className="space-y-4">
                 {[
                     { title: 'API Dokümantasyonu', due: 'Bugün', priority: 'High', color: 'red' },
                     { title: 'Tasarım Revizyonu', due: 'Yarın', priority: 'Medium', color: 'orange' },
                     { title: 'Haftalık Toplantı', due: 'Çarşamba', priority: 'Low', color: 'blue' }
                 ].map((task, i) => (
                    <div key={i} onClick={() => navigate('/tasks/1')} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full bg-${task.color}-500`}></div>
                            <div>
                                <p className="text-sm font-medium text-white">{task.title}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {task.due}
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600" />
                    </div>
                 ))}
             </div>
          </div>
          
          {/* Risk Alert */}
           <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-semibold text-red-400">Kritik Risk Uyarısı</h4>
                    <p className="text-xs text-gray-300 mt-1">Mobil Uygulama projesinde bütçe aşımı riski tespit edildi.</p>
                </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;