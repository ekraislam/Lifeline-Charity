import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios?v=1';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import useCampaignRealtime from '../../hooks/useCampaignRealtime';

const STATUS_BADGE = {
    assigned: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
    campaign_active: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200',
    fulfilled: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
    rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
};

const NGODashboard = () => {
    const [assignedBeneficiaries, setAssignedBeneficiaries] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            const [assignedRes, campaignsRes] = await Promise.allSettled([
                api.get('/beneficiaries/requests/my-assigned'),
                api.get('/campaigns')
            ]);
            
            setAssignedBeneficiaries(assignedRes.status === 'fulfilled' ? assignedRes.value.data : []);
            setCampaigns(campaignsRes.status === 'fulfilled' ? campaignsRes.value.data : []);
        } catch (error) {
            console.error("Error fetching NGO data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);

    // Real-time Socket.io listener
    useCampaignRealtime(fetchData);

    const totalRaised = campaigns.reduce((sum, c) => sum + parseFloat(c.raised_amount || 0), 0);

    const generateReport = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text('NGO Progress Report', 14, 22);
            doc.setFontSize(12);
            doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 32);
            doc.text(`Total Campaigns: ${campaigns.length}`, 14, 45);
            doc.text(`Total Raised: $${totalRaised.toLocaleString()}`, 14, 52);
            doc.text(`Assigned Beneficiaries: ${assignedBeneficiaries.length}`, 14, 59);

            const tableColumn = ["ID", "Title", "Goal ($)", "Raised ($)", "Status"];
            const tableRows = campaigns.map(c => [c.id, c.title, c.goal_amount || 0, c.raised_amount || 0, c.status]);
            autoTable(doc, { head: [tableColumn], body: tableRows, startY: 70 });
            doc.save('NGO_Progress_Report.pdf');
        } catch (err) {
            console.error("Failed to generate PDF report", err);
            alert("Could not generate report. Please try again.");
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500 font-medium">Loading NGO dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">NGO Organization Portal</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage beneficiary assignments, campaign progress, and fund payouts</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={generateReport}
                        className="inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 shadow-xs text-xs font-bold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 transition-all cursor-pointer">
                        📄 Export Report
                    </button>
                    <Link to="/campaigns/create"
                        className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-xs text-xs font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all">
                        ➕ Create Campaign
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xs rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <dt className="text-xs font-bold text-gray-400 uppercase">My Campaigns</dt>
                    <dd className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{campaigns.length}</dd>
                </div>
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xs rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <dt className="text-xs font-bold text-emerald-500 uppercase">Total Funds Raised</dt>
                    <dd className="mt-1 text-3xl font-black text-emerald-600 dark:text-emerald-400">${totalRaised.toLocaleString()}</dd>
                </div>
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xs rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                    <dt className="text-xs font-bold text-indigo-500 uppercase">Assigned Beneficiaries</dt>
                    <dd className="mt-1 text-3xl font-black text-indigo-600 dark:text-indigo-400">{assignedBeneficiaries.length}</dd>
                </div>
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xs rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col gap-2">
                    <dt className="text-xs font-bold text-gray-400 uppercase mb-1">Quick Actions</dt>
                    <Link to="/ngo/beneficiary-requests"
                        className="inline-flex items-center px-3 py-1.5 border border-primary-500 text-xs font-bold rounded-xl text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100">
                        🔍 Browse Waiting Requests
                    </Link>
                </div>
            </div>

            {/* Assigned Beneficiaries */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>👥</span> My Assigned Beneficiaries
                    </h2>
                    <Link to="/ngo/beneficiary-requests" className="text-xs text-primary-600 hover:text-primary-700 font-bold">
                        Browse more →
                    </Link>
                </div>

                {assignedBeneficiaries.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
                        <div className="text-4xl mb-3">🏢</div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No beneficiaries assigned yet.</p>
                        <Link to="/ngo/beneficiary-requests" className="mt-3 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700">
                            Browse Waiting Requests
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assignedBeneficiaries.map(req => {
                            const campaignStatus = req.campaign_status;
                            const raised = parseFloat(req.raised_amount || 0);
                            const goal = parseFloat(req.goal_amount || 0);
                            const goalReached = goal > 0 && raised >= goal;
                            const isCampaignCompleted =
                                req.status === 'fulfilled' ||
                                campaignStatus === 'completed' ||
                                campaignStatus === 'target_reached' ||
                                goalReached;

                            return (
                                <div key={req.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                isCampaignCompleted
                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                    : req.status === 'assigned'
                                                    ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                                    : 'bg-green-100 text-green-800 border-green-200'
                                            }`}>
                                                {isCampaignCompleted ? '✅ Completed' : req.status === 'assigned' ? '📋 Assigned' : '📢 Campaign Active'}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{req.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{req.beneficiary_name} · {req.beneficiary_email}</p>
                                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mb-3">${parseFloat(req.required_amount || 0).toLocaleString()} needed</p>
                                        {req.campaign_id && goal > 0 && (
                                            <div className="mt-1 mb-3">
                                                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                                                    <span>${raised.toLocaleString()} raised</span>
                                                    <span>{Math.min(100, Math.round((raised / goal) * 100))}%</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isCampaignCompleted ? 'bg-emerald-500' : 'bg-primary-500'}`}
                                                        style={{ width: `${Math.min(100, (raised / goal) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {req.status === 'assigned' && !req.has_campaign ? (
                                        <button
                                            onClick={() => navigate(`/campaigns/create?help_request_id=${req.id}&title=${encodeURIComponent(req.title)}&amount=${req.required_amount}`)}
                                            className="w-full px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-xs font-bold cursor-pointer"
                                        >
                                            🚀 Create Campaign
                                        </button>
                                    ) : isCampaignCompleted ? (
                                        <div className="text-center text-xs text-emerald-700 dark:text-emerald-300 font-bold py-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200">
                                            ✅ Campaign Completed — Goal Reached
                                        </div>
                                    ) : (
                                        <div className="text-center text-xs text-green-700 dark:text-green-300 font-bold py-2 bg-green-50 dark:bg-green-950/60 rounded-xl border border-green-200">
                                            📢 Campaign is Running
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Campaign Management */}
            <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">📢 My Campaigns</h2>
                <div className="bg-white dark:bg-gray-800 shadow-xs rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {campaigns.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">No campaigns yet. Accept a beneficiary and create a campaign!</div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {campaigns.map((campaign) => {
                                const raised = parseFloat(campaign.raised_amount || 0);
                                const goal = parseFloat(campaign.goal_amount || 1);
                                const isCompleted = campaign.status === 'completed' || campaign.is_completed || raised >= goal;

                                return (
                                    <li key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                        <div className="px-6 py-4 flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{campaign.title}</p>
                                                    <span className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border capitalize ${
                                                        isCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : STATUS_BADGE[campaign.status] || 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {isCompleted ? 'Completed' : campaign.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-4">
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${raised.toLocaleString()} raised</span>
                                                    <span>Goal: ${goal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/campaigns/${campaign.id}`}
                                                className="inline-flex items-center px-3.5 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NGODashboard;
