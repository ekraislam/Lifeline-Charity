import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getMediaUrl } from '../../api/axios';

const NGOBeneficiaryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/beneficiaries/requests/${id}`);
                setRequest(res.data);
            } catch (err) {
                console.error("Failed to load beneficiary request:", err);
                setError(err.response?.data?.message || 'Failed to load details');
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [id]);

    const handleAcceptAndCreate = async () => {
        try {
            setAccepting(true);
            await api.post(`/beneficiaries/requests/${id}/accept`);
            navigate(`/campaigns/create?help_request_id=${id}&title=${encodeURIComponent(request.title)}&amount=${request.required_amount}`);
        } catch (err) {
            console.error("Accept failed:", err);
            // If already accepted/assigned, still navigate to create campaign
            if (err.response?.status === 400 || err.response?.data?.message?.includes('already')) {
                navigate(`/campaigns/create?help_request_id=${id}&title=${encodeURIComponent(request.title)}&amount=${request.required_amount}`);
            } else {
                alert(err.response?.data?.message || 'Failed to accept request');
            }
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                <div className="h-10 w-48 skeleton-pulse rounded-xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-48 skeleton-pulse rounded-2xl" />
                        <div className="h-64 skeleton-pulse rounded-2xl" />
                    </div>
                    <div className="h-96 skeleton-pulse rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Request Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{error || 'The requested help request could not be loaded.'}</p>
                <Link to="/ngo/beneficiary-requests" className="mt-6 inline-block btn-primary px-6 py-2.5 text-xs uppercase tracking-wider">
                    ← Return to Beneficiary Center
                </Link>
            </div>
        );
    }

    const ai = request.ai_report || {};
    const riskColor =
        ai.risk_level === 'Low Risk' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200' :
        ai.risk_level === 'High Risk' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200' :
        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <Link to="/ngo/dashboard" className="hover:text-primary-600">NGO Dashboard</Link>
                        <span>/</span>
                        <Link to="/ngo/beneficiary-requests" className="hover:text-primary-600">Beneficiary Center</Link>
                        <span>/</span>
                        <span className="text-gray-600 dark:text-gray-300 font-bold">Request #{request.id}</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{request.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/ngo/beneficiary-requests')}
                        className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
                    >
                        ← Back to List
                    </button>
                    <button
                        onClick={handleAcceptAndCreate}
                        disabled={accepting}
                        className="btn-primary py-2.5 px-6 text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all cursor-pointer"
                    >
                        {accepting ? 'Processing...' : '🚀 Accept & Create Campaign'}
                    </button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns: Request Details & AI Analysis */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Overview Card */}
                    <div className="card-premium p-6 space-y-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                                    ✓ Admin Verified
                                </span>
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black border ${riskColor}`}>
                                    🤖 {ai.risk_level || 'Not Analyzed'}
                                </span>
                            </div>
                            <span className="text-xs text-gray-400">
                                Submitted {new Date(request.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Help Request Description</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                                {request.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">Required Financial Goal</span>
                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                    ${parseFloat(request.required_amount || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Preferred Disbursement Method</span>
                                <p className="text-base font-black text-gray-900 dark:text-white mt-1">
                                    💳 {request.payment_method || 'Bank Transfer'}
                                </p>
                                {(request.account_holder_name || request.account_number) && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {request.account_holder_name} · {request.account_number}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Document Analysis Report */}
                    <div className="card-premium p-6 space-y-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                            <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <span>🤖</span> AI Verification & Analysis Report
                            </h3>
                            {ai.confidence_score !== undefined && (
                                <span className="text-xs font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 px-3 py-1 rounded-full border border-primary-200">
                                    Score: {ai.confidence_score}%
                                </span>
                            )}
                        </div>

                        {ai.confidence_score === undefined ? (
                            <p className="text-xs text-gray-400 italic">No AI verification report available for this request yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {/* Confidence Score Progress */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                                        <span>AI Document Confidence Score</span>
                                        <span>{ai.confidence_score}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                ai.confidence_score >= 75 ? 'bg-emerald-500' :
                                                ai.confidence_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                            }`}
                                            style={{ width: `${ai.confidence_score}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Recommendation */}
                                {ai.recommendation && (
                                    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                                        <span className="font-black uppercase tracking-wider block mb-1">AI Recommendation</span>
                                        {ai.recommendation}
                                    </div>
                                )}

                                {/* Suspicious Findings */}
                                {ai.suspicious_findings && Array.isArray(ai.suspicious_findings) && ai.suspicious_findings.length > 0 && (
                                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                                        <span className="font-black uppercase tracking-wider block">⚠️ Flags & Findings</span>
                                        <ul className="list-disc list-inside space-y-0.5">
                                            {ai.suspicious_findings.map((finding, idx) => (
                                                <li key={idx}>{typeof finding === 'string' ? finding : JSON.stringify(finding)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Uploaded Documents Gallery */}
                    <div className="card-premium p-6 space-y-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <span>📄</span> Uploaded Documents ({request.documents?.length || 0})
                        </h3>

                        {!request.documents || request.documents.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No verification documents attached.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {request.documents.map((doc, index) => {
                                    const mediaUrl = getMediaUrl(doc.document_url);
                                    return (
                                        <div
                                            key={doc.id || index}
                                            onClick={() => setSelectedDoc(mediaUrl)}
                                            className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 h-36 cursor-pointer hover:border-primary-500 transition-all"
                                        >
                                            <img
                                                src={mediaUrl}
                                                alt={`Document ${index + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                                🔍 View Document
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Beneficiary Profile & Timeline */}
                <div className="space-y-6">

                    {/* Beneficiary Profile Card */}
                    <div className="card-premium p-6 space-y-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">
                            Beneficiary Profile
                        </h3>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-inner">
                                {(request.beneficiary_name || 'B').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white truncate">{request.beneficiary_name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{request.beneficiary_email}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs pt-2">
                            {request.beneficiary_phone && (
                                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800">
                                    <span className="text-gray-400">Phone</span>
                                    <span className="font-bold text-gray-700 dark:text-gray-200">{request.beneficiary_phone}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800">
                                <span className="text-gray-400">Verification</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">Verified by Admin</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-400">Request Status</span>
                                <span className="font-bold text-purple-600 capitalize">{request.status?.replace(/_/g, ' ')}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleAcceptAndCreate}
                            disabled={accepting}
                            className="w-full btn-primary py-3 text-xs uppercase tracking-wider font-extrabold shadow-md cursor-pointer mt-4"
                        >
                            🚀 Accept & Launch Campaign
                        </button>
                    </div>

                    {/* Timeline Card */}
                    <div className="card-premium p-6 space-y-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">
                            Request Audit Timeline
                        </h3>

                        <div className="space-y-4 text-xs">
                            <div className="flex gap-3 items-start">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">✓</div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Help Request Submitted</p>
                                    <p className="text-[11px] text-gray-400">{new Date(request.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">🤖</div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">AI OCR & Document Analysis</p>
                                    <p className="text-[11px] text-gray-400">Completed (Score: {ai.confidence_score || 'N/A'}%)</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">👤</div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Admin Verification Approved</p>
                                    <p className="text-[11px] text-gray-400">Marked as Waiting for NGO</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">📢</div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">NGO Campaign Launch</p>
                                    <p className="text-[11px] text-amber-600 font-semibold">Pending NGO Action</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Lightbox Modal */}
            {selectedDoc && (
                <div
                    onClick={() => setSelectedDoc(null)}
                    className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
                >
                    <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-2 shadow-2xl">
                        <img src={selectedDoc} alt="Document Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
                        <button
                            onClick={() => setSelectedDoc(null)}
                            className="absolute top-4 right-4 text-white bg-black/60 hover:bg-black w-8 h-8 rounded-full flex items-center justify-center font-bold"
                        >×</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NGOBeneficiaryDetail;
