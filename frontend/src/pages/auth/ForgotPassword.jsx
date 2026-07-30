import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await api.post('/auth/forgot-password', data);
            setStatus({ type: 'success', message: 'Password reset link sent to your email.' });
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to send reset link.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">Reset Password</h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
                        Enter your email to receive a reset link
                    </p>
                </div>
                
                {status.message && (
                    <div className={`p-3 text-sm rounded-md ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.message}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email address</label>
                        <input
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mt-1"
                            placeholder="Email address"
                        />
                        {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>
                
                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
