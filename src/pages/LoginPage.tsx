import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Clear error when input changes
    useEffect(() => {
        if (error) {
            clearError();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await login(email, password);
            navigate('/', { replace: true });
        } catch {
            // Error is handled by the store
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                        <span className="text-white text-2xl font-bold">M</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Metrika</h1>
                    <p className="text-gray-400">Proje yönetim platformuna hoş geldiniz</p>
                </div>

                {/* Login Form */}
                <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-400 text-sm font-medium">Giriş Başarısız</p>
                                    <p className="text-red-400/80 text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                E-posta
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ornek@metrika.com"
                                    required
                                    className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Şifre
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Giriş Yap
                                </>
                            )}
                        </button>
                    </form>

                    {/* Test Credentials Info */}
                    <div className="mt-6 pt-6 border-t border-dark-700">
                        <p className="text-gray-500 text-xs text-center mb-3">Test için kullanabilirsiniz:</p>
                        <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                            <p className="text-gray-400 text-sm">
                                <span className="text-gray-500">E-posta:</span>{' '}
                                <code className="text-primary">admin@metrika.com</code>
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                <span className="text-gray-500">Şifre:</span>{' '}
                                <code className="text-primary">123456</code>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    © 2024 Metrika. Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
