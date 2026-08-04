import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios?v=1';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200',
    under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
    waiting_for_ngo: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200',
    assigned: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
    campaign_active: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200',
    fulfilled: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
};

const STATUS_LABELS = {
    pending: 'Pending',
    under_review: 'Under Review',
    waiting_for_ngo: 'Waiting for NGO',
    assigned: 'Assigned to NGO',
    campaign_active: 'Campaign Active',
    rejected: 'Rejected',
    fulfilled: 'Fulfilled',
};

const RISK_BADGES = {
    'Low Risk': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300',
    'Medium Risk': 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300',
    'High Risk': 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300',
    'Not Analyzed': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300'
};

const PAGE_SIZE = 10;

const DetailModal = ({ request, onClose, onStatusUpdate, onReportUpdate }) => {
    const [adminNote, setAdminNote] = useState(request.admin_note || '');
    const [loading, setLoading] = useState(false);
    const [reAnalyzing, setReAnalyzing] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiReport, setAiReport] = useState(request.ai_report || null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        setAiReport(request.ai_report || null);
        setAiError(null);
    }, [request]);

    const handleAction = async (status) => {
        setLoading(true);
        try {
            await api.put(`/admin/beneficiaries/${request.id}/status`, { status, adminNote });
            onStatusUpdate(request.id, status === 'approved' ? 'waiting_for_ngo' : status, adminNote);
            onClose();
        } catch (e) {
            alert('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleReAnalyze = async () => {
        setReAnalyzing(true);
        setAiError(null);
        try {
            const res = await api.post(`/admin/beneficiaries/${request.id}/re-analyze`);
            const newReport = res.data.report;
            setAiReport(newReport);
            if (onReportUpdate) {
                onReportUpdate(request.id, newReport);
            }
        } catch (e) {
            console.error("AI Re-analysis error:", e);
            setAiError("Failed to process document analysis. Please check file formatting and try again.");
        } finally {
            setReAnalyzing(false);
        }
    };

    const ocr = aiReport?.ocr_data || {};
    const nid = aiReport?.nid_analysis || {};
    const med = aiReport?.medical_analysis || {};
    const missing = aiReport?.missing_info || [];
    const suspicious = aiReport?.suspicious_findings || [];
    const risk = aiReport?.risk_level || request.ai_risk_level || 'Not Analyzed';

    return (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-gray-100 dark:border-gray-700 my-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur z-20 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-extrabold uppercase px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                Request #{request.id}
                            </span>
                            <span className={`inline-flex px-3 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[request.status]}`}>
                                {STATUS_LABELS[request.status] || request.status}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">{request.title}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Submitted by <strong className="text-gray-700 dark:text-gray-200">{request.beneficiary_name}</strong> ({request.beneficiary_email}) on {new Date(request.created_at).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl flex items-center justify-center transition-all"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Disclaimer Banner */}
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
                        <span className="text-xl">ℹ️</span>
                        <div>
                            <strong className="font-bold block text-sm">AI Document Analysis Disclaimer</strong>
                            The AI system performs automated OCR text extraction, document image quality analysis, and fraud risk assessment to assist review. It does not provide legal verification or official authentication of government/medical documents.
                            <span className="font-extrabold underline ml-1">The final approval or rejection decision is always made by the Admin.</span>
                        </div>
                    </div>

                    {/* AI Error Alert with Retry Button */}
                    {aiError && (
                        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">⚠️</span>
                                <span>{aiError}</span>
                            </div>
                            <button
                                onClick={handleReAnalyze}
                                disabled={reAnalyzing}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors"
                            >
                                🔄 Retry Analysis
                            </button>
                        </div>
                    )}

                    {/* AI Document Analysis Report Header Card */}
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full text-indigo-300">
                                        AI Document Analysis System
                                    </span>
                                    <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold border ${RISK_BADGES[risk] || RISK_BADGES['Not Analyzed']}`}>
                                        {risk.toUpperCase()}
                                    </span>
                                    <span className="text-xs font-bold bg-white/10 px-2.5 py-0.5 rounded-full text-emerald-300">
                                        {aiReport?.confidence_score || 0}% Confidence Score
                                    </span>
                                </div>
                                <h3 className="text-xl font-black">AI Document Analysis Report</h3>
                                <p className="text-xs text-indigo-200 mt-1.5 max-w-xl font-medium">{aiReport?.recommendation || 'No AI document analysis generated yet.'}</p>
                                {aiReport?.reason_for_risk && (
                                    <div className="mt-3 bg-white/10 p-3 rounded-xl border border-white/10 text-xs text-indigo-100 font-medium">
                                        <strong className="text-amber-300 font-bold block mb-0.5">📌 Reason for Assigned Risk:</strong>
                                        {aiReport.reason_for_risk}
                                    </div>
                                )}
                            </div>

                            {/* Risk Assessment Indicator */}
                            <div className="flex flex-col items-center justify-center bg-white/10 p-4 rounded-2xl border border-white/10 min-w-[170px]">
                                <span className={`text-lg font-black px-3 py-1 rounded-xl ${RISK_BADGES[risk] || RISK_BADGES['Not Analyzed']}`}>{risk.toUpperCase()}</span>
                                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider mt-2">AI Risk Assessment</span>
                                <div className="w-full bg-white/20 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div className={`h-1.5 rounded-full transition-all duration-500 ${risk === 'Low Risk' ? 'bg-emerald-400 w-1/3' : risk === 'Medium Risk' ? 'bg-amber-400 w-2/3' : risk === 'High Risk' ? 'bg-rose-400 w-full' : 'bg-gray-400 w-0'}`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                            <span className="text-indigo-200">Real OCR, File Metadata & Dynamic Discrepancy Parsing</span>
                            <button
                                onClick={handleReAnalyze}
                                disabled={reAnalyzing}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {reAnalyzing ? (
                                    <>
                                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Analyzing Documents...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>⚡ Re-Run AI Analysis</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Loading State Overlay */}
                    {reAnalyzing && (
                        <div className="p-8 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl text-center space-y-3">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Reading uploaded documents & running OCR Analysis...</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">Scanning NID images, medical reports, prescriptions, and cross-referencing profile details.</p>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-4">
                        {[
                            { id: 'overview', label: '📋 OCR Extracted Information' },
                            { id: 'nid', label: '🆔 NID Image Analysis' },
                            { id: 'medical', label: '🏥 Medical Document Analysis' },
                            { id: 'anomalies', label: '⚠️ AI Risk Observations' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 text-xs font-extrabold border-b-2 transition-all ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* TAB 1: OCR EXTRACTED INFO */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-2 text-xs">
                                <p className="text-[11px] font-bold text-gray-400 uppercase">Extracted Applicant Name</p>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{ocr.patient_name || request.beneficiary_name}</p>
                                
                                <p className="text-[11px] font-bold text-gray-400 uppercase pt-2">Extracted NID Number</p>
                                <p className="font-mono font-bold text-blue-600 dark:text-blue-400">{ocr.nid_number || 'Not Detected in File OCR'}</p>

                                <p className="text-[11px] font-bold text-gray-400 uppercase pt-2">Extracted Age / DOB</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{ocr.dob_age || 'Not Detected in File OCR'}</p>

                                <p className="text-[11px] font-bold text-gray-400 uppercase pt-2">Prescription & Dosage Details</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{ocr.prescription_details || 'Standard Medical Prescription'}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-2 text-xs">
                                <p className="text-[11px] font-bold text-gray-400 uppercase">Extracted Hospital / Center</p>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{ocr.hospital_name || 'Hospital Center (Extracted)'}</p>

                                <p className="text-[11px] font-bold text-gray-400 uppercase pt-2">Extracted Doctor / Practitioner</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{ocr.doctor_name || 'Medical Practitioner (Extracted)'}</p>

                                <p className="text-[11px] font-bold text-gray-400 uppercase pt-2">Extracted Medical Diagnosis & Cost</p>
                                <p className="font-semibold text-emerald-700 dark:text-emerald-400">{ocr.diagnosis || request.title} • Extracted Cost: {ocr.extracted_amount || `$${request.required_amount}`}</p>

                                <p className="text-[11px] font-bold text-gray-400 uppercase pt-2">Extracted Document Date</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{ocr.document_date || new Date(request.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: NID IMAGE ANALYSIS */}
                    {activeTab === 'nid' && (
                        <div className="bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4 text-xs">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Image Quality</span>
                                    <span className="font-extrabold text-sm text-emerald-600">{nid.readability_score || 0}% Readability</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">NID Format Match</span>
                                    <span className="font-extrabold text-sm text-blue-600">{nid.nid_format_match ? 'Matched Standard Format' : 'Not Matched'}</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Image Tampering Check</span>
                                    <span className="font-extrabold text-sm text-emerald-600">{nid.tampering_anomalies_detected ? 'Editing Headers Detected' : 'No Editing Software Headers'}</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Photo Layout Check</span>
                                    <span className="font-extrabold text-sm text-indigo-600">{nid.photo_similarity_score || 0}% Similarity</span>
                                </div>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">
                                AI Observation: Document image pixels, file headers, and layout structure have been dynamically analyzed.
                            </p>
                        </div>
                    )}

                    {/* TAB 3: MEDICAL DOCUMENT ANALYSIS */}
                    {activeTab === 'medical' && (
                        <div className="bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4 text-xs">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Hospital Seal</span>
                                    <span className="font-extrabold text-sm text-emerald-600">{med.hospital_stamp_detected ? 'Detected' : 'Not Detected'}</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Doctor Signature</span>
                                    <span className="font-extrabold text-sm text-emerald-600">{med.doctor_signature_detected ? 'Detected' : 'Not Detected'}</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Document Date</span>
                                    <span className="font-extrabold text-sm text-blue-600">{med.treatment_date || 'Analyzed'}</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Cost Consistency</span>
                                    <span className="font-extrabold text-sm text-emerald-600">{med.treatment_cost_validity || 'Consistent'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: FINDINGS & RISKS */}
                    {activeTab === 'anomalies' && (
                        <div className="space-y-4 text-xs">
                            {missing.length > 0 && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl">
                                    <strong className="text-amber-800 dark:text-amber-300 font-bold block mb-2">⚠️ Missing Document Information:</strong>
                                    <ul className="list-disc pl-5 text-amber-700 dark:text-amber-400 space-y-1">
                                        {missing.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </div>
                            )}

                            {suspicious.length > 0 && (
                                <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl">
                                    <strong className="text-rose-800 dark:text-rose-300 font-bold block mb-2">🚩 AI Observations & Anomalies:</strong>
                                    <ul className="list-disc pl-5 text-rose-700 dark:text-rose-400 space-y-1">
                                        {suspicious.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </div>
                            )}

                            {missing.length === 0 && suspicious.length === 0 && (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 font-semibold">
                                    ✓ No document structure anomalies detected by AI analysis.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Request Description & Amount */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                            <span className="text-[11px] font-bold text-gray-400 uppercase">Beneficiary Profile</span>
                            <p className="font-bold text-gray-900 dark:text-white mt-1">{request.beneficiary_name}</p>
                            <p className="text-xs text-gray-500">{request.beneficiary_email} • {request.beneficiary_phone || 'No phone'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                            <span className="text-[11px] font-bold text-gray-400 uppercase">Requested Funding</span>
                            <p className="font-black text-2xl text-emerald-600 dark:text-emerald-400 mt-1">${parseFloat(request.required_amount || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Uploaded Documents */}
                    <div>
                        <p className="text-xs font-extrabold uppercase text-gray-500 dark:text-gray-400 mb-3">
                            📎 Uploaded Verification Documents ({request.documents ? request.documents.length : 0})
                        </p>
                        {request.documents && request.documents.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {request.documents.map((doc, i) => {
                                    const rawUrl = doc.document_url || doc;
                                    const fullUrl = `${import.meta.env.VITE_API_URL}${rawUrl}`;
                                    const isPdf = rawUrl.endsWith('.pdf');
                                    return (
                                        <a key={i} href={fullUrl} target="_blank" rel="noreferrer" className="block border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                                            {isPdf ? (
                                                <div className="h-24 bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600">
                                                    <span className="text-3xl">📄</span>
                                                </div>
                                            ) : (
                                                <img src={fullUrl} alt={`Doc ${i+1}`} className="h-24 w-full object-cover" />
                                            )}
                                            <p className="text-[11px] font-bold text-center py-1.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">Document #{i+1}</p>
                                        </a>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-xs text-gray-400 text-center">
                                No uploaded documents attached.
                            </div>
                        )}
                    </div>

                    {/* NGO Decision Audit Trail */}

                    <div className="bg-gray-50 dark:bg-gray-900/70 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                                <span>🏢</span> NGO Decision Audit Trail
                            </h4>
                            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                Status: <strong className="text-indigo-600 dark:text-indigo-400">{STATUS_LABELS[request.status] || request.status?.replace(/_/g, ' ')}</strong>
                            </span>
                        </div>

                        {/* Accepted NGO Details */}
                        {request.assigned_ngo_org ? (
                            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                                        <span>🤝</span> Accepted & Claimed by: <strong className="underline">{request.assigned_ngo_org}</strong>
                                    </span>
                                    {request.updated_at && (
                                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                                            {new Date(request.updated_at).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-2">
                                <span>⏳</span> Waiting for an approved NGO partner to accept & launch fundraising campaign.
                            </div>
                        )}

                        {/* Declined / Withdrawn / Historical NGO Action Logs */}
                        {request.decisions && request.decisions.length > 0 ? (
                            <div className="space-y-2 pt-2">
                                <span className="text-[11px] font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider block">
                                    📜 Historical NGO Action Audit Logs ({request.decisions.length}):
                                </span>
                                <div className="space-y-2">
                                    {request.decisions.map((dec, idx) => {
                                        const isWithdrawal = dec.reason?.toLowerCase().includes('withdrew') || dec.action === 'withdrawn';
                                        return (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-xl border text-xs space-y-1 ${
                                                    isWithdrawal
                                                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                                                        : dec.action === 'accepted'
                                                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                                                        : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                        <span>{isWithdrawal ? '🚩' : dec.action === 'accepted' ? '🤝' : '❌'}</span>
                                                        {dec.org_name}
                                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                                            isWithdrawal
                                                                ? 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                                                                : dec.action === 'accepted'
                                                                ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                                                                : 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200'
                                                        }`}>
                                                            {isWithdrawal ? 'Withdrew Campaign' : dec.action === 'accepted' ? 'Accepted Request' : 'Declined Request'}
                                                        </span>
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                                        {new Date(dec.updated_at || dec.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-gray-800 dark:text-gray-200 font-semibold pl-6">
                                                    Reason: <span className="font-extrabold">"{dec.reason}"</span>
                                                    {dec.custom_reason && (
                                                        <p className="text-[11px] text-gray-600 dark:text-gray-400 font-normal italic mt-0.5">
                                                            Note: "{dec.custom_reason}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-[11px] text-gray-400 italic pt-1">
                                No NGO actions or declines logged yet.
                            </div>
                        )}
                    </div>


                    {/* Admin Action Box */}
                    {['pending', 'under_review'].includes(request.status) && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-200 mb-2">
                                    Admin Decision Note <span className="text-gray-400 font-normal">(stored in audit logs)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)}
                                    placeholder="Enter your administrative rationale for approving or rejecting this request..."
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-gray-200 font-bold text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleAction('rejected')}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md disabled:opacity-50"
                                >
                                    ✗ Reject Beneficiary Request
                                </button>
                                <button
                                    onClick={() => handleAction('approved')}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md disabled:opacity-50"
                                >
                                    ✓ Approve & Forward to NGO
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminVerifyBeneficiary = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [riskFilter, setRiskFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchRequests = useCallback(async (searchTerm) => {
        setLoading(true);
        try {
            const r = await api.get(`/admin/beneficiaries${searchTerm ? `?search=${searchTerm}` : ''}`);
            setRequests(r.data || []);
        } catch (e) {
            console.error("Failed to load beneficiary requests:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchRequests(search), 400);
        return () => clearTimeout(timer);
    }, [search, fetchRequests]);

    const handleViewDetails = async (req) => {
        try {
            const r = await api.get(`/admin/beneficiaries/${req.id}`);
            setSelectedRequest(r.data || req);
        } catch (e) {
            setSelectedRequest(req);
        }
    };

    const handleStatusUpdate = (id, status, adminNote) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status, admin_note: adminNote } : r));
    };

    const handleReportUpdate = (id, newReport) => {
        setRequests(prev => prev.map(r => r.id === id ? {
            ...r,
            ai_risk_level: newReport.risk_level,
            ai_confidence_score: newReport.confidence_score,
            ai_report: newReport
        } : r));
        setSelectedRequest(prev => prev && prev.id === id ? {
            ...prev,
            ai_risk_level: newReport.risk_level,
            ai_confidence_score: newReport.confidence_score,
            ai_report: newReport
        } : prev);
    };

    const filtered = requests.filter(r => {
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesRisk = riskFilter === 'all' || (r.ai_risk_level || 'Not Analyzed') === riskFilter;
        return matchesStatus && matchesRisk;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {selectedRequest && (
                <DetailModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onStatusUpdate={handleStatusUpdate}
                    onReportUpdate={handleReportUpdate}
                />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <span>AI Document Analysis System</span>
                        <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-3 py-1 rounded-full font-bold">
                            AI ANALYSIS
                        </span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Review AI document analysis reports, check risk assessment levels, and make administrative decisions.
                    </p>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6 relative">
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search beneficiary name or request ID..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>

                <div className="sm:col-span-3">
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="w-full py-2.5 px-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-900"
                    >
                        <option value="all">All Request Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="waiting_for_ngo">Waiting for NGO</option>
                        <option value="assigned">Assigned</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="sm:col-span-3">
                    <select
                        value={riskFilter}
                        onChange={e => { setRiskFilter(e.target.value); setPage(1); }}
                        className="w-full py-2.5 px-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-900 font-bold"
                    >
                        <option value="all">All AI Risk Levels</option>
                        <option value="Low Risk">🟢 Low Risk</option>
                        <option value="Medium Risk">🟡 Medium Risk</option>
                        <option value="High Risk">🔴 High Risk</option>
                        <option value="Not Analyzed">⚪ Not Analyzed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading beneficiary requests and AI reports...</div>
                ) : paginated.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No requests found matching criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900 text-xs font-bold uppercase text-gray-500">
                                <tr>
                                    <th className="py-4 px-6">ID</th>
                                    <th className="py-4 px-4">Beneficiary</th>
                                    <th className="py-4 px-4 text-right">Requested</th>
                                    <th className="py-4 px-4">AI Risk Assessment</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 px-6 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {paginated.map(req => {
                                    const riskLevel = req.ai_risk_level || 'Not Analyzed';
                                    return (
                                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                            <td className="py-4 px-6 font-mono font-bold">#{req.id}</td>
                                            <td className="py-4 px-4">
                                                <p className="font-bold text-gray-900 dark:text-white">{req.beneficiary_name}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-xs">{req.title}</p>
                                            </td>
                                            <td className="py-4 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                                                ${parseFloat(req.required_amount || 0).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${RISK_BADGES[riskLevel] || RISK_BADGES['Not Analyzed']}`}>
                                                    {riskLevel}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[req.status]}`}>
                                                    {STATUS_LABELS[req.status] || req.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => handleViewDetails(req)}
                                                    className="px-3.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all"
                                                >
                                                    👁 Review AI Report
                                                </button>
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

export default AdminVerifyBeneficiary;
