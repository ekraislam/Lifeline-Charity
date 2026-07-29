import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    waiting_for_ngo: 'bg-purple-100 text-purple-800',
    assigned: 'bg-indigo-100 text-indigo-800',
    campaign_active: 'bg-green-100 text-green-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    fulfilled: 'bg-emerald-100 text-emerald-800',
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

const PAGE_SIZE = 10;

const DetailModal = ({ request, onClose, onStatusUpdate }) => {
    const [adminNote, setAdminNote] = useState(request.admin_note || '');
    const [loading, setLoading] = useState(false);

    const handleAction = async (status) => {
        setLoading(true);
        try {
            await api.put(`/admin/beneficiaries/${request.id}/status`, { status, adminNote });
            onStatusUpdate(request.id, status === 'approved' ? 'waiting_for_ngo' : status, adminNote);
            onClose();
        } catch (e) { alert('Failed to update status'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{request.title}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Request #{request.id} · Submitted {new Date(request.created_at).toLocaleString()}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Beneficiary</p>
                            <p className="font-semibold text-gray-900">{request.beneficiary_name}</p>
                            <p className="text-sm text-gray-600">{request.beneficiary_email}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Required Amount</p>
                            <p className="font-semibold text-green-700 text-xl">${parseFloat(request.required_amount || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Current Status</p>
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-800'}`}>
                                {STATUS_LABELS[request.status] || request.status}
                            </span>
                        </div>
                        {request.assigned_ngo_org && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Assigned NGO</p>
                                <p className="font-semibold text-indigo-700">{request.assigned_ngo_org}</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Request Description</p>
                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">{request.description || 'No description provided.'}</div>
                    </div>

                    {/* Documents */}
                    {request.documents && request.documents.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">📎 Uploaded Documents ({request.documents.length})</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {request.documents.map((doc, i) => {
                                    const url = `http://localhost:5000${doc.document_url || doc}`;
                                    const isPdf = url.endsWith('.pdf');
                                    return (
                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                            {isPdf ? (
                                                <div className="h-24 bg-red-50 flex items-center justify-center text-red-600">
                                                    <span className="text-3xl">📄</span>
                                                </div>
                                            ) : (
                                                <img src={url} alt={`Doc ${i+1}`} className="h-24 w-full object-cover" />
                                            )}
                                            <p className="text-xs text-center py-1 text-gray-500">Document {i+1}</p>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Only show admin actions for pending/under_review requests */}
                    {['pending', 'under_review'].includes(request.status) && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Admin Note <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)}
                                    placeholder="Add a note about your decision..."
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm">
                                    Close
                                </button>
                                <button
                                    onClick={() => handleAction('rejected')}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium text-sm disabled:opacity-60"
                                >
                                    ✗ Reject
                                </button>
                                <button
                                    onClick={() => handleAction('approved')}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium text-sm disabled:opacity-60"
                                >
                                    ✓ Approve & Send to NGO
                                </button>
                            </div>
                        </>
                    )}

                    {!['pending', 'under_review'].includes(request.status) && (
                        <div className="flex justify-end pt-2">
                            <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm">
                                Close
                            </button>
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
    const [page, setPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchRequests = useCallback(async (searchTerm) => {
        setLoading(true);
        try {
            const r = await api.get(`/admin/beneficiaries${searchTerm ? `?search=${searchTerm}` : ''}`);
            setRequests(r.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
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

    const filtered = requests.filter(r => statusFilter === 'all' || r.status === statusFilter);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {selectedRequest && (
                <DetailModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Verify Beneficiaries</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Review help requests, verify documents, and approve/reject. Approved requests go to NGOs for assignment.
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
                <strong>ℹ️ Workflow:</strong> Pending → Admin Approves → Waiting for NGO → NGO Accepts → Assigned → Campaign Created → Fulfilled
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by beneficiary name or request ID..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="waiting_for_ngo">Waiting for NGO</option>
                    <option value="assigned">Assigned</option>
                    <option value="campaign_active">Campaign Active</option>
                    <option value="rejected">Rejected</option>
                    <option value="fulfilled">Fulfilled</option>
                </select>
            </div>

            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mb-5">
                {['pending','waiting_for_ngo','assigned','campaign_active','rejected','fulfilled'].map(s => {
                    const count = requests.filter(r => r.status === s).length;
                    if (count === 0) return null;
                    return (
                        <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${STATUS_COLORS[s]} hover:opacity-80`}>
                            {STATUS_LABELS[s]}: {count}
                        </button>
                    );
                })}
                <button onClick={() => { setStatusFilter('all'); setPage(1); }}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">
                    All: {requests.length}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading beneficiary requests...</div>
            ) : paginated.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                    <div className="text-5xl mb-3">✅</div>
                    <p className="font-medium">No requests found</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['ID','Beneficiary','Amount','Status','Assigned NGO','Submitted','Action'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {paginated.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-500">#{req.id}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-gray-900">{req.beneficiary_name}</p>
                                            <p className="text-xs text-gray-500">{req.title}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-green-700">
                                            ${parseFloat(req.required_amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {STATUS_LABELS[req.status] || req.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {req.assigned_ngo_org || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleViewDetails(req)}
                                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                            >
                                                👁 View & Decide
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-600">
                            Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                                className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-100 disabled:opacity-40">← Prev</button>
                            <span className="px-3 py-1.5 text-sm font-medium">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                                className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-100 disabled:opacity-40">Next →</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerifyBeneficiary;
