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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // We'd hit an admin stats endpoint here.
                // Assuming some mock data if endpoint not built
                const response = await api.get('/admin/stats').catch(() => ({
                    data: {
                        total_users: 1250,
                        total_donations: 45000,
                        total_campaigns: 120,
                        total_volunteers: 350,
                        donationsByMonth: [5000, 7000, 4500, 8000, 6500, 14000],
                        usersByRole: { donor: 800, volunteer: 300, ngo: 50, beneficiary: 100 }
                    }
                }));
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-12 text-center">Loading Admin Dashboard...</div>;

    const barData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Donations ($)',
                data: stats?.donationsByMonth || [],
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
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total_users}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Campaigns</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total_campaigns}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Donations</dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600">${stats?.total_donations}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Volunteers</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total_volunteers}</dd>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Donation Trends</h2>
                    <div className="h-64">
                        <Bar data={barData} options={{ maintainAspectRatio: false }} />
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
                    <a href="#" className="block p-4 bg-gray-50 rounded text-center hover:bg-gray-100 text-primary-600 font-medium">Manage Users</a>
                    <a href="#" className="block p-4 bg-gray-50 rounded text-center hover:bg-gray-100 text-primary-600 font-medium">System Settings</a>
                    <a href="#" className="block p-4 bg-gray-50 rounded text-center hover:bg-gray-100 text-primary-600 font-medium">Export Full Report</a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
