import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getMediaUrl } from '../../api/axios?v=1';
import { useDonation } from '../../context/DonationContext';
import useCampaignRealtime from '../../hooks/useCampaignRealtime';
import { useLanguage } from '../../context/LanguageContext';
import CampaignCard from '../../components/common/CampaignCard';

const CampaignDetail = () => {

    const { id } = useParams();
    const { openDonationModal } = useDonation();
    const [campaign, setCampaign] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampaignAndRecommendations = useCallback(async () => {
        try {
            setError(null);
            
            // Fetch the specific campaign details
            const response = await api.get(`/campaigns/${id}`);
            const campaignData = response.data;
            setCampaign(campaignData);

            // Fetch recommendations of the same category
            const allRes = await api.get('/campaigns');
            const recommendedList = allRes.data
                .filter(c => c.id !== campaignData.id && c.category_id === campaignData.category_id)
                .slice(0, 3);
            setRecommendations(recommendedList);
        } catch (err) {
            console.error("Error fetching campaign details", err);
            setError(err.response?.data?.message || "Error fetching campaign details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        setLoading(true);
        fetchCampaignAndRecommendations();
    }, [fetchCampaignAndRecommendations]);

    const handleRealtimeDetailUpdate = useCallback((eventData) => {
        if (!eventData) return;
        const targetId = String(eventData.campaign_id || eventData.id || '');
        if (!targetId || targetId === String(id)) {
            fetchCampaignAndRecommendations();
        }
    }, [id, fetchCampaignAndRecommendations]);

    // Real-time Socket.io & local updates
    useCampaignRealtime(handleRealtimeDetailUpdate);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
                <div className="skeleton-pulse h-96 w-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="skeleton-pulse h-48 w-full"></div>
                    <div className="skeleton-pulse h-48 w-full"></div>
                    <div className="skeleton-pulse h-48 w-full"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-rose-500 font-extrabold">{error}</div>;
    }

    if (!campaign) {
        return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500 font-bold">Campaign not found.</div>;
    }

    const raised = parseFloat(campaign.raised_amount || 0);
    const goal = parseFloat(campaign.goal_amount || 1);
    const progress = Math.min(100, (raised / goal) * 100);
    const remainingAmount = Math.max(0, goal - raised);
    const isCompleted = campaign.status === 'completed' || raised >= goal || (campaign.deadline && new Date(campaign.deadline) <= new Date());

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
                {/* Image Gallery */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="w-full h-[420px] bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 relative">
                        {campaign.gallery && campaign.gallery[0] ? (
                            <img src={getMediaUrl(campaign.gallery[0])} alt={campaign.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No Image Available</div>
                        )}
                        <span className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-md border ${
                            isCompleted ? 'bg-emerald-600/90 text-white border-emerald-400' : 'bg-primary-600/90 text-white border-primary-400'
                        }`}>
                            {isCompleted ? '🎉 Campaign Completed' : '📢 Active Campaign'}
                        </span>
                    </div>

                    {campaign.gallery && campaign.gallery.length > 1 && (
                        <div className="grid grid-cols-4 gap-3">
                            {campaign.gallery.slice(1).map((img, idx) => (
                                <div key={idx} className="h-24 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xs">
                                    <img src={getMediaUrl(img)} className="h-full w-full object-cover hover:scale-105 transition-transform" alt={`Gallery ${idx}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Campaign Detail Card */}
                <div className="lg:col-span-5 mt-8 lg:mt-0 card-premium p-8 flex flex-col justify-between space-y-6">
                    <div>
                        {campaign.ngo_org_name && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-3">
                                🏢 {campaign.ngo_org_name}
                            </div>
                        )}

                        <h1 className="font-display text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">{campaign.title}</h1>
                        
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                            {/* Metric Grid */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">${raised.toLocaleString()}</p>
                                    <p className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Raised</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <p className="text-xl font-black text-gray-900 dark:text-white">${goal.toLocaleString()}</p>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Goal</p>
                                </div>
                                <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">${remainingAmount.toLocaleString()}</p>
                                    <p className="text-[10px] uppercase font-bold text-indigo-800 dark:text-indigo-300">Needed</p>
                                </div>
                            </div>

                            {/* Animated Progress Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-primary-600 dark:text-primary-400">{progress.toFixed(1)}% Goal Reached</span>
                                    <span className="text-gray-400">{campaign.donor_count || 0} Donors</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-700 ${
                                            isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-500 to-indigo-600'
                                        }`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">About this cause</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{campaign.description}</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        {isCompleted ? (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-center text-xs font-bold">
                                🎉 Target reached or campaign completed. Donations are closed.
                            </div>
                        ) : (
                            <button
                                onClick={() => openDonationModal(campaign)}
                                className="btn-primary w-full py-4 text-sm uppercase tracking-wider"
                            >
                                ❤️ Donate Now
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-12 space-y-6">
                    <h2 className="font-display text-2xl font-black text-gray-900 dark:text-white">Recommended Campaigns</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {recommendations.map(item => (
                            <CampaignCard key={item.id} campaign={item} />
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default CampaignDetail;
