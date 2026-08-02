import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { getMediaUrl } from '../../api/axios?v=1';
import { useDonation } from '../../context/DonationContext';
import { useLanguage } from '../../context/LanguageContext';
import useCampaignRealtime from '../../hooks/useCampaignRealtime';

const CampaignList = () => {
    const { openDonationModal } = useDonation();
    const { t } = useLanguage();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchCampaigns = useCallback(async () => {
        try {
            const response = await api.get('/campaigns');
            setCampaigns(response.data || []);
        } catch (error) {
            console.error("Error fetching campaigns", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchCampaigns();
    }, [fetchCampaigns]);

    useCampaignRealtime(fetchCampaigns);

    const filteredCampaigns = campaigns.filter(c => (c.title || '').toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
                <span className="text-xs font-black tracking-widest uppercase text-primary-600 dark:text-primary-400">{t('campaigns.badge')}</span>
                <h1 className="font-display text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">{t('campaigns.title')}</h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                    {t('campaigns.subtitle')}
                </p>
            </div>

            {/* Search Filter Bar */}
            <div className="max-w-xl mx-auto relative">
                <input
                    type="text"
                    placeholder={t('campaigns.searchPlaceholder')}
                    className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-primary-500/10 outline-none shadow-sm transition-all"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    id="campaign-search"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="skeleton-pulse h-96 w-full"></div>
                    ))}
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="card-premium p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                    <div className="text-5xl mb-3">🔎</div>
                    {t('campaigns.noResults')}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCampaigns.map(campaign => {
                        const raised = parseFloat(campaign.raised_amount || 0);
                        const goal = parseFloat(campaign.goal_amount || 1);
                        const progress = Math.min(100, (raised / goal) * 100);
                        const isCompleted = campaign.status === 'completed' || campaign.is_completed || raised >= goal;

                        return (
                            <div key={campaign.id} className="card-premium overflow-hidden flex flex-col group">
                                <div className="h-52 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                    {campaign.gallery && campaign.gallery[0] ? (
                                        <img src={getMediaUrl(campaign.gallery[0])} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-xs">{t('campaigns.noImage')}</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                    
                                    <span className={`absolute top-4 right-4 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md backdrop-blur-xs border ${
                                        isCompleted ? 'bg-emerald-500/90 text-white border-emerald-300' : 'bg-primary-600/90 text-white border-primary-300'
                                    }`}>
                                        {isCompleted ? t('campaigns.completed') : t('campaigns.running')}
                                    </span>
                                </div>

                                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                                    <div>
                                        <h3 className="font-display text-lg font-black text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">{campaign.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">{campaign.description}</p>
                                    </div>

                                    <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-black text-primary-600 dark:text-primary-400 text-sm">${raised.toLocaleString()}</span>
                                            <span className="text-gray-400 font-medium">{t('campaigns.goal')}: ${goal.toLocaleString()}</span>
                                        </div>

                                        {/* Animated Progress Bar */}
                                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-700 ${
                                                    isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-500 to-indigo-600'
                                                }`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-1">
                                            <Link to={`/campaigns/${campaign.id}`} className="btn-secondary py-2.5 text-xs" id={`campaign-detail-${campaign.id}`}>
                                                {t('campaigns.details')}
                                            </Link>
                                            {isCompleted ? (
                                                <button disabled className="btn-secondary py-2.5 text-xs opacity-50 cursor-not-allowed">
                                                    {t('campaigns.completed')}
                                                </button>
                                            ) : (
                                                <button onClick={() => openDonationModal(campaign)} className="btn-primary py-2.5 text-xs" id={`campaign-donate-${campaign.id}`}>
                                                    {t('campaigns.donateNow')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CampaignList;
