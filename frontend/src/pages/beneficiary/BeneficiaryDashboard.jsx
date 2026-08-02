import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios?v=1';
import { format } from 'date-fns';
import useCampaignRealtime from '../../hooks/useCampaignRealtime';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_CONFIG = {
    pending: { labelKey: 'beneficiary.status.pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    under_review: { labelKey: 'beneficiary.status.under_review', color: 'bg-blue-100 text-blue-800', icon: '🔍' },
    waiting_for_ngo: { labelKey: 'beneficiary.status.pending', color: 'bg-purple-100 text-purple-800', icon: '🏢' },
    assigned: { labelKey: 'beneficiary.status.approved', color: 'bg-indigo-100 text-indigo-800', icon: '✅' },
    campaign_active: { labelKey: 'beneficiary.status.approved', color: 'bg-green-100 text-green-800', icon: '📢' },
    rejected: { labelKey: 'beneficiary.status.rejected', color: 'bg-red-100 text-red-800', icon: '❌' },
    fulfilled: { labelKey: 'beneficiary.status.approved', color: 'bg-emerald-100 text-emerald-800', icon: '🎉' },
};

const BeneficiaryDashboard = () => {
    const { t } = useLanguage();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const reqRes = await api.get('/beneficiaries/requests');
            setRequests(reqRes.data || []);
        } catch (error) {
            console.error("Error fetching beneficiary dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);

    // Socket Realtime sync
    useCampaignRealtime(fetchData);

    if (loading) return <div className="p-12 text-center text-gray-500 font-medium">{t('common.loading')}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('beneficiary.title')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('beneficiary.myRequests')}</p>
                </div>
                <Link to="/beneficiary/request" className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-xs text-white bg-primary-600 hover:bg-primary-700">
                    + {t('beneficiary.submitBtn')}
                </Link>
            </div>

            {/* Help Requests Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('beneficiary.myRequests')}</h2>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                        <span key={key} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${val.color}`}>
                            {val.icon} {t(val.labelKey)}
                        </span>
                    ))}
                </div>

                {requests.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs p-12 text-center border border-gray-100 dark:border-gray-700">
                        <div className="text-5xl mb-4">📝</div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{t('beneficiary.noRequests')}</p>
                        <Link to="/beneficiary/request" className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700">
                            {t('beneficiary.submitBtn')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => {
                            const cfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
                            return (
                                <div key={request.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="px-6 py-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                                        {request.title}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                        {cfg.icon} {t(cfg.labelKey)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{request.description}</p>
                                                
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    {request.required_amount > 0 && (
                                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                                            <span className="font-bold text-emerald-600">${parseFloat(request.required_amount).toLocaleString()}</span>
                                                            <span className="text-gray-400">Required</span>
                                                        </div>
                                                    )}
                                                    {request.assigned_ngo_org && (
                                                        <div className="flex items-center gap-1 text-indigo-600 font-semibold">
                                                            <span>🏢</span>
                                                            <span>{request.assigned_ngo_org}</span>
                                                        </div>
                                                    )}
                                                    <div className="text-gray-400 text-xs">
                                                        {t('beneficiary.submitBtn')}: {format(new Date(request.created_at), 'dd MMM yyyy')}
                                                    </div>
                                                </div>

                                                {request.admin_note && (
                                                    <div className="mt-3 bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-gray-300 border-l-4 border-primary-400">
                                                        <strong>Admin Note:</strong> {request.admin_note}
                                                    </div>
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
        </div>
    );
};

export default BeneficiaryDashboard;
