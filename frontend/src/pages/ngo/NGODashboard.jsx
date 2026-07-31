import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios?v=1';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const STATUS_BADGE = {
    assigned: 'bg-indigo-100 text-indigo-800',
    campaign_active: 'bg-green-100 text-green-800',
    fulfilled: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-emerald-100 text-emerald-800',
};

const NGODashboard = () => {
    const [assignedBeneficiaries, setAssignedBeneficiaries] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assignedRes, campaignsRes] = await Promise.allSettled([
                    api.get('/beneficiaries/requests/my-assigned'),
                    api.get('/campaigns')
                ]);
                
                setAssignedBeneficiaries(assignedRes.status === 'fulfilled' ? assignedRes.value.data : []);
                setCampaigns(campaignsRes.status === 'fulfilled' ? campaignsRes.value.data : []);
            } catch (error) {
                console.error("Error fetching NGO data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalRaised = campaigns.reduce((sum, c) => sum + parseFloat(c.raised_amount || 0), 0);

    const generateReport = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text('NGO Progress Report', 14, 22);
            doc.setFontSize(12);
            doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 32);
            doc.text(`Total Campaigns: ${campaigns.length}`, 14, 45);
            doc.text(`Total Raised: $${totalRaised.toLocaleString()}`, 14, 52);
            doc.text(`Assigned Beneficiaries: ${assignedBeneficiaries.length}`, 14, 59);

            const tableColumn = ["ID", "Title", "Goal ($)", "Raised ($)", "Status"];
            const tableRows = campaigns.map(c => [c.id, c.title, c.goal_amount || 0, c.raised_amount || 0, c.status]);
            autoTable(doc, { head: [tableColumn], body: tableRows, startY: 70 });
            doc.save('NGO_Progress_Report.pdf');
        } catch (err) {
            console.error("Failed to generate PDF report", err);
            alert("Could not generate report. Please try again.");
        }
    };

    if (loading) return <div className="p-12 text-center">Loading dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NGO Dashboard</h1>
                <div className="flex gap-3">
                    <button onClick={generateReport}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900">
                        📄 Export Report
                    </button>
                    <Link to="/campaigns/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                        ➕ Create Campaign
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">My Campaigns</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{campaigns.length}</dd>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Funds Raised</dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600">${totalRaised.toLocaleString()}</dd>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Assigned Beneficiaries</dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">{assignedBeneficiaries.length}</dd>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6 flex flex-col gap-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate mb-1">Quick Actions</dt>
                        <Link to="/ngo/beneficiary-requests"
                            className="inline-flex items-center px-3 py-1.5 border border-primary-500 text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100">
                            🔍 Browse Waiting Requests
                        </Link>
                        <Link to="/ngo/events"
                            className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100">
                            📅 Manage Events
                        </Link>
                    </div>
                </div>
            </div>

            {/* Assigned Beneficiaries */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">👥 My Assigned Beneficiaries</h2>
                    <Link to="/ngo/beneficiary-requests" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Browse more →
                    </Link>
                </div>

                {assignedBeneficiaries.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
                        <div className="text-4xl mb-3">🏢</div>
                        <p className="text-gray-500 dark:text-gray-400">No beneficiaries assigned yet.</p>
                        <Link to="/ngo/beneficiary-requests" className="mt-3 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
                            Browse Waiting Requests
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assignedBeneficiaries.map(req => (
                            <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[req.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                                        {req.status === 'assigned' ? '📋 Assigned' : req.status === 'campaign_active' ? '📢 Campaign Active' : '✅ Fulfilled'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{req.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{req.beneficiary_name} · {req.beneficiary_email}</p>
                                <p className="text-sm font-medium text-green-700 mb-3">${parseFloat(req.required_amount || 0).toLocaleString()} needed</p>
                                
                                {req.status === 'assigned' && !req.has_campaign ? (
                                    <button
                                        onClick={() => navigate(`/campaigns/create?help_request_id=${req.id}&title=${encodeURIComponent(req.title)}&amount=${req.required_amount}`)}
                                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                                    >
                                        🚀 Create Campaign
                                    </button>
                                ) : req.status === 'campaign_active' ? (
                                    <div className="text-center text-sm text-green-600 font-medium py-2 bg-green-50 rounded-lg">
                                        Campaign is running
                                    </div>
                                ) : req.status === 'fulfilled' ? (
                                    <div className="text-center text-sm text-emerald-600 font-medium py-2 bg-emerald-50 rounded-lg">
                                        ✅ Completed
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Campaign Management */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📢 My Campaigns</h2>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md mb-8">
                {campaigns.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">No campaigns yet. Accept a beneficiary and create a campaign!</div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {campaigns.map((campaign) => (
                            <li key={campaign.id}>
                                <div className="px-4 py-4 flex items-center sm:px-6 justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-primary-600 truncate">{campaign.title}</p>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <span className="mr-4">Raised: ${parseFloat(campaign.raised_amount || 0).toLocaleString()} / ${parseFloat(campaign.goal_amount || 0).toLocaleString()}</span>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${STATUS_BADGE[campaign.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                                                {campaign.status}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/campaigns/${campaign.id}`}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900"
                                    >
                                        View
                                    </Link>
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
