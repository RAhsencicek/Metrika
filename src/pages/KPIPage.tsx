import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, Calendar } from 'lucide-react';

const KPIPage: React.FC = () => {
  // Mock Data
  const revenueData = [
    { name: 'Oca', revenue: 4000, profit: 2400 },
    { name: 'Şub', revenue: 3000, profit: 1398 },
    { name: 'Mar', revenue: 2000, profit: 9800 },
    { name: 'Nis', revenue: 2780, profit: 3908 },
    { name: 'May', revenue: 1890, profit: 4800 },
    { name: 'Haz', revenue: 2390, profit: 3800 },
    { name: 'Tem', revenue: 3490, profit: 4300 },
  ];

  const projectPerformance = [
    { name: 'Web', onTime: 85, budget: 90 },
    { name: 'Mobil', onTime: 65, budget: 110 },
    { name: 'CRM', onTime: 95, budget: 85 },
    { name: 'Veri', onTime: 45, budget: 70 },
    { name: 'Altyapı', onTime: 100, budget: 95 },
  ];

  return (
    <div className="pb-20 animate-fade-in">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">KPI Gösterge Paneli</h1>
            <p className="text-gray-400 text-sm">Şirket genelindeki performans metrikleri ve finansal özetler.</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Toplam Gelir (YTD)</p>
                        <h3 className="text-2xl font-bold text-white mt-1">₺2,450,000</h3>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-500" />
                    </div>
                </div>
                <div className="flex items-center text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+12.5%</span>
                    <span className="text-gray-500 ml-2 text-xs">geçen yıla göre</span>
                </div>
            </div>

            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Proje Başarı Oranı</p>
                        <h3 className="text-2xl font-bold text-white mt-1">94%</h3>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Target className="w-6 h-6 text-blue-500" />
                    </div>
                </div>
                <div className="flex items-center text-blue-400 text-sm">
                    <Activity className="w-4 h-4 mr-1" />
                    <span>Hedef: 90%</span>
                </div>
            </div>

            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Ort. Tamamlanma</p>
                        <h3 className="text-2xl font-bold text-white mt-1">14 Gün</h3>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Calendar className="w-6 h-6 text-purple-500" />
                    </div>
                </div>
                <div className="flex items-center text-green-400 text-sm">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    <span>-2 gün</span>
                    <span className="text-gray-500 ml-2 text-xs">daha hızlı</span>
                </div>
            </div>

            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Aktif Sorunlar</p>
                        <h3 className="text-2xl font-bold text-white mt-1">12</h3>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <Activity className="w-6 h-6 text-red-500" />
                    </div>
                </div>
                <div className="flex items-center text-red-400 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+3 yeni</span>
                    <span className="text-gray-500 ml-2 text-xs">bu hafta</span>
                </div>
            </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                <h3 className="text-lg font-bold text-white mb-6">Finansal Genel Bakış</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" name="Gelir" />
                            <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" name="Kâr" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                <h3 className="text-lg font-bold text-white mb-6">Proje Bazlı Performans & Bütçe</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                             <XAxis dataKey="name" stroke="#64748b" />
                             <YAxis stroke="#64748b" />
                             <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                             <Legend />
                             <Bar dataKey="onTime" name="Zamanlama (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                             <Bar dataKey="budget" name="Bütçe Kullanımı (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
};

export default KPIPage;