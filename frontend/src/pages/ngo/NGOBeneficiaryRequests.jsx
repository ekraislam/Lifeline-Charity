import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const NGOBeneficiaryRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/beneficiaries/requests/waiting');
            setRequests(res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleAccept = async (id) => {
        setAccepting(id);
        try {
            await api.post(`/beneficiaries/requests/${id}/accept`);
            setRequests(prev => prev.filter(r => r.id !== id));
            setConfirmId(null);
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to accept request');
        }
        finally { setAccepting(null); }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading waiting requests...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Confirmation Dialog */}
            {confirmId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Accept</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to accept this beneficiary? Once accepted, this beneficiary will be assigned to your NGO and you'll be responsible for creating a fundraising campaign.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmId(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAccept(confirmId)}
                                disabled={accepting === confirmId}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium text-sm disabled:opacity-60"
                            >
                                {accepting === confirmId ? 'Accepting...' : '✓ Yes, Accept'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Beneficiary Help Requests</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            These beneficiaries have been verified by admin and are waiting for an NGO to help them. Accept a request to start a campaign.
                        </p>
                    </div>
                    <button onClick={() => navigate('/ngo/dashboard')} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="text-gray-500 font-medium text-lg">No waiting requests at this time</p>
                    <p className="text-gray-400 text-sm mt-1">All verified beneficiaries have been assigned to NGOs</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="p-5 flex-grow">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                        Verified ✓
                                    </span>
                                    <span className="text-xs text-gray-400">#{req.id}</span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{req.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{req.description}</p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Beneficiary</span>
                                        <span className="font-semibold text-gray-900">{req.beneficiary_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Required Amount</span>
                                        <span className="font-bold text-green-700">৳{parseFloat(req.required_amount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Submitted</span>
                                        <span className="text-gray-700">{new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t bg-gray-50">
                                <button
                                    onClick={() => setConfirmId(req.id)}
                                    disabled={accepting === req.id}
                                    className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm disabled:opacity-60 transition-colors"
                                >
                                    {accepting === req.id ? 'Accepting...' : '🤝 Accept & Take Responsibility'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NGOBeneficiaryRequests;
