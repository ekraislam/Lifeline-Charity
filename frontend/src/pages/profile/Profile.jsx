import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api, { getMediaUrl } from '../../api/axios?v=1';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Profile = () => {
    const { user, login } = useContext(AuthContext);
    const { t } = useLanguage();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();
    
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/profile');
                setProfileData(response.data);
                setValue('name', response.data.name);
                setValue('email', response.data.email);
                setValue('address', response.data.address);
                setValue('phone', response.data.phone);
                setPhotoPreview(response.data.avatar ? getMediaUrl(response.data.avatar) : null);
            } catch (error) {
                console.error('Failed to load profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [setValue]);

    const onUpdateProfile = async (data) => {
        setStatus({ type: '', message: '' });
        try {
            await api.put('/profile', data);
            setStatus({ type: 'success', message: 'Profile updated successfully.' });
            
            const updatedUser = { ...user, name: data.name, email: data.email };
            login(updatedUser, localStorage.getItem('token'));
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to update profile.' });
        }
    };

    const onChangePassword = async (data) => {
        setStatus({ type: '', message: '' });
        try {
            await api.put('/profile/change-password', { oldPassword: data.oldPassword, newPassword: data.newPassword });
            setStatus({ type: 'success', message: 'Password changed successfully.' });
            resetPassword();
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to change password.' });
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPhotoPreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await api.post('/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', message: 'Profile photo updated successfully.' });
            
            const updatedUser = { ...user, avatar: response.data.avatarUrl };
            login(updatedUser, localStorage.getItem('token'));
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to upload photo.' });
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500 font-medium">Loading account settings...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div>
                <span className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">Account Preferences</span>
                <h1 className="font-display text-3xl font-black text-gray-900 dark:text-white mt-1">Profile & Security Settings</h1>
            </div>

            {status.message && (
                <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                    status.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}>
                    <span>{status.type === 'success' ? '✓' : '⚠️'}</span>
                    <span>{status.message}</span>
                </div>
            )}

            {/* Profile Avatar Card */}
            <div className="card-premium p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-md">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-black flex items-center justify-center text-3xl">
                                {(user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="font-display text-xl font-black text-gray-900 dark:text-white">{user?.name}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 mt-2">
                            {user?.role}
                        </span>
                    </div>
                </div>

                <label className="btn-secondary py-2.5 px-4 text-xs cursor-pointer">
                    <span>📷 Change Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
            </div>

            {/* Personal Details Form */}
            <div className="card-premium p-6 sm:p-8 space-y-6">
                <h2 className="font-display text-xl font-black text-gray-900 dark:text-white">Personal Information</h2>
                <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="form-label">Full Name</label>
                            <input type="text" {...register('name', { required: 'Name is required' })} className="w-full mt-1" />
                            {errors.name && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.name.message}</span>}
                        </div>
                        <div>
                            <label className="form-label">Email Address</label>
                            <input type="email" {...register('email', { required: 'Email is required' })} className="w-full mt-1" />
                            {errors.email && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.email.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="form-label">Phone Number</label>
                            <input type="text" {...register('phone')} className="w-full mt-1" placeholder="+1 (555) 000-0000" />
                        </div>
                        <div>
                            <label className="form-label">Address</label>
                            <input type="text" {...register('address')} className="w-full mt-1" placeholder="City, Country" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="btn-primary py-3 px-6 text-xs uppercase tracking-wider">
                            Save Profile Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* Password Change Form */}
            <div className="card-premium p-6 sm:p-8 space-y-6">
                <h2 className="font-display text-xl font-black text-gray-900 dark:text-white">Security & Password</h2>
                <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4 max-w-md">
                    <div>
                        <label className="form-label">Current Password</label>
                        <div className="relative mt-1">
                            <input type={showOldPassword ? 'text' : 'password'} {...registerPassword('oldPassword', { required: 'Required' })} className="w-full pr-10" />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                            >
                                {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {passwordErrors.oldPassword && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{passwordErrors.oldPassword.message}</span>}
                    </div>
                    <div>
                        <label className="form-label">New Password</label>
                        <div className="relative mt-1">
                            <input type={showNewPassword ? 'text' : 'password'} {...registerPassword('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} className="w-full pr-10" />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                            >
                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {passwordErrors.newPassword && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{passwordErrors.newPassword.message}</span>}
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="btn-secondary py-3 px-6 text-xs uppercase tracking-wider">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
