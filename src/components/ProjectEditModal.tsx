import React, { useState } from 'react';
import { X, Calendar, DollarSign, AlertTriangle, Trash2 } from 'lucide-react';

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectEditData) => void;
  onDelete?: () => void;
  project: {
    id: string;
    title: string;
    description: string;
    status: 'Active' | 'Completed' | 'On Hold' | 'At Risk';
    methodology: 'Waterfall' | 'Scrum' | 'Hybrid';
    startDate: string;
    endDate: string;
    budget: number;
  };
}

interface ProjectEditData {
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'At Risk';
  startDate: string;
  endDate: string;
  budget: string;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  project
}) => {
  const [formData, setFormData] = useState<ProjectEditData>({
    title: project.title,
    description: project.description,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    budget: project.budget.toString()
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-bold text-white">Projeyi Düzenle</h2>
            <p className="text-sm text-gray-400 mt-1">Proje bilgilerini güncelleyin</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Proje Adı *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Durum</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'Active', label: 'Aktif', color: 'green' },
                { value: 'On Hold', label: 'Beklemede', color: 'yellow' },
                { value: 'At Risk', label: 'Riskli', color: 'red' },
                { value: 'Completed', label: 'Tamamlandı', color: 'blue' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFormData({ ...formData, status: status.value as ProjectEditData['status'] })}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${formData.status === status.value
                      ? `bg-${status.color}-500/20 border-${status.color}-500/50 text-${status.color}-400`
                      : 'bg-dark-900 border-dark-600 text-gray-400 hover:border-dark-500'
                    }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                Başlangıç Tarihi
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
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
              Bütçe (₺)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Methodology Info (Read-only) */}
          <div className="bg-dark-900/50 rounded-lg p-4 border border-dark-700">
            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Metodoloji</p>
            <p className="text-white font-medium">{project.methodology}</p>
            <p className="text-xs text-gray-400 mt-1">Metodoloji proje oluşturulduktan sonra değiştirilemez.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-dark-700">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Projeyi Sil
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-dark-600 text-gray-300 hover:bg-dark-700 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.title}
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 disabled:bg-dark-700 disabled:text-gray-500 text-white font-medium transition-colors"
            >
              Kaydet
            </button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-dark-900/95 flex items-center justify-center rounded-2xl">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Projeyi Silmek İstediğinize Emin Misiniz?</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                "{project.title}" projesi ve tüm ilişkili veriler kalıcı olarak silinecektir. Bu işlem geri alınamaz.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2.5 rounded-lg border border-dark-600 text-gray-300 hover:bg-dark-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
                >
                  Evet, Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectEditModal;
