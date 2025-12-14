import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Shield, Save, Camera, Mail, Check, AlertCircle } from 'lucide-react';
import { useUserStore, useNotificationStore } from '../store';

const Settings: React.FC = () => {
  const { currentUser, updateCurrentUser } = useUserStore();
  const { addNotification } = useNotificationStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    role: currentUser?.role || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    desktopNotifications: true,
    taskAssignments: true,
    deadlineReminders: true,
    weeklyReport: false,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  // Sync profile form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser]);

  const tabs = [
    { id: 'profile', label: 'Profilim', icon: User },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'security', label: 'Güvenlik', icon: Shield },
  ];

  // Handle profile save
  const handleSaveProfile = () => {
    setSaveStatus('saving');

    // Simulate API call
    setTimeout(() => {
      updateCurrentUser({
        name: profileForm.name,
        email: profileForm.email,
        role: profileForm.role,
        phone: profileForm.phone,
        bio: profileForm.bio,
      });

      setSaveStatus('saved');
      addNotification({
        type: 'success',
        title: 'Profil Güncellendi',
        message: 'Profil bilgileriniz başarıyla kaydedildi.',
      });

      // Reset status after a delay
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  // Handle notification settings save
  const handleSaveNotifications = () => {
    setSaveStatus('saving');

    setTimeout(() => {
      // In a real app, this would save to backend
      setSaveStatus('saved');
      addNotification({
        type: 'success',
        title: 'Bildirim Ayarları Güncellendi',
        message: 'Bildirim tercihleriniz başarıyla kaydedildi.',
      });

      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  // Handle password change
  const handleChangePassword = () => {
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Mevcut şifrenizi girmelisiniz.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Yeni şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }

    setSaveStatus('saving');

    setTimeout(() => {
      // In a real app, this would call API
      setSaveStatus('saved');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addNotification({
        type: 'success',
        title: 'Şifre Güncellendi',
        message: 'Şifreniz başarıyla değiştirildi.',
      });

      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (window.confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz silinecektir.')) {
      addNotification({
        type: 'warning',
        title: 'Hesap Silme',
        message: 'Hesap silme özelliği backend entegrasyonu gerektirir.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Ayarlar</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-white'
                }`}
            >
              <tab.icon className="w-4 h-4 mr-3" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 md:p-8">

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative group cursor-pointer">
                    <img
                      src={`https://picsum.photos/id/${currentUser?.avatar || 64}/100/100`}
                      className="w-24 h-24 rounded-full border-4 border-dark-700 group-hover:border-primary transition-colors"
                      alt="Profile"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{currentUser?.name}</h3>
                    <p className="text-gray-400 text-sm">{currentUser?.role}</p>
                    <button className="mt-2 text-sm text-primary hover:text-blue-400 font-medium">Fotoğrafı Değiştir</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Ad Soyad</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">E-Posta</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Unvan</label>
                    <input
                      type="text"
                      value={profileForm.role}
                      onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                      className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Telefon</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Biyografi</label>
                  <textarea
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-dark-700">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saveStatus === 'saving'}
                    className={`flex items-center px-6 py-2 rounded-lg transition-colors ${saveStatus === 'saved'
                      ? 'bg-green-500 text-white'
                      : 'bg-primary hover:bg-blue-600 text-white'
                      } disabled:opacity-50`}
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : saveStatus === 'saved' ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Kaydedildi!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Değişiklikleri Kaydet
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Bildirim Tercihleri</h3>

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', title: 'E-posta Bildirimleri', desc: 'Proje güncellemeleri ve günlük özetler hakkında e-posta al.' },
                    { key: 'desktopNotifications', title: 'Masaüstü Bildirimleri', desc: 'Tarayıcı açıkken anlık bildirimler göster.' },
                    { key: 'taskAssignments', title: 'Görev Atamaları', desc: 'Bana yeni bir görev atandığında bildir.' },
                    { key: 'deadlineReminders', title: 'Son Tarih Hatırlatıcıları', desc: 'Görev teslim tarihinden 24 saat önce uyar.' },
                    { key: 'weeklyReport', title: 'Haftalık Rapor', desc: 'Her Pazartesi haftalık performans raporunu gönder.' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            [item.key]: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-dark-700">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saveStatus === 'saving'}
                    className={`flex items-center px-6 py-2 rounded-lg transition-colors ${saveStatus === 'saved'
                        ? 'bg-green-500 text-white'
                        : 'bg-primary hover:bg-blue-600 text-white'
                      } disabled:opacity-50`}
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : saveStatus === 'saved' ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Kaydedildi!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Tercihleri Kaydet
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Şifre ve Güvenlik</h3>

                {passwordError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center text-red-400">
                    <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                    <span className="text-sm">{passwordError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Mevcut Şifre</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Yeni Şifre</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Yeni Şifre (Tekrar)</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mb-8">
                  <button
                    onClick={handleChangePassword}
                    disabled={saveStatus === 'saving'}
                    className={`flex items-center px-6 py-2 rounded-lg border transition-colors ${saveStatus === 'saved'
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-dark-700 hover:bg-dark-600 text-white border-dark-600'
                      } disabled:opacity-50`}
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Güncelleniyor...
                      </>
                    ) : saveStatus === 'saved' ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Güncellendi!
                      </>
                    ) : (
                      'Şifreyi Güncelle'
                    )}
                  </button>
                </div>

                <div className="border-t border-dark-700 pt-6">
                  <h4 className="text-red-400 font-bold mb-2">Tehlikeli Bölge</h4>
                  <p className="text-gray-400 text-sm mb-4">Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.</p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg transition-colors text-sm font-medium"
                  >
                    Hesabımı Sil
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;