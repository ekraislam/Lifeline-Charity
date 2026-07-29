import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminCampaignApproval = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchPendingCampaigns();
    }, []);

    const fetchPendingCampaigns = async () => {
        try {
            const response = await api.get('/admin/campaigns?status=pending');
            setCampaigns(response.data.campaigns || []);
        } catch (error) {
            console.error("Error fetching campaigns", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        setActionLoading(id);
        try {
            await api.put(`/campaigns/${id}/status`, { status });
            // Remove from list after action
            setCampaigns(campaigns.filter(c => c.id !== id));
        } catch (error) {
            console.error(`Error updating status to ${status}`, error);
            alert(`Failed to ${status} campaign`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading pending campaigns...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Pending Campaigns Approval</h1>

            {campaigns.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No pending campaigns found.
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {campaigns.map((campaign) => (
                            <li key={campaign.id}>
                                <div className="px-4 py-4 flex items-center sm:px-6">
                                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div className="truncate">
                                            <div className="flex text-sm">
                                                <p className="font-medium text-primary-600 truncate">{campaign.title}</p>
                                                <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                                    in Category {campaign.category_id}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    Target: ${campaign.goal_amount}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 flex space-x-2">
                                            <button
                                                onClick={() => handleAction(campaign.id, 'approved')}
                                                disabled={actionLoading === campaign.id}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(campaign.id, 'rejected')}
                                                disabled={actionLoading === campaign.id}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdminCampaignApproval;
