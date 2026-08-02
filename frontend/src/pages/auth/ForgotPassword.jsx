import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/axios';

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { t } = useLanguage();
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await api.post('/auth/forgot-password', data);
            setStatus({ type: 'success', message: t('auth.sendLink') + ' ✓' });
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || t('common.failed') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 card-premium p-8 sm:p-10">
                <div className="text-center">
                    <span className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">{t('auth.loginBadge')}</span>
                    <h2 className="font-display text-3xl font-black text-gray-900 dark:text-white mt-1">{t('auth.forgotTitle')}</h2>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {t('auth.forgotSub')}
                    </p>
                </div>
                
                {status.message && (
                    <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                        status.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    }`}>
                        <span>{status.type === 'success' ? '✅' : '⚠️'}</span>
                        <span>{status.message}</span>
                    </div>
                )}

                <form className="mt-4 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="form-label">{t('auth.email')}</label>
                        <input
                            type="email"
                            {...register('email', { required: t('auth.emailRequired') })}
                            className="w-full mt-1"
                            placeholder="name@example.com"
                        />
                        {errors.email && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.email.message}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-xs uppercase tracking-wider disabled:opacity-50"
                        id="forgot-password-btn"
                    >
                        {loading ? t('auth.sending') : t('auth.sendLink')}
                    </button>
                </form>
                
                <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Link to="/login" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                        ← {t('auth.backToLogin')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
