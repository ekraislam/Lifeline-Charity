import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleExport = async () => {
        try {
            const response = await api.get('/admin/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'lifeline_system_report.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to export report.");
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);
            } catch (err) {
                console.error("Error fetching stats", err);
                setError("Failed to load dashboard data. Please try refreshing.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Admin Dashboard...</div>;
    if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

    const barData = {
        labels: stats?.donationTrendLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Donations ($)',
                data: stats?.donationTrendData || [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(14, 165, 233, 0.5)',
                borderColor: 'rgb(14, 165, 233)',
                borderWidth: 1,
            },
        ],
    };

    const pieData = {
        labels: ['Donors', 'Volunteers', 'NGOs', 'Beneficiaries'],
        datasets: [
            {
                label: '# of Users',
                data: [
                    stats?.usersByRole?.donor || 0,
                    stats?.usersByRole?.volunteer || 0,
                    stats?.usersByRole?.ngo || 0,
                    stats?.usersByRole?.beneficiary || 0,
                ],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(16, 185, 129, 0.5)',
                    'rgba(245, 158, 11, 0.5)',
                    'rgba(239, 68, 68, 0.5)',
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">System Overview</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total_users ?? '—'}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Campaigns</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total_campaigns ?? '—'}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Donations</dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600">${parseFloat(stats?.total_donations || 0).toFixed(2)}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Volunteers</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total_volunteers ?? '—'}</dd>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Donation Trends</h2>
                    <div className="h-64">
                        {(stats?.donationTrendData || []).every(v => v === 0) ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-sm">No donations recorded yet</p>
                                <p className="text-xs mt-1">Data will appear once donations are made</p>
                            </div>
                        ) : (
                            <Bar data={barData} options={{ maintainAspectRatio: false }} />
                        )}
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">User Demographics</h2>
                    <div className="h-64 flex justify-center">
                        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <a href="/admin/campaigns" className="block p-4 bg-gray-50 rounded text-center hover:bg-gray-100 text-primary-600 font-medium">Manage Campaigns</a>
                    <a href="/admin/users" className="block p-4 bg-gray-50 rounded text-center hover:bg-gray-100 text-primary-600 font-medium">Manage Users</a>
                    <a href="/admin/settings" className="block p-4 bg-gray-50 rounded text-center hover:bg-gray-100 text-primary-600 font-medium">System Settings</a>
                    <button onClick={handleExport} className="block p-4 bg-gray-50 rounded text-center hover:bg-gray-100 text-primary-600 font-medium w-full">Export Full Report</button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
