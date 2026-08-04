import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const DECLINE_REASONS = [
    'Outside our service area',
    'Insufficient resources',
    'Does not match NGO policy',
    'Documents need improvement',
    'Currently unable to manage this campaign',
    'Other'
];

const NGOBeneficiaryRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const [declining, setDeclining] = useState(null);
    const [confirmId, setConfirmId] = useState(null);

    // Decline Modal state
    const [declineReqId, setDeclineReqId] = useState(null);
    const [selectedReason, setSelectedReason] = useState(DECLINE_REASONS[0]);
    const [customReason, setCustomReason] = useState('');
    const [declineError, setDeclineError] = useState('');

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');
    const [amountFilter, setAmountFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/beneficiaries/requests/waiting');
            setRequests(res.data || []);
        } catch (e) {
            console.error('Error fetching waiting requests:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        setAccepting(id);
        try {
            await api.post(`/beneficiaries/requests/${id}/accept`);
            const targetReq = requests.find(r => r.id === id);
            setRequests(prev => prev.filter(r => r.id !== id));
            setConfirmId(null);
            navigate(`/campaigns/create?help_request_id=${id}&title=${encodeURIComponent(targetReq?.title || '')}&amount=${targetReq?.required_amount || ''}`);
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to accept request');
        } finally {
            setAccepting(null);
        }
    };

    const openDeclineModal = (reqId) => {
        setDeclineReqId(reqId);
        setSelectedReason(DECLINE_REASONS[0]);
        setCustomReason('');
        setDeclineError('');
    };

    const handleDeclineSubmit = async () => {
        if (!selectedReason) {
            setDeclineError('Please select a reason for declining.');
            return;
        }
        if (selectedReason === 'Other' && !customReason.trim()) {
            setDeclineError('Please provide a custom reason.');
            return;
        }

        setDeclining(declineReqId);
        try {
            await api.post(`/beneficiaries/requests/${declineReqId}/decline`, {
                reason: selectedReason,
                custom_reason: selectedReason === 'Other' ? customReason.trim() : customReason.trim() || undefined
            });
            // Remove request from pending list
            setRequests(prev => prev.filter(r => r.id !== declineReqId));
            setDeclineReqId(null);
        } catch (e) {
            setDeclineError(e.response?.data?.message || 'Failed to decline request');
        } finally {
            setDeclining(null);
        }
    };

    // Filter & Sort Logic
    const filteredRequests = requests.filter(req => {
        const matchesSearch =
            req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.beneficiary_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRisk =
            riskFilter === 'all' ||
            (req.ai_risk_level || 'Not Analyzed').toLowerCase().includes(riskFilter.toLowerCase());

        const amount = parseFloat(req.required_amount || 0);
        const matchesAmount =
            amountFilter === 'all' ? true :
            amountFilter === 'under1k' ? amount < 1000 :
            amountFilter === '1k5k' ? amount >= 1000 && amount <= 5000 :
            amountFilter === 'over5k' ? amount > 5000 : true;

        return matchesSearch && matchesRisk && matchesAmount;
    }).sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortOrder === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        if (sortOrder === 'amount_high') return parseFloat(b.required_amount || 0) - parseFloat(a.required_amount || 0);
        if (sortOrder === 'amount_low') return parseFloat(a.required_amount || 0) - parseFloat(b.required_amount || 0);
        return 0;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Accept Confirmation Dialog */}
            {confirmId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 max-w-md w-full border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                        <div className="text-4xl mb-3 text-center">🤝</div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white text-center mb-2">Accept & Create Campaign</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6 leading-relaxed">
                            Once accepted, this verified beneficiary will be locked and assigned exclusively to your NGO. You will be redirected to create their fundraising campaign.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmId(null)}
                                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAccept(confirmId)}
                                disabled={accepting === confirmId}
                                className="flex-1 py-2.5 btn-primary rounded-xl text-xs uppercase tracking-wider font-black disabled:opacity-60 cursor-pointer shadow-md"
                            >
                                {accepting === confirmId ? 'Accepting...' : '✓ Confirm & Accept'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Decline Dialog Modal */}
            {declineReqId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 max-w-md w-full border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                        <div className="text-4xl mb-2 text-center">❌</div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white text-center mb-1">Decline Help Request</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4 leading-relaxed">
                            Please select a reason for declining this request. This request will be removed from your pending list while remaining accessible to other NGOs.
                        </p>

                        {declineError && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                                ⚠️ {declineError}
                            </div>
                        )}

                        <div className="space-y-3 mb-6">
                            <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300">
                                Select Reason <span className="text-rose-500">*</span>
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {DECLINE_REASONS.map((reason) => (
                                    <label
                                        key={reason}
                                        className={`flex items-center p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                            selectedReason === reason
                                                ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-900 dark:text-primary-200 font-bold'
                                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="decline_reason"
                                            value={reason}
                                            checked={selectedReason === reason}
                                            onChange={() => setSelectedReason(reason)}
                                            className="mr-2.5 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span>{reason}</span>
                                    </label>
                                ))}
                            </div>

                            {selectedReason === 'Other' && (
                                <div className="mt-3">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Custom Reason Details <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        placeholder="Please provide details on why your NGO is declining this request..."
                                        className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeclineReqId(null)}
                                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeclineSubmit}
                                disabled={declining === declineReqId}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs uppercase tracking-wider font-black disabled:opacity-60 cursor-pointer shadow-md transition-colors"
                            >
                                {declining === declineReqId ? 'Declining...' : '❌ Decline Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <span>🏥</span> Beneficiary Request Center
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Browse admin-verified medical and humanitarian help requests ready for campaign creation.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/ngo/dashboard')}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                    >
                        ← Back to Portal
                    </button>
                    <button
                        onClick={fetchRequests}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 transition-colors cursor-pointer"
                    >
                        🔄 Refresh Requests
                    </button>
                </div>
            </div>

            {/* Controls Bar: Search & Filters */}
            <div className="card-premium p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search Input */}
                    <div className="lg:col-span-2 relative">
                        <input
                            type="text"
                            placeholder="Search by request title, beneficiary name, keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <span className="absolute left-3 top-2.5 text-xs text-gray-400">🔍</span>
                    </div>

                    {/* AI Risk Filter */}
                    <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="py-2 px-3 rounded-xl text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none cursor-pointer"
                    >
                        <option value="all">🤖 All AI Risk Levels</option>
                        <option value="low">🟢 Low Risk</option>
                        <option value="medium">🟡 Medium Risk</option>
                        <option value="high">🔴 High Risk</option>
                        <option value="not analyzed">⚪ Not Analyzed</option>
                    </select>

                    {/* Amount Filter */}
                    <select
                        value={amountFilter}
                        onChange={(e) => setAmountFilter(e.target.value)}
                        className="py-2 px-3 rounded-xl text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none cursor-pointer"
                    >
                        <option value="all">💰 All Amount Ranges</option>
                        <option value="under1k">Under $1,000</option>
                        <option value="1k5k">$1,000 - $5,000</option>
                        <option value="over5k">Over $5,000</option>
                    </select>

                    {/* Date Sort */}
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="py-2 px-3 rounded-xl text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none cursor-pointer"
                    >
                        <option value="newest">📅 Newest First</option>
                        <option value="oldest">📅 Oldest First</option>
                        <option value="amount_high">💵 Amount: High to Low</option>
                        <option value="amount_low">💵 Amount: Low to High</option>
                    </select>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 px-1 pt-1">
                    <span>Showing <strong className="text-gray-700 dark:text-gray-200">{filteredRequests.length}</strong> available beneficiary requests</span>
                    {(searchTerm || riskFilter !== 'all' || amountFilter !== 'all') && (
                        <button
                            onClick={() => { setSearchTerm(''); setRiskFilter('all'); setAmountFilter('all'); setSortOrder('newest'); }}
                            className="text-primary-600 dark:text-primary-400 font-bold hover:underline cursor-pointer"
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            </div>

            {/* Main Requests Grid / Skeletons / Empty */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="card-premium p-5 space-y-4 rounded-2xl">
                            <div className="h-4 skeleton-pulse rounded-full w-1/3" />
                            <div className="h-6 skeleton-pulse rounded-xl w-3/4" />
                            <div className="h-12 skeleton-pulse rounded-xl w-full" />
                            <div className="h-10 skeleton-pulse rounded-xl w-full" />
                        </div>
                    ))}
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="card-premium p-16 text-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">No Matching Requests Found</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                        {requests.length === 0
                            ? 'All verified beneficiary help requests have been processed.'
                            : 'Try adjusting your search criteria or filters to see more requests.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map(req => {
                        const riskLevel = req.ai_risk_level || 'Not Analyzed';
                        const riskBadge =
                            riskLevel === 'Low Risk' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200' :
                            riskLevel === 'Medium Risk' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200' :
                            riskLevel === 'High Risk' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200';

                        const isAcceptedByOther = req.is_accepted_by_other;
                        const isAcceptedByMe = req.is_accepted_by_me;

                        return (
                            <div
                                key={req.id}
                                className={`card-premium p-5 flex flex-col justify-between bg-white dark:bg-gray-800 border rounded-2xl transition-all duration-200 ${
                                    isAcceptedByMe
                                        ? 'border-indigo-300 dark:border-indigo-800/60 bg-indigo-50/20 dark:bg-indigo-950/10'
                                        : isAcceptedByOther
                                        ? 'opacity-85 border-purple-200 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/10'
                                        : 'border-gray-100 dark:border-gray-700 hover:border-primary-500/50 hover:shadow-xl'
                                }`}
                            >
                                <div className="space-y-3">
                                    {/* Badges row */}
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {isAcceptedByMe ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 shadow-xs">
                                                    ✅ Accepted by You
                                                </span>
                                            ) : isAcceptedByOther ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shadow-xs">
                                                    🔒 Accepted by another NGO
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                                                    ✨ Available for Review
                                                </span>
                                            )}

                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black border ${riskBadge}`}>
                                                🤖 {riskLevel}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">#{req.id}</span>
                                    </div>

                                    {/* Title & Description */}
                                    <div>
                                        <h3 className="font-extrabold text-base text-gray-900 dark:text-white line-clamp-2 leading-snug hover:text-primary-600 transition-colors">
                                            {req.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                            {req.description}
                                        </p>
                                    </div>

                                    {/* Stats Meta */}
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 space-y-1.5 text-xs border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Beneficiary</span>
                                            <span className="font-bold text-gray-900 dark:text-white truncate max-w-[140px]">{req.beneficiary_name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Requested Amount</span>
                                            <span className="font-black text-emerald-600 dark:text-emerald-400">${parseFloat(req.required_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Medical Documents</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">📄 {req.document_count || 0} Attached</span>
                                        </div>
                                        {(isAcceptedByOther || isAcceptedByMe) && (
                                            <div className="flex justify-between items-center pt-1 border-t border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-300">
                                                <span className="font-bold">Managing NGO</span>
                                                <span className="font-extrabold truncate max-w-[140px]">{isAcceptedByMe ? 'Your NGO' : (req.assigned_ngo_org || 'Partner NGO')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700/60">
                                    {isAcceptedByMe ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <Link
                                                to={`/ngo/beneficiary-requests/${req.id}`}
                                                className="py-2 px-2 text-center rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                                            >
                                                🔍 Details
                                            </Link>
                                            <button
                                                onClick={() => openDeclineModal(req.id)}
                                                className="py-2 px-2 text-center rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer flex items-center justify-center gap-1"
                                            >
                                                ❌ Reject / Withdraw
                                            </button>
                                            {req.campaign_id ? (
                                                <Link
                                                    to={`/campaigns/${req.campaign_id}`}
                                                    className="py-2 px-2 text-center bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-extrabold shadow-xs cursor-pointer flex items-center justify-center gap-1"
                                                >
                                                    ✏️ Edit Campaign
                                                </Link>
                                            ) : (
                                                <Link
                                                    to={`/campaigns/create?help_request_id=${req.id}&title=${encodeURIComponent(req.title || '')}&amount=${req.required_amount || ''}`}
                                                    className="py-2 px-2 text-center bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-xs cursor-pointer flex items-center justify-center gap-1"
                                                >
                                                    ➕ Create Campaign
                                                </Link>
                                            )}
                                        </div>
                                    ) : isAcceptedByOther ? (


                                        <div className="flex items-center justify-between gap-2">
                                            <Link
                                                to={`/ngo/beneficiary-requests/${req.id}`}
                                                className="w-full py-2 px-3 text-center rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                🔍 View Details
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <Link
                                                to={`/ngo/beneficiary-requests/${req.id}`}
                                                className="py-2 px-2 text-center rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                                            >
                                                🔍 Details
                                            </Link>
                                            <button
                                                onClick={() => openDeclineModal(req.id)}
                                                className="py-2 px-2 text-center rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer flex items-center justify-center gap-1"
                                            >
                                                ❌ Decline
                                            </button>
                                            <button
                                                onClick={() => setConfirmId(req.id)}
                                                className="py-2 px-2 text-center btn-primary rounded-xl text-xs uppercase tracking-wider font-extrabold shadow-xs cursor-pointer flex items-center justify-center gap-1"
                                            >
                                                🚀 Accept
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );

                    })}
                </div>
            )}
        </div>
    );
};

export default NGOBeneficiaryRequests;

