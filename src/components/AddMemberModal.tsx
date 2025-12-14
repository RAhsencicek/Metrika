import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, Briefcase, MapPin } from 'lucide-react';
import { useUserStore } from '../store';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
    const { addUser, users } = useUserStore();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: 'Yazılım',
        location: 'İstanbul Ofis',
    });

    const [error, setError] = useState('');

    const departments = ['Yönetim', 'Yazılım', 'Tasarım', 'Veri', 'Kalite', 'İK', 'Altyapı'];
    const locations = ['İstanbul Ofis', 'Ankara (Remote)', 'İzmir (Remote)', 'Londra (Remote)'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim()) {
            setError('Lütfen zorunlu alanları doldurun.');
            return;
        }

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Geçerli bir email adresi girin.');
            return;
        }

        // Check if email already exists
        if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
            setError('Bu email adresi zaten kayıtlı.');
            return;
        }

        // Generate new user
        const newUser = {
            id: `user-${Date.now()}`,
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim() || '+90 555 000 00 00',
            role: formData.role.trim(),
            department: formData.department,
            location: formData.location,
            status: 'offline' as const,
            avatar: Math.floor(Math.random() * 100), // Random avatar
            level: 1,
            xp: 0,
            xpToNextLevel: 1000,
            rank: users.length + 1,
            bio: '',
            joinDate: new Date().toISOString().split('T')[0],
            skills: [],
            badges: [],
        };

        addUser(newUser);

        // Reset form
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: '',
            department: 'Yazılım',
            location: 'İstanbul Ofis',
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-dark-800 rounded-xl border border-dark-700 w-full max-w-md shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-700">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold text-white">Yeni Ekip Üyesi</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Ad Soyad *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            placeholder="Örn: Ahmet Yılmaz"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-primary"
                                placeholder="ornek@metrika.com"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Telefon</label>
                        <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-primary"
                                placeholder="+90 555 123 45 67"
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Pozisyon *</label>
                        <div className="relative">
                            <Briefcase className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                            <input
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-primary"
                                placeholder="Örn: Frontend Developer"
                            />
                        </div>
                    </div>

                    {/* Department & Location */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Departman</label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Lokasyon</label>
                            <select
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            >
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Üye Ekle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;
