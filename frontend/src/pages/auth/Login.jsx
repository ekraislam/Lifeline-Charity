import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login, user } = useContext(AuthContext);
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const onSubmit = async (data) => {
        setLoading(true);
        setApiError('');
        try {
            const response = await api.post('/auth/login', data);
            login(response.data.user, response.data.accessToken);
            navigate('/dashboard');
        } catch (error) {
            setApiError(error.response?.data?.message || t('auth.loginFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 card-premium p-8 sm:p-10">
                <div className="text-center">
                    <span className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">{t('auth.loginBadge')}</span>
                    <h2 className="font-display text-3xl font-black text-gray-900 dark:text-white mt-1">{t('auth.welcomeBack')}</h2>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {t('auth.loginSub')}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {apiError && (
                        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{apiError}</span>
                        </div>
                    )}

                    <div className="space-y-4">
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

                        <div>
                            <label className="form-label">{t('auth.password')}</label>
                            <div className="relative mt-1">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password', { required: t('auth.passwordRequired') })}
                                    className="w-full pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.password && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.password.message}</span>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link to="/forgot-password" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                            {t('auth.forgotPassword')}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-xs uppercase tracking-wider disabled:opacity-50"
                        id="login-submit-btn"
                    >
                        {loading ? t('auth.signingIn') : t('auth.signIn')}
                    </button>
                </form>

                <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {t('auth.noAccount')}{' '}
                        <Link to="/register" className="font-extrabold text-primary-600 dark:text-primary-400 hover:underline">
                            {t('auth.createAccount')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
