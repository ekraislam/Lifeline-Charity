import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const HelpRequest = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const onSubmit = async (data) => {
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await api.post('/beneficiaries/request', data);
            setStatus({ type: 'success', message: 'Help request submitted successfully!' });
            setTimeout(() => {
                navigate('/beneficiary/dashboard');
            }, 2000);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to submit request.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Request Help</h1>
            <p className="text-gray-600 mb-8">Please fill out the form below to request assistance from our network of NGOs and volunteers.</p>
            
            {status.message && (
                <div className={`mb-6 p-4 rounded-md ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {status.message}
                </div>
            )}

            <form className="space-y-6 bg-white p-6 rounded-lg shadow" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Type of Assistance Needed</label>
                    <select {...register('type', { required: 'Type is required' })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                        <option value="">Select an option</option>
                        <option value="financial">Financial Assistance</option>
                        <option value="medical">Medical Help</option>
                        <option value="food">Food & Supplies</option>
                        <option value="shelter">Shelter</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.type && <span className="text-xs text-red-500">{errors.type.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
                    <textarea 
                        rows="4" 
                        {...register('description', { required: 'Description is required' })} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Please describe your situation in detail..."
                    ></textarea>
                    {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Supporting Documents (Optional)</label>
                    {/* Simplified for UI, typically would handle file uploads */}
                    <input type="file" multiple className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <button type="submit" disabled={loading} className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HelpRequest;
