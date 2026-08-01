import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios?v=1';

const DonorDashboard = () => {
    const { user } = useContext(AuthContext);
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back, {user?.name}!</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your charitable impact and supported campaign progress.</p>
                </div>
                <Link to="/campaigns" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs text-sm transition-all self-start md:self-auto">
                    ❤️ Donate Now
                </Link>
            </div>

            {/* Quick Action Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs p-6 border-t-4 border-primary-500 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Explore Campaigns</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Discover verified medical & disaster relief causes.</p>
                    <Link to="/campaigns" className="text-primary-600 dark:text-primary-400 text-xs font-extrabold hover:underline">Browse Campaigns &rarr;</Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs p-6 border-t-4 border-emerald-500 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">My Donations & Receipts</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">View your giving history and download official PDF tax receipts.</p>
                    <Link to="/donations/history" className="text-emerald-600 dark:text-emerald-400 text-xs font-extrabold hover:underline">View History & Receipts &rarr;</Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs p-6 border-t-4 border-amber-500 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Account Profile</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Manage personal account details and preferences.</p>
                    <Link to="/profile" className="text-amber-600 dark:text-amber-400 text-xs font-extrabold hover:underline">Edit Profile &rarr;</Link>
                </div>
            </div>

            {/* Supported Campaigns & Progress Tracker */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>🎁</span> Supported Campaigns & Progress Tracker
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            See total raised amounts and progress updates for campaigns you backed.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500 font-medium">Loading donation impact status...</div>
                ) : donations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 font-medium">You have not made any donations yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900 text-xs font-bold uppercase text-gray-500">
                                <tr>
                                    <th className="py-3.5 px-4 text-left">Campaign Title</th>
                                    <th className="py-3.5 px-4 text-right">Your Donation</th>
                                    <th className="py-3.5 px-4 text-right">Campaign Raised / Goal</th>
                                    <th className="py-3.5 px-4 text-left">Campaign Status</th>
                                    <th className="py-3.5 px-4 text-left">Donation Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {donations.map(d => {
                                    const isCompleted = d.campaign_status === 'completed' || parseFloat(d.raised_amount || 0) >= parseFloat(d.goal_amount || 1);
                                    return (
                                        <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                            <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">{d.campaign_title}</td>
                                            <td className="py-4 px-4 text-right font-black text-primary-600 dark:text-primary-400">${parseFloat(d.amount || 0).toLocaleString()}</td>
                                            <td className="py-4 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                ${parseFloat(d.raised_amount || 0).toLocaleString()} / ${parseFloat(d.goal_amount || 0).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 font-semibold">
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                                    isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                }`}>
                                                    {isCompleted ? 'Completed' : 'Running'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-xs text-gray-500 font-medium">
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
