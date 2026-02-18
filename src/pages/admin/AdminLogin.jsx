import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase/config';
import { Button } from '../../components/common/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t, lang } = useLanguage();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin');
        } catch (err) {
            console.error("Login Error:", err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError(t('admin.invalidCreds'));
            } else {
                setError(err.message || t('common.noResults'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4 text-start">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl border border-white/50 animate-fade-in">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 premium-gradient rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary-200">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('admin.loginTitle')}</h1>
                    <p className="text-slate-500">{t('admin.loginDesc')}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">{t('admin.emailLabel')}</label>
                        <div className="relative">
                            <Mail className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                            <input
                                type="email"
                                required
                                className={`w-full ${lang === 'ar' ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-slate-800`}
                                placeholder="admin@hadesign.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">{t('admin.passwordLabel')}</label>
                        <div className="relative">
                            <Lock className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                            <input
                                type="password"
                                required
                                className={`w-full ${lang === 'ar' ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-slate-800`}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        className="w-full py-4 text-base font-bold shadow-lg shadow-primary-200/50 font-black uppercase tracking-widest"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? t('admin.authenticating') : t('admin.signIn')}
                    </Button>
                </form>

                <p className="mt-8 text-center text-slate-400 text-sm">
                    {t('admin.forgot')}
                </p>
            </div>
        </div>
    );
}
