import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/axios';

const ResetPassword = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const token = searchParams.get('token');
    const password = watch("password");

    const onSubmit = async (data) => {
        if (!token) {
            setStatus({ type: 'error', message: t('common.error') });
            return;
        }
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await api.post('/auth/reset-password', { token, newPassword: data.password });
            setStatus({ type: 'success', message: t('profile.passwordUpdated') });
            setTimeout(() => navigate('/login'), 2000);
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
                    <h2 className="font-display text-3xl font-black text-gray-900 dark:text-white mt-1">{t('auth.resetTitle')}</h2>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('auth.resetSub')}</p>
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

                <form className="mt-4 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">{t('auth.newPassword')}</label>
                            <input
                                type="password"
                                {...register('password', { 
                                    required: t('auth.passwordRequired'),
                                    minLength: { value: 6, message: t('auth.passwordMin') }
                                })}
                                className="w-full mt-1"
                                placeholder="••••••••"
                            />
                            {errors.password && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.password.message}</span>}
                        </div>
                        
                        <div>
                            <label className="form-label">{t('auth.confirmNewPassword')}</label>
                            <input
                                type="password"
                                {...register('confirmPassword', { 
                                    validate: value => value === password || t('auth.passwordMatch')
                                })}
                                className="w-full mt-1"
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.confirmPassword.message}</span>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token}
                        className="btn-primary w-full py-4 text-xs uppercase tracking-wider disabled:opacity-50"
                        id="reset-password-btn"
                    >
                        {loading ? t('auth.resetting') : t('auth.resetBtn')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
