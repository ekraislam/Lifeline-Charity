import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios?v=1';
import { useLanguage } from '../../context/LanguageContext';
import useCampaignRealtime from '../../hooks/useCampaignRealtime';
import CampaignCard from '../../components/common/CampaignCard';

const CampaignList = () => {
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="skeleton-pulse h-[450px] w-full rounded-[22px]" />
                    ))}
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="card-premium p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                    <div className="text-5xl mb-3">🔎</div>
                    {t('campaigns.noResults')}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampaignList;
