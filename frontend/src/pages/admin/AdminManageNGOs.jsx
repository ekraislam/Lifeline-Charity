import React, { useState, useEffect } from 'react';
import api, { getMediaUrl } from '../../api/axios?v=1';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

const AdminManageNGOs = () => {
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [viewDocsNgo, setViewDocsNgo] = useState(null);

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage NGOs</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Approve or reject NGO accounts. Approved NGOs can create campaigns and perform all NGO tasks.
                    Pending/rejected NGOs cannot log in.
                </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                <strong>ℹ️ Note:</strong> NGOs with "Pending" or "Rejected" status cannot log in to the platform.
                Only "Approved" NGOs have full access.
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading NGOs...</div>
            ) : ngos.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center text-gray-400">
                    <div className="text-5xl mb-3">🏢</div>
                    <p className="font-medium">No NGOs registered yet</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    {['Org Name','Registration No.','Contact Name','Email','Status','Registered','Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100">
                                {ngos.map(ngo => (
                                    <tr key={ngo.id} className="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{ngo.org_name}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{ngo.registration_number || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{ngo.user_name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{ngo.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[ngo.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                                                {ngo.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
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
                                                <button
                                                    onClick={() => setViewDocsNgo(ngo)}
                                                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                                >
                                                    📄 Docs
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            {viewDocsNgo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Proof Documents: {viewDocsNgo.org_name}
                            </h3>
                            <button onClick={() => setViewDocsNgo(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {viewDocsNgo.documents && (typeof viewDocsNgo.documents === 'string' ? JSON.parse(viewDocsNgo.documents) : viewDocsNgo.documents).length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(typeof viewDocsNgo.documents === 'string' ? JSON.parse(viewDocsNgo.documents) : viewDocsNgo.documents).map((doc, idx) => (
                                        <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                            <a href={getMediaUrl(doc)} target="_blank" rel="noopener noreferrer">
                                                <img src={getMediaUrl(doc)} alt={`Document ${idx+1}`} className="w-full h-auto object-contain hover:opacity-90 transition-opacity bg-gray-50 dark:bg-gray-900" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">No proof documents were uploaded by this NGO.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageNGOs;
