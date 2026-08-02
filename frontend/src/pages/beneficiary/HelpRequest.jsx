import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const HelpRequest = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [files, setFiles] = useState(null);

    const handleFileChange = (e) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        if (selectedFiles.length > 5) {
            setStatus({ type: 'error', message: 'You can only select up to 5 images.' });
            e.target.value = '';
            setFiles(null);
            return;
        }

        // Validate image type only
        for (let i = 0; i < selectedFiles.length; i++) {
            if (!selectedFiles[i].type.startsWith('image/')) {
                setStatus({ type: 'error', message: 'Only image files are allowed.' });
                e.target.value = '';
                setFiles(null);
                return;
            }
        }

        setStatus({ type: '', message: '' });
        setFiles(selectedFiles);
    };

    const onSubmit = async (data) => {
        if (files && files.length > 5) {
            setStatus({ type: 'error', message: 'You can only upload a maximum of 5 images.' });
            return;
        }
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('required_amount', data.required_amount || 0);
            formData.append('payment_method', data.payment_method || 'Bank Transfer');
            formData.append('account_holder_name', data.account_holder_name || '');
            formData.append('account_number', data.account_number || '');

            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    formData.append('documents', files[i]);
                }
            }

            await api.post('/beneficiaries/requests', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', message: 'Your request has been submitted successfully! Admin will verify and approve it.' });
            setTimeout(() => {
                navigate('/beneficiary/dashboard');
            }, 2000);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'There was a problem submitting your request.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Request Help</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Fill out the form below. Your request will be verified by the admin, and upon approval, an NGO will step forward to assist you.</p>
            
            {status.message && (
                <div className={`mb-6 p-4 rounded-md ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {status.message}
                </div>
            )}

            <form className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Request Title <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        {...register('title', { required: 'Title is required' })}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="e.g., Financial assistance required for medical treatment"
                    />
                    {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Detailed Description <span className="text-red-500">*</span></label>
                    <textarea 
                        rows="4" 
                        {...register('description', { required: 'Description is required' })} 
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Please describe your situation in detail..."
                    ></textarea>
                    {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Required Amount ($)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            {...register('required_amount', { min: { value: 0, message: 'Must be a positive number' } })}
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-4 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-2 border"
                            placeholder="0.00"
                        />
                    </div>
                    {errors.required_amount && <span className="text-xs text-red-500">{errors.required_amount.message}</span>}
                    <p className="mt-1 text-xs text-gray-400">Specify the approximate amount you need</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Upload Documents</label>
                    <p className="text-xs text-gray-400 mb-1">Upload images of ID card, Medical reports, etc. (Max 5 images)</p>
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                </div>

                {/* Beneficiary Preferred Payment Information */}
                <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>💳</span> Preferred Payment & Disbursement Information
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Specify how you wish to receive raised funds once the campaign is complete.
                    </p>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Payment Method <span className="text-red-500">*</span></label>
                        <select
                            {...register('payment_method', { required: 'Please select a payment method' })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-primary-500 bg-white dark:bg-gray-800"
                        >
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="bKash">bKash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Rocket">Rocket</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Account Holder Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                {...register('account_holder_name', { required: 'Account holder name is required' })}
                                placeholder="e.g. Md. Rahman"
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-primary-500 bg-white dark:bg-gray-800"
                            />
                            {errors.account_holder_name && <span className="text-xs text-red-500">{errors.account_holder_name.message}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Account Number / Mobile No <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                {...register('account_number', { required: 'Account or mobile number is required' })}
                                placeholder="Bank AC / Mobile Wallet No"
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-primary-500 bg-white dark:bg-gray-800"
                            />
                            {errors.account_number && <span className="text-xs text-red-500">{errors.account_number.message}</span>}
                        </div>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-700">
                    <strong>📋 Note:</strong> Once your request is submitted, the admin will verify it. If approved, an NGO will step forward to help you and create a fundraising campaign on your behalf.
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="submit" disabled={loading} className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HelpRequest;
