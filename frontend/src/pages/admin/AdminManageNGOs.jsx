import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

const AdminManageNGOs = () => {
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchNGOs = async () => {
        setLoading(true);
        try {
            const r = await api.get('/admin/ngos');
            setNgos(r.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNGOs(); }, []);

    const handleStatus = async (id, status) => {
        setActionLoading(id + status);
        try {
            await api.put(`/admin/ngos/${id}/status`, { status });
            setNgos(prev => prev.map(n => n.id === id ? { ...n, status } : n));
        } catch (e) { alert('Failed to update NGO status'); }
        finally { setActionLoading(null); }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage NGOs</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Approve or reject NGO accounts. Approved NGOs can create campaigns and perform all NGO tasks.
                    Pending/rejected NGOs cannot log in.
                </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                <strong>ℹ️ Note:</strong> NGOs with "Pending" or "Rejected" status cannot log in to the platform.
                Only "Approved" NGOs have full access.
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading NGOs...</div>
            ) : ngos.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                    <div className="text-5xl mb-3">🏢</div>
                    <p className="font-medium">No NGOs registered yet</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Org Name','Registration No.','Contact Name','Email','Status','Registered','Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {ngos.map(ngo => (
                                    <tr key={ngo.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-gray-900">{ngo.org_name}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{ngo.registration_number || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{ngo.user_name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{ngo.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[ngo.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {ngo.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(ngo.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {ngo.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleStatus(ngo.id, 'approved')}
                                                        disabled={actionLoading === ngo.id + 'approved'}
                                                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                )}
                                                {ngo.status !== 'rejected' && (
                                                    <button
                                                        onClick={() => handleStatus(ngo.id, 'rejected')}
                                                        disabled={actionLoading === ngo.id + 'rejected'}
                                                        className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                                                    >
                                                        ✗ Reject
                                                    </button>
                                                )}
                                                {ngo.status !== 'pending' && (
                                                    <button
                                                        onClick={() => handleStatus(ngo.id, 'pending')}
                                                        disabled={actionLoading === ngo.id + 'pending'}
                                                        className="px-3 py-1.5 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium disabled:opacity-50"
                                                    >
                                                        ⏳ Set Pending
                                                    </button>
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

export default AdminManageNGOs;
