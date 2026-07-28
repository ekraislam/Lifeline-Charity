import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

const NGODashboard = () => {
    const [stats, setStats] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNGOData = async () => {
            try {
                // Assuming we can fetch campaigns by the logged-in NGO
                const [campaignsRes] = await Promise.all([
                    api.get('/campaigns/search?ngo_id=me') // pseudo endpoint to fetch own campaigns
                ]);
                
                // Mock stats for demonstration
                setStats({
                    total_campaigns: campaignsRes.data?.campaigns?.length || 0,
                    total_donations: 12500,
                    active_volunteers: 45
                });
                
                setCampaigns(campaignsRes.data?.campaigns || []);
            } catch (error) {
                console.error("Error fetching NGO dashboard data", error);
                // Mock data for fallback during dev
                setStats({ total_campaigns: 2, total_donations: 5000, active_volunteers: 10 });
                setCampaigns([
                    { id: 1, title: 'Clean Water Initiative', target_amount: 10000, current_amount: 5000, status: 'approved' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchNGOData();
    }, []);

    const generateReport = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('NGO Progress Report', 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 32);

        // Stats summary
        doc.text(`Total Campaigns: ${stats?.total_campaigns}`, 14, 45);
        doc.text(`Total Donations Raised: $${stats?.total_donations}`, 14, 52);
        doc.text(`Active Volunteers: ${stats?.active_volunteers}`, 14, 59);

        // Campaigns table
        const tableColumn = ["Campaign ID", "Title", "Target ($)", "Raised ($)", "Status"];
        const tableRows = [];

        campaigns.forEach(campaign => {
            const campaignData = [
                campaign.id,
                campaign.title,
                campaign.target_amount,
                campaign.current_amount,
                campaign.status
            ];
            tableRows.push(campaignData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 70,
        });

        doc.save('NGO_Progress_Report.pdf');
    };

    if (loading) return <div className="p-12 text-center">Loading dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
                <div className="space-x-4">
                    <button
                        onClick={generateReport}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Export Report (PDF)
                    </button>
                    <Link
                        to="/campaigns/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Create Campaign
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">My Campaigns</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total_campaigns}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Funds Raised</dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600">${stats?.total_donations}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Volunteers Engaged</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.active_volunteers}</dd>
                    </div>
                </div>
            </div>

            {/* Campaign Management */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Campaigns</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
                {campaigns.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No campaigns found. Create one to get started!</div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {campaigns.map((campaign) => (
                            <li key={campaign.id}>
                                <div className="px-4 py-4 flex items-center sm:px-6 justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-primary-600 truncate">{campaign.title}</p>
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <span className="mr-4">Raised: ${campaign.current_amount} / ${campaign.target_amount}</span>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize 
                                                ${campaign.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                                campaign.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {campaign.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/campaigns/${campaign.id}`}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                        >
                                            View
                                        </Link>
                                        {/* Edit functionality would go here */}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NGODashboard;
