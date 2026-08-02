import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
    restricted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500'
};

const AdminManageVolunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchVolunteers = async () => {
        setLoading(true);
        try {
            const r = await api.get('/admin/volunteers');
            setVolunteers(r.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchVolunteers(); }, []);

    const handleStatus = async (id, status) => {
        setActionLoading(id + status);
        try {
            await api.put(`/admin/volunteers/${id}/status`, { status });
            setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status } : v));
        } catch (e) { alert('Failed to update status'); }
        finally { setActionLoading(null); }
    };

    const filteredVolunteers = filterStatus === 'all' 
        ? volunteers 
        : volunteers.filter(v => v.status === filterStatus);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Volunteers</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Approve applications and manage volunteer accounts.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Filter:</label>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="restricted">Restricted</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading volunteers...</div>
            ) : filteredVolunteers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center text-gray-400">
                    <div className="text-5xl mb-3">🙋‍♂️</div>
                    <p className="font-medium">No volunteers found</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Volunteer Info</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Skills & Availability</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Registered</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100">
                                {filteredVolunteers.map(v => (
                                    <tr key={v.id} className="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{v.user_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{v.email}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{v.phone || 'No phone'}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-gray-800 dark:text-gray-100"><span className="font-medium">Skills:</span> {v.skills || 'Not specified'}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Time:</span> {v.availability || 'Not specified'}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[v.status] || 'bg-gray-100 dark:bg-gray-700'}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {new Date(v.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {v.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleStatus(v.id, 'approved')} disabled={actionLoading} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium">✓ Approve</button>
                                                        <button onClick={() => handleStatus(v.id, 'rejected')} disabled={actionLoading} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-medium">✗ Reject</button>
                                                    </>
                                                )}
                                                {v.status !== 'restricted' ? (
                                                    <button onClick={() => handleStatus(v.id, 'restricted')} disabled={actionLoading} className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 font-medium">🚫 Restrict</button>
                                                ) : (
                                                    <button onClick={() => handleStatus(v.id, 'approved')} disabled={actionLoading} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium">✅ Unrestrict</button>
                                                )}
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

export default AdminManageVolunteers;
