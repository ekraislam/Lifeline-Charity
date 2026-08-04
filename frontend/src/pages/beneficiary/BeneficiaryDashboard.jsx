import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios?v=1';
import { format } from 'date-fns';
import useCampaignRealtime from '../../hooks/useCampaignRealtime';
import { useLanguage } from '../../context/LanguageContext';
import LiveActivityTimeline from '../../components/common/LiveActivityTimeline';


const STATUS_CONFIG = {
    pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300', icon: '⏳' },
    under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', icon: '🔍' },
    waiting_for_ngo: { label: 'Waiting for NGO', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300', icon: '🏢' },
    assigned: { label: 'Accepted by NGO', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300', icon: '✅' },
    campaign_active: { label: 'Campaign Active', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', icon: '📢' },
    withdrawn: { label: 'Campaign Withdrawn', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', icon: '🚩' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300', icon: '❌' },
    fulfilled: { label: 'Fulfilled', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', icon: '🎉' },
};



const BeneficiaryDashboard = () => {
    const { t } = useLanguage();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);


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

    const handleDeleteRequest = async (id) => {
        if (!window.confirm("Are you sure you want to delete this rejected request? This action cannot be undone.")) return;
        try {
            setDeletingId(id);
            await api.delete(`/beneficiaries/requests/${id}`);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete help request');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="skeleton-pulse h-28 w-full rounded-[22px]" />
            <div className="skeleton-pulse h-64 w-full rounded-[22px]" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t('beneficiary.title')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('beneficiary.myRequests')}</p>
                </div>
                <Link
                    to="/beneficiary/request"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-primary-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <span>➕</span> {t('beneficiary.submitBtn')}
                </Link>
            </div>

            {/* Help Requests Section */}
            <div className="space-y-6">
                {/* Status Legend Pills */}
                <div className="bg-white dark:bg-gray-900 rounded-[20px] p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                        <span key={key} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs ${val.color}`}>
                            {val.icon} {val.label}
                        </span>
                    ))}
                </div>

                {requests.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-[22px] p-12 text-center border border-gray-100 dark:border-gray-800 shadow-md space-y-3">
                        <div className="text-5xl">📝</div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('beneficiary.noRequests')}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Submit your financial, medical, or emergency assistance application to connect with verified NGOs.</p>
                        <Link to="/beneficiary/request" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:scale-105 transition-all">
                            {t('beneficiary.submitBtn')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => {
                            const cfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
                            return (
                                <div key={request.id} className="group relative rounded-[22px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-sky-500 transition-colors">
                                                    {request.title}
                                                </h3>
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${cfg.color}`}>
                                                    {cfg.icon} {cfg.label}
                                                </span>

                                            </div>

                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{request.description}</p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-2">
                                                {request.required_amount > 0 && (
                                                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                                        <span className="text-gray-400 font-normal">Requested Amount:</span>
                                                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">${parseFloat(request.required_amount).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {request.assigned_ngo_org && (
                                                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px]">
                                                        <span>🏢</span>
                                                        <span>{request.assigned_ngo_org}</span>
                                                    </div>
                                                )}
                                                <div className="text-gray-400 text-[11px] font-normal ml-auto">
                                                    Submitted: {format(new Date(request.created_at), 'dd MMM yyyy')}
                                                </div>
                                            </div>

                                            {request.admin_note && (
                                                <div className="mt-3 bg-sky-50/70 dark:bg-sky-950/40 rounded-xl px-4 py-2.5 text-xs text-sky-900 dark:text-sky-200 border-l-4 border-sky-500">
                                                    <strong>Admin Note:</strong> {request.admin_note}
                                                </div>
                                            )}
                                            {(request.status === 'rejected' || request.status === 'withdrawn' || (request.admin_note && request.admin_note.includes('deleted by Admin'))) && (
                                                 <div className="mt-3 flex justify-end">
                                                     <button
                                                         onClick={() => handleDeleteRequest(request.id)}
                                                         disabled={deletingId === request.id}
                                                         className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 hover:scale-[1.02] active:scale-[0.98] text-rose-600 dark:text-rose-400 font-extrabold text-xs transition-all border border-rose-500/20 cursor-pointer shadow-xs"
                                                     >
                                                         <span>🗑️</span>
                                                         <span>{deletingId === request.id ? 'Deleting...' : 'Delete Request'}</span>
                                                     </button>
                                                 </div>
                                             )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Live Activity Stream */}
            <LiveActivityTimeline

                title="Beneficiary Request Activity Stream"
                onRefresh={fetchData}
                activities={
                    requests.map((req, i) => ({
                        id: `ben-req-${i}`,
                        icon: req.status === 'fulfilled' ? '🎉' : req.status === 'rejected' ? '❌' : req.status === 'withdrawn' ? '🚩' : '📋',
                        type: req.status === 'fulfilled' ? 'success' : req.status === 'rejected' ? 'critical' : req.status === 'withdrawn' ? 'warning' : 'warning',
                        user: req.title || 'Help Request',
                        role: 'Beneficiary',
                        title: `Application "${req.title}"`,
                        description: `Status: ${STATUS_CONFIG[req.status]?.label || req.status} | Amount: $${parseFloat(req.required_amount || 0).toLocaleString()}`,
                        timestamp: req.created_at || new Date()
                    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                }

            />
        </div>
    );
};

export default BeneficiaryDashboard;

