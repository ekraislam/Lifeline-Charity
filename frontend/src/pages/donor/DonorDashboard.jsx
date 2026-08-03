import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/axios?v=1';

const DonorDashboard = () => {
    const { user } = useContext(AuthContext);
    const { t } = useLanguage();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const res = await api.get('/donations/history');
                setDonations(res.data || []);
            } catch (err) {
                console.error("Failed to fetch donor history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDonations();
    }, []);

    const totalDonated = donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-slate-900 via-indigo-950 to-sky-950 p-6 sm:p-10 text-white shadow-xl">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/10 text-sky-300 backdrop-blur-md border border-white/15">
                            🌟 Donor & Supporter Portal
                        </span>
                        <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tight text-white">
                            {t('dashboard.welcome')}, {user?.name || 'Supporter'}!
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
                            Thank you for making a real impact. Track your contributions, supported causes, and download official donation receipts.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[140px]">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-300 block">Total Donated</span>
                            <span className="text-2xl font-black text-emerald-400">${totalDonated.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <Link
                            to="/campaigns"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-500 hover:scale-105 shadow-lg shadow-sky-500/25 transition-all text-center"
                        >
                            ❤️ Donate Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Action Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-900 p-6 border-t-4 border-sky-500 border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center text-xl mb-3">
                            📢
                        </div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">{t('campaigns.title')}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('campaigns.subtitle')}</p>
                    </div>
                    <Link to="/campaigns" className="mt-4 text-xs font-black text-sky-600 dark:text-sky-400 group-hover:underline flex items-center gap-1">
                        {t('home.exploreCampaigns')} &rarr;
                    </Link>
                </div>

                <div className="group relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-900 p-6 border-t-4 border-emerald-500 border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center text-xl mb-3">
                            💳
                        </div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">{t('donor.donationHistory')}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('donor.downloadReceipt')}</p>
                    </div>
                    <Link to="/donations/history" className="mt-4 text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                        {t('dashboard.viewAll')} &rarr;
                    </Link>
                </div>

                <div className="group relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-900 p-6 border-t-4 border-amber-500 border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center text-xl mb-3">
                            👤
                        </div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">{t('profile.title')}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('profile.personalInfo')}</p>
                    </div>
                    <Link to="/profile" className="mt-4 text-xs font-black text-amber-600 dark:text-amber-400 group-hover:underline flex items-center gap-1">
                        {t('profile.saveChanges')} &rarr;
                    </Link>
                </div>
            </div>

            {/* Supported Campaigns & History */}
            <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 sm:p-8 shadow-md border border-gray-100 dark:border-gray-800 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <span>🎁</span> My Giving History
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Recent transactions and financial contribution receipts
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500 font-medium">{t('common.loading')}</div>
                ) : donations.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 font-medium space-y-3">
                        <div className="text-5xl">❤️</div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">No donations yet</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Support verified campaigns to see your donation progress and tax-deductible receipts here.</p>
                        <Link to="/campaigns" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:scale-105 transition-all">
                            Browse Campaigns
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-black uppercase text-gray-400">
                                <tr>
                                    <th className="py-3.5 px-4 text-left">{t('donor.table.campaign')}</th>
                                    <th className="py-3.5 px-4 text-right">{t('donor.table.amount')}</th>
                                    <th className="py-3.5 px-4 text-right">{t('campaigns.goal')}</th>
                                    <th className="py-3.5 px-4 text-center">{t('donor.table.status')}</th>
                                    <th className="py-3.5 px-4 text-right">{t('donor.table.date')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {donations.map(d => {
                                    const isCompleted = d.campaign_status === 'completed' || parseFloat(d.raised_amount || 0) >= parseFloat(d.goal_amount || 1);
                                    return (
                                        <tr key={d.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                                            <td className="py-4 px-4 font-bold text-gray-900 dark:text-white max-w-xs truncate">{d.campaign_title}</td>
                                            <td className="py-4 px-4 text-right font-black text-sky-600 dark:text-sky-400">${parseFloat(d.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                            <td className="py-4 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                ${parseFloat(d.raised_amount || 0).toLocaleString()} / ${parseFloat(d.goal_amount || 0).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                                }`}>
                                                    {isCompleted ? t('campaigns.completed') : t('campaigns.running')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right text-xs text-gray-400 font-semibold">
                                                {d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonorDashboard;

