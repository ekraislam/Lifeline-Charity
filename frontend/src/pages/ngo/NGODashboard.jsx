import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios?v=1';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import useCampaignRealtime from '../../hooks/useCampaignRealtime';
import { useLanguage } from '../../context/LanguageContext';
import LiveActivityTimeline from '../../components/common/LiveActivityTimeline';


const STATUS_BADGE = {
    assigned: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
    campaign_active: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200',
    fulfilled: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
    rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
    withdrawn: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
};

const WITHDRAWAL_REASONS = [
    'Suspected fraud',
    'Fake documents detected',
    'Beneficiary cannot be contacted',
    'Policy violation',
    'NGO lacks resources',
    'Duplicate campaign',
    'Other'
];

const NGODashboard = () => {
    const { t } = useLanguage();
    const [assignedBeneficiaries, setAssignedBeneficiaries] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaignForWithdraw, setSelectedCampaignForWithdraw] = useState(null);
    const [withdrawReason, setWithdrawReason] = useState('');
    const [customWithdrawReason, setCustomWithdrawReason] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);
    const navigate = useNavigate();

    const handleConfirmWithdraw = async () => {
        if (!withdrawReason) {
            alert('Please select a withdrawal reason.');
            return;
        }
        if (withdrawReason === 'Other' && !customWithdrawReason.trim()) {
            alert('Please specify details for Other reason.');
            return;
        }
        setWithdrawing(true);
        try {
            await api.post(`/campaigns/${selectedCampaignForWithdraw.id}/withdraw`, {
                reason: withdrawReason,
                custom_reason: customWithdrawReason.trim()
            });
            setSelectedCampaignForWithdraw(null);
            setWithdrawReason('');
            setCustomWithdrawReason('');
            fetchData();
        } catch (err) {
            console.error("Failed to withdraw campaign:", err);
            alert(err.response?.data?.message || "Failed to withdraw campaign. Please try again.");
        } finally {
            setWithdrawing(false);
        }
    };



    const fetchData = useCallback(async () => {
        try {
            const [assignedRes, campaignsRes] = await Promise.allSettled([
                api.get('/beneficiaries/requests/my-assigned'),
                api.get('/campaigns/my-campaigns')
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

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(n => <div key={n} className="skeleton-pulse h-28 w-full rounded-[22px]" />)}
            </div>
            <div className="skeleton-pulse h-64 w-full rounded-[22px]" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-display text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">NGO Portal</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage beneficiary assignments, fundraising campaigns, and reports</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={generateReport}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-extrabold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all cursor-pointer"
                    >
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Report PDF
                    </button>
                    <Link
                        to="/campaigns/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-primary-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <span>➕</span> Create Campaign
                    </Link>
                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="group relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">My Campaigns</span>
                            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{campaigns.length}</div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                            📋
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500">Funds Raised</span>
                            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">${totalRaised.toLocaleString()}</div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                            💰
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-500">Assigned Beneficiaries</span>
                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{assignedBeneficiaries.length}</div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                            👥
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-md flex flex-col justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Quick Portal Action</span>
                    <Link
                        to="/ngo/beneficiary-requests"
                        className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 hover:bg-sky-100 transition-all text-center"
                    >
                        🔍 Browse Waiting Requests
                    </Link>
                </div>
            </div>

            {/* Assigned Beneficiaries Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <span>👥</span> My Assigned Beneficiaries
                    </h2>
                    <Link to="/ngo/beneficiary-requests" className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-extrabold">
                        Browse More Requests →
                    </Link>
                </div>

                {assignedBeneficiaries.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-[22px] p-10 text-center border border-gray-100 dark:border-gray-800 shadow-md space-y-3">
                        <div className="text-5xl">🏢</div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">No beneficiaries assigned yet</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Browse waiting beneficiary requests to review documentation and launch dedicated fundraising campaigns.</p>
                        <Link to="/ngo/beneficiary-requests" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:scale-105 transition-all">
                            Browse Waiting Requests
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                                <div key={req.id} className="group relative rounded-[20px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                isCampaignCompleted
                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                                    : req.status === 'assigned'
                                                    ? 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300'
                                                    : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300'
                                            }`}>
                                                {isCampaignCompleted ? '✅ Completed' : req.status === 'assigned' ? '📋 Assigned' : '📢 Active'}
                                            </span>
                                            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                                ${parseFloat(req.required_amount || 0).toLocaleString()} needed
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="font-extrabold text-base text-gray-900 dark:text-white truncate group-hover:text-sky-500 transition-colors">{req.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{req.beneficiary_name} · {req.beneficiary_email}</p>
                                        </div>

                                        {req.campaign_id && goal > 0 && (
                                            <div className="space-y-1 pt-1">
                                                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                                                    <span>${raised.toLocaleString()} raised</span>
                                                    <span>{Math.min(100, Math.round((raised / goal) * 100))}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isCampaignCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-sky-500 to-indigo-600'}`}
                                                        style={{ width: `${Math.min(100, (raised / goal) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 mt-4">
                                        <Link
                                            to={`/ngo/beneficiary-requests/${req.id}`}
                                            className="w-full text-center py-2 px-3 rounded-xl text-xs font-extrabold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all"
                                        >
                                            View Request Details
                                        </Link>
                                        {req.campaign_id ? (
                                            <Link
                                                to={`/campaigns/${req.campaign_id}`}
                                                className="w-full text-center py-2 px-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-sm transition-all flex items-center justify-center gap-1"
                                            >
                                                ✏️ Edit Campaign
                                            </Link>
                                        ) : (
                                            <Link
                                                to={`/campaigns/create?help_request_id=${req.id}&title=${encodeURIComponent(req.title || '')}&amount=${req.required_amount || ''}`}
                                                className="w-full text-center py-2 px-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-sm transition-all flex items-center justify-center gap-1"
                                            >
                                                ➕ Create Campaign
                                            </Link>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Campaign Management Section */}
            <div className="bg-white dark:bg-gray-900 rounded-[22px] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <span>📢</span> My Organization Campaigns ({campaigns.length})
                    </h2>
                    <Link to="/campaigns" className="text-xs text-sky-600 dark:text-sky-400 font-extrabold hover:underline">
                        View All Platform Campaigns →
                    </Link>
                </div>

                {campaigns.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 font-medium">No campaigns yet. Accept a beneficiary request and create your first campaign!</div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-black uppercase text-gray-400">
                                <tr>
                                    <th className="py-3.5 px-4 text-left">Campaign Title</th>
                                    <th className="py-3.5 px-4 text-right">Goal ($)</th>
                                    <th className="py-3.5 px-4 text-right">Raised ($)</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {campaigns.map((campaign) => {
                                    const raised = parseFloat(campaign.raised_amount || 0);
                                    const goal = parseFloat(campaign.goal_amount || 1);
                                    const isCompleted = campaign.status === 'completed' || campaign.is_completed || raised >= goal;

                                    return (
                                        <tr key={campaign.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white max-w-xs truncate">{campaign.title}</td>
                                            <td className="py-3.5 px-4 text-right font-extrabold text-gray-700 dark:text-gray-300">${goal.toLocaleString()}</td>
                                            <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">${raised.toLocaleString()}</td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                                                    isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : STATUS_BADGE[campaign.status] || 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {isCompleted ? 'Completed' : campaign.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/campaigns/${campaign.id}`}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-xs font-extrabold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 shadow-xs"
                                                >
                                                    View
                                                </Link>
                                                {campaign.status !== 'withdrawn' && !isCompleted && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCampaignForWithdraw(campaign);
                                                            setWithdrawReason('');
                                                            setCustomWithdrawReason('');
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-200 dark:border-rose-800/60 text-xs font-extrabold rounded-xl text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-all shadow-xs"
                                                    >
                                                        🚩 Withdraw Campaign
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Live Activity Stream */}
            <LiveActivityTimeline

                title="NGO Organization Live Activity"
                onRefresh={fetchData}
                activities={[
                    ...assignedBeneficiaries.map((b, i) => ({
                        id: `ngo-req-${i}`,
                        icon: b.status === 'fulfilled' ? '✅' : '📋',
                        type: b.status === 'fulfilled' ? 'success' : 'info',
                        user: b.title || 'Assigned Beneficiary Request',
                        role: 'Beneficiary',
                        title: `Assigned request: "${b.title}"`,
                        description: `Status: ${b.status} | Required: $${parseFloat(b.required_amount || 0).toLocaleString()}`,
                        timestamp: b.created_at || new Date()
                    })),
                    ...campaigns.map((c, i) => ({
                        id: `ngo-cmp-${i}`,
                        icon: c.status === 'completed' ? '🎉' : '📢',
                        type: c.status === 'completed' ? 'success' : 'warning',
                        user: c.title || 'Organization Campaign',
                        role: 'NGO',
                        title: `Campaign "${c.title}"`,
                        description: `Raised $${parseFloat(c.raised_amount || 0).toLocaleString()} of $${parseFloat(c.goal_amount || 0).toLocaleString()}`,
                        timestamp: c.created_at || new Date()
                    }))
                ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))}
            />

            {/* WITHDRAW CAMPAIGN MODAL */}
            {selectedCampaignForWithdraw && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center text-xl font-bold">
                                    🚩
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Withdraw Campaign</h3>
                                    <p className="text-xs text-gray-400">Campaign ID #{selectedCampaignForWithdraw.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedCampaignForWithdraw(null);
                                    setWithdrawReason('');
                                    setCustomWithdrawReason('');
                                }}
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center justify-center text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs text-amber-900 dark:text-amber-300 space-y-1">
                            <strong className="font-extrabold flex items-center gap-1 text-amber-800 dark:text-amber-200">
                                ⚠️ Important Notice:
                            </strong>
                            <p>This campaign will become inactive and will no longer accept donations.</p>
                            <p>The beneficiary request will become available for other NGOs to review.</p>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-xs font-black uppercase text-gray-600 dark:text-gray-300">
                                Select Withdrawal Reason <span className="text-rose-500">*</span>
                            </label>

                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {WITHDRAWAL_REASONS.map((r) => (
                                    <label
                                        key={r}
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                            withdrawReason === r
                                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 font-extrabold shadow-sm'
                                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="withdrawReason"
                                            value={r}
                                            checked={withdrawReason === r}
                                            onChange={(e) => setWithdrawReason(e.target.value)}
                                            className="accent-rose-600 w-4 h-4"
                                        />
                                        <span>{r}</span>
                                    </label>
                                ))}
                            </div>

                            {withdrawReason === 'Other' && (
                                <div className="pt-2 animate-in fade-in duration-200">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Specific Reason Details <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={customWithdrawReason}
                                        onChange={(e) => setCustomWithdrawReason(e.target.value)}
                                        placeholder="Please explain why you are withdrawing this campaign..."
                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-rose-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => {
                                    setSelectedCampaignForWithdraw(null);
                                    setWithdrawReason('');
                                    setCustomWithdrawReason('');
                                }}
                                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-extrabold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmWithdraw}
                                disabled={withdrawing || !withdrawReason || (withdrawReason === 'Other' && !customWithdrawReason.trim())}
                                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {withdrawing ? 'Withdrawing...' : '🚩 Confirm Campaign Withdrawal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};



export default NGODashboard;
