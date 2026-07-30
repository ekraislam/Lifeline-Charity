import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const Donate = () => {
    const { id } = useParams(); // Campaign ID
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await api.get(`/campaigns/${id}`);
                setCampaign(response.data);
            } catch (error) {
                console.error("Error fetching campaign details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id]);

    const onSubmit = async (data) => {
        setSubmitting(true);
        setStatus({ type: '', message: '' });
        try {
            const res = await api.post('/donations', {
                campaign_id: id,
                amount: parseFloat(data.amount),
                is_anonymous: data.is_anonymous
            });
            
            // If there's a payment URL (mock callback), trigger it to complete the payment
            if (res.data.payment_url) {
                // We use fetch here because the payment_url is an absolute URL
                await fetch(res.data.payment_url);
            }

            setStatus({ type: 'success', message: 'Thank you for your donation!' });
            setTimeout(() => {
                navigate(`/campaigns/${id}`);
            }, 2000);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to process donation.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Loading campaign details...</div>;
    if (!campaign) return <div className="p-12 text-center text-red-500">Campaign not found.</div>;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-100 relative">
                {/* Close/Cancel Button */}
                <button 
                    type="button"
                    onClick={() => navigate(`/campaigns/${id}`)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 text-2xl font-bold focus:outline-none"
                    title="Cancel donation and return to campaign"
                >
                    &times;
                </button>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Make a Donation</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">You are donating to: <span className="font-semibold text-primary-600">{campaign.title}</span></p>
                </div>

                {status.message && (
                    <div className={`mb-6 p-4 rounded-md ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.message}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Amount ($)</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                {...register('amount', { 
                                    required: 'Amount is required', 
                                    min: { value: 1, message: 'Minimum donation is $1' } 
                                })}
                                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-3"
                                placeholder="0.00"
                            />
                        </div>
                        {errors.amount && <span className="text-xs text-red-500">{errors.amount.message}</span>}
                    </div>

                    <div className="flex items-center">
                        <input
                            id="is_anonymous"
                            type="checkbox"
                            {...register('is_anonymous')}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                        <label htmlFor="is_anonymous" className="ml-2 block text-sm text-gray-900 dark:text-white">
                            Make this donation anonymous
                        </label>
                    </div>

                    {/* Mock Payment Information */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Details (Mock)</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Card Number</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 sm:text-sm bg-gray-50 dark:bg-gray-900" value="**** **** **** 4242" disabled />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Expiry</label>
                                    <input type="text" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 sm:text-sm bg-gray-50 dark:bg-gray-900" value="12/25" disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">CVC</label>
                                    <input type="text" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 sm:text-sm bg-gray-50 dark:bg-gray-900" value="***" disabled />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {submitting ? 'Processing...' : 'Complete Donation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Donate;
