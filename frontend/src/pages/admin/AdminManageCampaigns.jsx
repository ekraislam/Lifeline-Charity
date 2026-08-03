import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100',
};

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center mb-4">
                <div className="text-4xl mb-2">⚠️</div>
                <p className="text-gray-700 dark:text-gray-200 font-medium">{message}</p>
            </div>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:bg-gray-700 font-medium">Cancel</button>
                <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Confirm</button>
            </div>
        </div>
    </div>
);

const EditModal = ({ campaign, onSave, onClose }) => {
    const [form, setForm] = useState({ ...campaign });
    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-lg w-full">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Campaign</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
                        <input name="title" value={form.title||''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
                        <textarea name="description" rows={3} value={form.description||''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Goal Amount ($)</label>
                            <input name="goal_amount" type="number" value={form.goal_amount||''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                            <select name="status" value={form.status||''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:bg-gray-700 font-medium">Cancel</button>
                    <button onClick={() => onSave(form)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const AdminManageCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchCampaigns = async (status = 'all') => {
        setLoading(true);
        try {
            const r = await api.get(`/admin/campaigns?status=${status}`);
            setCampaigns(r.data.campaigns || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCampaigns(statusFilter); }, [statusFilter]);

    const handleStatus = async (id, status) => {
        setActionLoading(id + status);
        try {
            await api.put(`/admin/campaigns/${id}/status`, { status });
            setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        } catch (e) { alert('Failed to update status'); }
        finally { setActionLoading(null); }
    };

    const handleEdit = async (form) => {
        try {
            await api.put(`/admin/campaigns/${form.id}`, form);
            setCampaigns(prev => prev.map(c => c.id === form.id ? { ...c, ...form } : c));
            setEditTarget(null);
        } catch (e) { alert(e.response?.data?.message || 'Failed to update campaign'); }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/campaigns/${deleteTarget}`);
            setCampaigns(prev => prev.filter(c => c.id !== deleteTarget));
            setDeleteTarget(null);
        } catch (e) { alert('Failed to delete campaign'); }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {editTarget && <EditModal campaign={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} />}
            {deleteTarget && (
                <ConfirmDialog
                    message="Are you sure you want to delete this campaign? This action cannot be undone."
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Campaigns</h1>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Filter by Status:</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center text-gray-400">
                    <div className="text-5xl mb-3">📋</div>
                    <p className="font-medium">No campaigns found</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    {['Title','NGO','Category','Goal','Raised','Status','Created','Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100">
                                {campaigns.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white max-w-[180px] truncate" title={c.title}>{c.title}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.ngo_name || c.ngo_user_name || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.category_name || '—'}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">${parseFloat(c.goal_amount||0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-green-700 whitespace-nowrap">${parseFloat(c.raised_amount||0).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[c.status]||'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {c.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleStatus(c.id, 'approved')} disabled={actionLoading} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium">✓ Approve</button>
                                                        <button onClick={() => handleStatus(c.id, 'rejected')} disabled={actionLoading} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-medium">✗ Reject</button>
                                                    </>
                                                )}
                                                <button onClick={() => setEditTarget(c)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">✏️ Edit</button>
                                                <button onClick={() => setDeleteTarget(c.id)} className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 font-medium">🗑 Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageCampaigns;
