import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Layers, RefreshCw, GitMerge,
  FileText, Calendar, Users, Target, DollarSign, Plus, X, Search
} from 'lucide-react';
import { useProjectStore, useNotificationStore } from '../store';
import type { ProjectColor } from '../types';

interface ProjectFormData {
  methodology: 'Waterfall' | 'Scrum' | 'Hybrid' | '';
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
  teamMembers: TeamMember[];
  kpis: KPI[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: number;
}

interface KPI {
  id: string;
  name: string;
  target: string;
  unit: string;
}

const CreateProjectWizard: React.FC = () => {
  const navigate = useNavigate();
  const { addProject } = useProjectStore();
  const { addNotification } = useNotificationStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    methodology: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    teamMembers: [],
    kpis: []
  });

  const totalSteps = 5;

  const steps = [
    { number: 1, title: 'Metodoloji', icon: Layers },
    { number: 2, title: 'Proje Bilgileri', icon: FileText },
    { number: 3, title: 'Ekip', icon: Users },
    { number: 4, title: 'KPI\'lar', icon: Target },
    { number: 5, title: 'Özet', icon: Check },
  ];

  const methodologies = [
    {
      id: 'Waterfall',
      icon: Layers,
      title: 'Waterfall',
      description: 'Aşamalı ve doğrusal bir yaklaşım. Her aşama bir önceki tamamlandıktan sonra başlar.',
      types: 'Altyapı, inşaat, net kapsamlı projeler',
      color: 'blue'
    },
    {
      id: 'Scrum',
      icon: RefreshCw,
      title: 'Scrum',
      description: 'Çevik, iteratif bir yaklaşım. Kısa sprintlerle sürekli geri bildirim ve gelişim sağlar.',
      types: 'Yazılım geliştirme, ürün tasarımı',
      color: 'purple'
    },
    {
      id: 'Hybrid',
      icon: GitMerge,
      title: 'Hibrit',
      description: 'Waterfall ve Agile\'ın en iyi yanlarını birleştiren esnek bir yapı.',
      types: 'Kurumsal dönüşüm, karmaşık projeler',
      color: 'green'
    }
  ];

  // Available team members to select from
  const availableMembers: TeamMember[] = [
    { id: '1', name: 'Emre Yılmaz', role: 'Proje Yöneticisi', avatar: 64 },
    { id: '2', name: 'Ahmet Kaya', role: 'Backend Developer', avatar: 60 },
    { id: '3', name: 'Zeynep Demir', role: 'Frontend Developer', avatar: 61 },
    { id: '4', name: 'Mehmet Yıldız', role: 'Database Admin', avatar: 62 },
    { id: '5', name: 'Ayşe Öztürk', role: 'UI/UX Designer', avatar: 63 },
    { id: '6', name: 'Caner Erkin', role: 'QA Tester', avatar: 65 },
    { id: '7', name: 'Selin Yılmaz', role: 'HR Specialist', avatar: 44 },
    { id: '8', name: 'Burak Yılmaz', role: 'DevOps Engineer', avatar: 45 },
  ];

  // Predefined KPI templates
  const kpiTemplates = [
    { name: 'Sprint Hızı', unit: 'story point' },
    { name: 'Bütçe Kullanımı', unit: '%' },
    { name: 'Zamanında Teslimat', unit: '%' },
    { name: 'Bug Sayısı', unit: 'adet' },
    { name: 'Müşteri Memnuniyeti', unit: 'puan' },
    { name: 'Code Coverage', unit: '%' },
  ];

  const [memberSearch, setMemberSearch] = useState('');
  const [newKpiName, setNewKpiName] = useState('');
  const [newKpiTarget, setNewKpiTarget] = useState('');
  const [newKpiUnit, setNewKpiUnit] = useState('');

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/projects');
    }
  };

  const handleMethodologySelect = (methodology: 'Waterfall' | 'Scrum' | 'Hybrid') => {
    setFormData({ ...formData, methodology });
  };

  const handleAddMember = (member: TeamMember) => {
    if (!formData.teamMembers.find(m => m.id === member.id)) {
      setFormData({ ...formData, teamMembers: [...formData.teamMembers, member] });
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter(m => m.id !== memberId)
    });
  };

  const handleAddKpi = () => {
    if (newKpiName && newKpiTarget && newKpiUnit) {
      const newKpi: KPI = {
        id: Date.now().toString(),
        name: newKpiName,
        target: newKpiTarget,
        unit: newKpiUnit
      };
      setFormData({ ...formData, kpis: [...formData.kpis, newKpi] });
      setNewKpiName('');
      setNewKpiTarget('');
      setNewKpiUnit('');
    }
  };

  const handleRemoveKpi = (kpiId: string) => {
    setFormData({ ...formData, kpis: formData.kpis.filter(k => k.id !== kpiId) });
  };

  const handleAddKpiTemplate = (template: { name: string; unit: string }) => {
    const newKpi: KPI = {
      id: crypto.randomUUID(),
      name: template.name,
      target: '',
      unit: template.unit
    };
    setFormData({ ...formData, kpis: [...formData.kpis, newKpi] });
  };

  const handleCreateProject = async () => {
    // Generate a project color based on methodology
    const colorMap: Record<string, ProjectColor> = {
      'Scrum': 'purple',
      'Waterfall': 'blue',
      'Hybrid': 'green',
    };

    // Create the project using the store
    const newProject = await addProject({
      title: formData.name,
      description: formData.description || `${formData.methodology} metodolojisi ile oluşturulan proje.`,
      status: 'Active',
      progress: 0,
      methodology: formData.methodology as 'Waterfall' | 'Scrum' | 'Hybrid',
      startDate: formData.startDate,
      dueDate: formData.endDate,
      teamSize: formData.teamMembers.length,
      tasksCompleted: 0,
      totalTasks: 0,
      budget: parseFloat(formData.budget) || 0,
      budgetUsed: 0,
      color: colorMap[formData.methodology] || 'blue',
      managerId: formData.teamMembers[0]?.id || '1',
      teamMemberIds: formData.teamMembers.map(m => m.id),
      kpis: formData.kpis.map(k => ({ ...k, current: '0' })),
    });

    // Add a success notification
    addNotification({
      type: 'success',
      title: 'Proje Oluşturuldu',
      message: `"${formData.name}" projesi başarıyla oluşturuldu.`,
      actionUrl: `/projects/${newProject.id}`,
    });

    // Navigate to the new project
    navigate(`/projects/${newProject.id}`);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.methodology !== '';
      case 2: return formData.name !== '' && formData.startDate !== '' && formData.endDate !== '';
      case 3: return formData.teamMembers.length > 0;
      case 4: return true; // KPIs are optional
      case 5: return true;
      default: return false;
    }
  };

  const filteredMembers = availableMembers.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.role.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <span>Yeni Proje Oluşturma</span>
          <span className="mx-2">/</span>
          <span className="text-white">Adım {currentStep}/{totalSteps}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{steps[currentStep - 1].title}</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-dark-700 -z-10"></div>
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${currentStep > step.number
                ? 'bg-green-500 border-green-500 text-white'
                : currentStep === step.number
                  ? 'bg-primary border-primary text-white'
                  : 'bg-dark-800 border-dark-600 text-gray-500'
                }`}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            <span className={`text-xs mt-2 ${currentStep >= step.number ? 'text-white' : 'text-gray-500'}`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Methodology Selection */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-gray-400">Projenizin doğasına en uygun yönetim şeklini belirleyin.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {methodologies.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleMethodologySelect(m.id as 'Waterfall' | 'Scrum' | 'Hybrid')}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${formData.methodology === m.id
                    ? 'border-primary bg-primary/5'
                    : 'border-dark-700 bg-dark-800 hover:border-dark-600'
                    }`}
                >
                  {formData.methodology === m.id && (
                    <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${formData.methodology === m.id ? 'bg-primary text-white' : 'bg-dark-700 text-gray-400'
                    }`}>
                    <m.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{m.title}</h3>
                  <p className="text-sm text-gray-400 mb-4 h-20">{m.description}</p>
                  <div className="pt-4 border-t border-dark-700/50">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Uygun Türler</span>
                    <p className="text-xs text-gray-300 mt-1">{m.types}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Methodology Info Box */}
            {formData.methodology === 'Waterfall' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 animate-slide-up">
                <p className="text-sm text-blue-200">
                  <span className="font-bold">Bilgi:</span> Bu metodoloji seçildiğinde, sistem otomatik olarak faz bazlı bir Gantt şeması oluşturacak ve kalite kapıları (quality gates) tanımlayacaktır.
                </p>
              </div>
            )}
            {formData.methodology === 'Scrum' && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 animate-slide-up">
                <p className="text-sm text-purple-200">
                  <span className="font-bold">Bilgi:</span> Scrum metodolojisi ile sprint bazlı planlama, backlog yönetimi ve burn-down grafikleri aktif olacaktır.
                </p>
              </div>
            )}
            {formData.methodology === 'Hybrid' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 animate-slide-up">
                <p className="text-sm text-green-200">
                  <span className="font-bold">Bilgi:</span> Hibrit metodoloji ile hem faz bazlı planlama hem de sprint yönetimi özelliklerinden yararlanabilirsiniz.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Project Information */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-gray-400">Projenizin temel bilgilerini girin.</p>

            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Proje Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: E-Ticaret Platformu Yenileme"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Projenin kapsamı ve hedefleri hakkında kısa bir açıklama..."
                  rows={4}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  Tahmini Bütçe (₺)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="Örn: 250000"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Team Selection */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-gray-400">Projenize dahil olacak ekip üyelerini seçin.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Members */}
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h3 className="font-semibold text-white mb-4">Mevcut Ekip Üyeleri</h3>

                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="İsim veya rol ara..."
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredMembers.map((member) => {
                    const isSelected = formData.teamMembers.find(m => m.id === member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => !isSelected && handleAddMember(member)}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isSelected
                          ? 'bg-dark-900/50 opacity-50 cursor-not-allowed'
                          : 'bg-dark-900 hover:bg-dark-700 cursor-pointer'
                          }`}
                      >
                        <div className="flex items-center">
                          <img
                            src={`https://picsum.photos/id/${member.avatar}/32/32`}
                            className="w-8 h-8 rounded-full mr-3"
                            alt={member.name}
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                        </div>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Plus className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Members */}
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Seçilen Üyeler</h3>
                  <span className="text-xs text-gray-400">{formData.teamMembers.length} kişi</span>
                </div>

                {formData.teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Henüz ekip üyesi seçilmedi</p>
                    <p className="text-gray-500 text-xs mt-1">Soldan üye ekleyin</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20"
                      >
                        <div className="flex items-center">
                          <img
                            src={`https://picsum.photos/id/${member.avatar}/32/32`}
                            className="w-8 h-8 rounded-full mr-3"
                            alt={member.name}
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{member.name}</p>
                            <p className="text-xs text-gray-400">{member.role}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 hover:bg-dark-700 rounded text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: KPI Definition */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-gray-400">Projeniz için takip edilecek KPI'ları tanımlayın. (Opsiyonel)</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add KPI */}
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h3 className="font-semibold text-white mb-4">Yeni KPI Ekle</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">KPI Adı</label>
                    <input
                      type="text"
                      value={newKpiName}
                      onChange={(e) => setNewKpiName(e.target.value)}
                      placeholder="Örn: Sprint Hızı"
                      className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Hedef Değer</label>
                      <input
                        type="text"
                        value={newKpiTarget}
                        onChange={(e) => setNewKpiTarget(e.target.value)}
                        placeholder="Örn: 50"
                        className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Birim</label>
                      <input
                        type="text"
                        value={newKpiUnit}
                        onChange={(e) => setNewKpiUnit(e.target.value)}
                        placeholder="Örn: story point"
                        className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddKpi}
                    disabled={!newKpiName || !newKpiTarget || !newKpiUnit}
                    className="w-full py-2 bg-primary hover:bg-blue-600 disabled:bg-dark-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    KPI Ekle
                  </button>
                </div>

                {/* KPI Templates */}
                <div className="mt-6 pt-6 border-t border-dark-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Hızlı Şablonlar</h4>
                  <div className="flex flex-wrap gap-2">
                    {kpiTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddKpiTemplate(template)}
                        className="px-3 py-1.5 bg-dark-900 hover:bg-dark-700 text-gray-300 rounded-lg text-xs border border-dark-600 transition-colors"
                      >
                        + {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPI List */}
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Tanımlanan KPI'lar</h3>
                  <span className="text-xs text-gray-400">{formData.kpis.length} adet</span>
                </div>

                {formData.kpis.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Henüz KPI tanımlanmadı</p>
                    <p className="text-gray-500 text-xs mt-1">Bu adımı atlayabilirsiniz</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.kpis.map((kpi) => (
                      <div
                        key={kpi.id}
                        className="flex items-center justify-between p-3 bg-dark-900 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{kpi.name}</p>
                          <p className="text-xs text-gray-500">
                            Hedef: {kpi.target || '—'} {kpi.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveKpi(kpi.id)}
                          className="p-1 hover:bg-dark-700 rounded text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Summary */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-gray-400">Proje bilgilerinizi gözden geçirin ve oluşturun.</p>

            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 space-y-6">
              {/* Methodology */}
              <div className="flex items-start justify-between pb-4 border-b border-dark-700">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Metodoloji</p>
                  <p className="text-lg font-semibold text-white mt-1">{formData.methodology}</p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-primary hover:text-blue-400"
                >
                  Düzenle
                </button>
              </div>

              {/* Project Info */}
              <div className="pb-4 border-b border-dark-700">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 uppercase font-medium">Proje Bilgileri</p>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-primary hover:text-blue-400"
                  >
                    Düzenle
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white">{formData.name}</h3>
                {formData.description && (
                  <p className="text-sm text-gray-400 mt-2">{formData.description}</p>
                )}
                <div className="flex flex-wrap gap-6 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Başlangıç</p>
                    <p className="text-sm text-white">
                      {formData.startDate ? new Date(formData.startDate).toLocaleDateString('tr-TR') : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bitiş</p>
                    <p className="text-sm text-white">
                      {formData.endDate ? new Date(formData.endDate).toLocaleDateString('tr-TR') : '—'}
                    </p>
                  </div>
                  {formData.budget && (
                    <div>
                      <p className="text-xs text-gray-500">Bütçe</p>
                      <p className="text-sm text-white">₺{parseInt(formData.budget).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Team */}
              <div className="pb-4 border-b border-dark-700">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 uppercase font-medium">Ekip ({formData.teamMembers.length} kişi)</p>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-primary hover:text-blue-400"
                  >
                    Düzenle
                  </button>
                </div>
                <div className="flex -space-x-2">
                  {formData.teamMembers.slice(0, 6).map((member) => (
                    <img
                      key={member.id}
                      src={`https://picsum.photos/id/${member.avatar}/32/32`}
                      className="w-10 h-10 rounded-full border-2 border-dark-800"
                      alt={member.name}
                      title={member.name}
                    />
                  ))}
                  {formData.teamMembers.length > 6 && (
                    <div className="w-10 h-10 rounded-full bg-dark-700 border-2 border-dark-800 flex items-center justify-center text-xs text-white">
                      +{formData.teamMembers.length - 6}
                    </div>
                  )}
                </div>
              </div>

              {/* KPIs */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 uppercase font-medium">KPI'lar ({formData.kpis.length} adet)</p>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="text-xs text-primary hover:text-blue-400"
                  >
                    Düzenle
                  </button>
                </div>
                {formData.kpis.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.kpis.map((kpi) => (
                      <span
                        key={kpi.id}
                        className="px-3 py-1.5 bg-dark-900 text-gray-300 rounded-lg text-xs border border-dark-700"
                      >
                        {kpi.name}: {kpi.target} {kpi.unit}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">KPI tanımlanmadı</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 flex justify-between">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg border border-dark-600 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 1 ? 'İptal' : 'Geri'}
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-8 py-3 rounded-lg bg-primary hover:bg-blue-600 disabled:bg-dark-700 disabled:text-gray-500 text-white font-medium transition-colors shadow-lg shadow-primary/20 flex items-center"
          >
            İleri
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleCreateProject}
            className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium transition-colors shadow-lg shadow-green-600/20 flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            Projeyi Oluştur
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateProjectWizard;
