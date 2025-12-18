import React, { useState } from 'react';
import { X, Copy, Mail, Link2, Check, Users, Send } from 'lucide-react';
import { useDocumentStore, useUserStore, useNotificationStore } from '../store';

interface ShareAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysisId: string;
}

const ShareAnalysisModal: React.FC<ShareAnalysisModalProps> = ({ isOpen, onClose, analysisId }) => {
    const { generateShareLink, addShareRecipient, getAnalysisById } = useDocumentStore();
    const { users: teamMembers } = useUserStore();
    const { addNotification } = useNotificationStore();

    const [shareLink, setShareLink] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'link' | 'email' | 'team'>('link');

    const analysis = getAnalysisById(analysisId);

    if (!isOpen) return null;

    const handleGenerateLink = async () => {
        const link = generateShareLink(analysisId);
        setShareLink(link);

        // Auto-copy to clipboard for better UX
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            addNotification({
                type: 'success',
                title: 'Link Oluşturuldu ve Kopyalandı',
                message: 'Paylaşım linki panoya otomatik olarak kopyalandı.',
            });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback if clipboard write fails
            addNotification({
                type: 'success',
                title: 'Link Oluşturuldu',
                message: 'Linki kopyalamak için "Kopyala" butonuna tıklayın.',
            });
        }
    };

    const handleCopyLink = async () => {
        if (shareLink) {
            try {
                await navigator.clipboard.writeText(shareLink);
                setCopied(true);
                addNotification({
                    type: 'success',
                    title: 'Link Kopyalandı',
                    message: 'Paylaşım linki panoya kopyalandı.',
                });
                setTimeout(() => setCopied(false), 2000);
            } catch {
                addNotification({
                    type: 'error',
                    title: 'Hata',
                    message: 'Link kopyalanamadı.',
                });
            }
        }
    };

    const handleEmailShare = () => {
        if (email) {
            // In production, this would send an API request
            // For now, open mailto link
            const subject = encodeURIComponent(`Doküman Analizi: ${analysis?.document.name || 'Analiz'}`);
            const body = encodeURIComponent(
                `Merhaba,\n\nAşağıdaki doküman analizini sizinle paylaşmak istiyorum:\n\n${shareLink || window.location.href}\n\nİyi çalışmalar.`
            );
            window.open(`mailto:${email}?subject=${subject}&body=${body}`);

            addNotification({
                type: 'success',
                title: 'E-posta Açıldı',
                message: 'E-posta uygulamanız açıldı.',
            });
            setEmail('');
        }
    };

    const handleTeamShare = () => {
        selectedMembers.forEach((memberId) => {
            addShareRecipient(analysisId, memberId);
        });

        addNotification({
            type: 'success',
            title: 'Paylaşıldı',
            message: `Analiz ${selectedMembers.length} kişi ile paylaşıldı.`,
        });
        setSelectedMembers([]);
        onClose();
    };

    const toggleMember = (memberId: string) => {
        setSelectedMembers((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-dark-800 rounded-xl border border-dark-700 w-full max-w-md mx-4 animate-fade-in shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-700">
                    <h2 className="text-lg font-bold text-white">Analizi Paylaş</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-dark-700">
                    <button
                        onClick={() => setActiveTab('link')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'link'
                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Link2 className="w-4 h-4 inline mr-2" />
                        Link
                    </button>
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'email'
                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Mail className="w-4 h-4 inline mr-2" />
                        E-posta
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'team'
                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        Ekip
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {activeTab === 'link' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">
                                Paylaşım linki oluşturun ve istediğiniz kişilerle paylaşın.
                            </p>
                            {!shareLink ? (
                                <button
                                    onClick={handleGenerateLink}
                                    className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Link Oluştur
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center bg-dark-900 rounded-lg p-3 border border-dark-600">
                                        <input
                                            type="text"
                                            value={shareLink}
                                            readOnly
                                            className="flex-1 bg-transparent text-sm text-gray-300 outline-none truncate"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className={`ml-2 p-2 rounded-lg transition-colors ${copied
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-dark-700 text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Bu linki bilen herkes analizi görüntüleyebilir.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">
                                E-posta adresine analiz linkini gönderin.
                            </p>
                            <div className="flex items-center bg-dark-900 rounded-lg border border-dark-600 overflow-hidden">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ornek@email.com"
                                    className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder-gray-500"
                                />
                                <button
                                    onClick={handleEmailShare}
                                    disabled={!email}
                                    className="px-4 py-3 bg-primary text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">
                                Ekip üyeleri ile paylaşın.
                            </p>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {teamMembers.map((member) => (
                                    <label
                                        key={member.id}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedMembers.includes(member.id)
                                            ? 'bg-primary/10 border border-primary/30'
                                            : 'bg-dark-900 border border-dark-600 hover:border-dark-500'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(member.id)}
                                            onChange={() => toggleMember(member.id)}
                                            className="sr-only"
                                        />
                                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">{member.name}</p>
                                            <p className="text-xs text-gray-500">{member.role}</p>
                                        </div>
                                        {selectedMembers.includes(member.id) && (
                                            <Check className="w-5 h-5 text-primary" />
                                        )}
                                    </label>
                                ))}
                            </div>
                            {selectedMembers.length > 0 && (
                                <button
                                    onClick={handleTeamShare}
                                    className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                >
                                    {selectedMembers.length} Kişi ile Paylaş
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-dark-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareAnalysisModal;
