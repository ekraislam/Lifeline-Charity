import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../context/AuthContext';
import api, { getMediaUrl } from '../../api/axios?v=1';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Profile = () => {
    const { user, login } = useContext(AuthContext);
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
            
            // Update user context with new name and email
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
            setStatus({ type: 'success', message: 'Profile photo updated.' });
            
            // Optionally update user context if photo URL is stored there
            const updatedUser = { ...user, avatar: response.data.avatarUrl };
            login(updatedUser, localStorage.getItem('token')); // refresh user data in context
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to upload photo.' });
        }
    };

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h1>

            {status.message && (
                <div className={`mb-6 p-4 rounded-md ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {status.message}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Profile Picture</h2>
                    <div className="mt-4 flex items-center">
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </div>
                        <div className="ml-5">
                            <label className="cursor-pointer bg-white dark:bg-gray-800 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                <span>Change</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h2>
                    <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Username</label>
                                <input type="text" {...register('name', { required: 'Username is required' })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                                <input type="email" {...register('email', { required: 'Email is required' })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Phone Number</label>
                                <input type="text" {...register('phone')} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Address</label>
                                <input type="text" {...register('address')} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="bg-primary-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                Save Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h2>
                    <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Current Password</label>
                            <div className="relative mt-1">
                                <input type={showOldPassword ? 'text' : 'password'} {...registerPassword('oldPassword', { required: 'Required' })} className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 focus:outline-none focus:text-primary-600"
                                >
                                    {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {passwordErrors.oldPassword && <span className="text-xs text-red-500">{passwordErrors.oldPassword.message}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">New Password</label>
                            <div className="relative mt-1">
                                <input type={showNewPassword ? 'text' : 'password'} {...registerPassword('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 focus:outline-none focus:text-primary-600"
                                >
                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {passwordErrors.newPassword && <span className="text-xs text-red-500">{passwordErrors.newPassword.message}</span>}
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
