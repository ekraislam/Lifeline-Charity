import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CreateCampaign = () => {
    const [searchParams] = useSearchParams();
    const helpRequestId = searchParams.get('help_request_id');
    const prefillTitle = searchParams.get('title') || '';
    const prefillAmount = searchParams.get('amount') || '';

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            title: prefillTitle ? `Campaign: ${prefillTitle}` : '',
            target_amount: prefillAmount || '',
        }
    });
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
            const payload = {
                title: data.title,
                description: data.description,
                category_id: data.category_id,
                goal_amount: data.target_amount,
                deadline: data.end_date
            };

            // If creating for a beneficiary
            if (helpRequestId) {
                payload.help_request_id = parseInt(helpRequestId);
            }

            const response = await api.post('/campaigns', payload);
            const campaignId = response.data.campaignId;

            // Upload gallery if files exist
            if (files && files.length > 0) {
                const formData = new FormData();
                for (let i = 0; i < files.length; i++) {
                    formData.append('images', files[i]);
                }
                await api.post(`/campaigns/${campaignId}/gallery`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setStatus({ type: 'success', message: 'Campaign created successfully! Awaiting admin approval.' });
            setTimeout(() => {
                navigate(helpRequestId ? '/ngo/dashboard' : '/dashboard');
            }, 2000);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to create campaign.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
            {helpRequestId && (
                <div className="mb-6 p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm">
                    <strong>📋 Beneficiary Campaign:</strong> This campaign is being created for Help Request #{helpRequestId}. 
                    The campaign will be linked to the assigned beneficiary.
                </div>
            )}
            
            {status.message && (
                <div className={`mb-6 p-4 rounded-md ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {status.message}
                </div>
            )}

            <form className="space-y-6 bg-white p-6 rounded-lg shadow" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Campaign Title</label>
                    <input type="text" {...register('title', { required: 'Title is required' })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea rows="4" {...register('description', { required: 'Description is required' })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"></textarea>
                    {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select {...register('category_id', { required: 'Category is required' })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                            <option value="">Select a category</option>
                            <option value="1">Education</option>
                            <option value="2">Health</option>
                            <option value="3">Disaster Relief</option>
                        </select>
                        {errors.category_id && <span className="text-xs text-red-500">{errors.category_id.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Target Amount ($)</label>
                        <input type="number" step="0.01" {...register('target_amount', { required: 'Required', min: 1 })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        {errors.target_amount && <span className="text-xs text-red-500">{errors.target_amount.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" {...register('end_date', { required: 'End date is required' })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        {errors.end_date && <span className="text-xs text-red-500">{errors.end_date.message}</span>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Gallery Images (Max 5)</label>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                </div>

                <div className="pt-4 border-t border-gray-200 flex gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {loading ? 'Submitting...' : 'Create Campaign'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCampaign;
