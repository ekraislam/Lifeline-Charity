import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatCard = ({ label, value, color = 'text-gray-900', icon }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="px-4 py-5 sm:p-6 flex items-center justify-between">
            <div>
                <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
                <dd className={`mt-1 text-3xl font-bold ${color}`}>{value ?? '—'}</dd>
            </div>
            <div className="text-3xl opacity-20">{icon}</div>
        </div>
    </div>
);

const quickLinks = [
    { label: 'Manage Campaigns', href: '/admin/campaigns', icon: '📋' },
    { label: 'Manage Events', href: '/admin/events', icon: '📅' },
    { label: 'Manage Users', href: '/admin/users', icon: '👥' },
    { label: 'Manage NGOs', href: '/admin/ngos', icon: '🏢' },
    { label: 'Manage Volunteers', href: '/admin/volunteers', icon: '🙋' },
    { label: 'Verify Beneficiaries', href: '/admin/beneficiaries', icon: '✅' },
    { label: 'System Settings', href: '/admin/settings', icon: '⚙️' },
    { label: 'Export Reports', href: '/admin/reports', icon: '📊' },
];

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/admin/stats')
            .then(r => setStats(r.data))
            .catch(e => { console.error(e); setError('Failed to load dashboard data.'); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Admin Dashboard...</div>;
    if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

    const barData = {
        labels: stats?.donationTrendLabels || ['Jan','Feb','Mar','Apr','May','Jun'],
        datasets: [{ label: 'Donations ($)', data: stats?.donationTrendData || [], backgroundColor: 'rgba(14,165,233,0.5)', borderColor: 'rgb(14,165,233)', borderWidth: 1 }],
    };

    const pieData = {
        labels: ['Donors','Volunteers','NGOs','Beneficiaries'],
        datasets: [{
            label: '# of Users',
            data: [stats?.usersByRole?.donor||0, stats?.usersByRole?.volunteer||0, stats?.usersByRole?.ngo||0, stats?.usersByRole?.beneficiary||0],
            backgroundColor: ['rgba(59,130,246,0.6)','rgba(16,185,129,0.6)','rgba(245,158,11,0.6)','rgba(239,68,68,0.6)'],
            borderColor: ['rgb(59,130,246)','rgb(16,185,129)','rgb(245,158,11)','rgb(239,68,68)'],
            borderWidth: 1,
        }],
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">System Overview</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
                <StatCard label="Total Users" value={stats?.total_users} icon="👤" />
                <StatCard label="Total Campaigns" value={stats?.total_campaigns} icon="📋" />
                <StatCard label="Total Donations" value={`$${parseFloat(stats?.total_donations||0).toFixed(2)}`} color="text-green-600" icon="💰" />
                <StatCard label="Active Volunteers" value={stats?.total_volunteers} icon="🙋" />
                <StatCard label="Total NGOs" value={stats?.total_ngos} color="text-blue-600" icon="🏢" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation Trends (Last 6 Months)</h2>
                    <div className="h-64">
                        {(stats?.donationTrendData||[]).every(v=>v===0) ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <span className="text-4xl mb-2">📈</span>
                                <p className="text-sm">No donations recorded yet</p>
                            </div>
                        ) : (
                            <Bar data={barData} options={{ maintainAspectRatio: false }} />
                        )}
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h2>
                    <div className="h-64 flex justify-center">
                        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {quickLinks.map(link => (
                        <Link key={link.href} to={link.href}
                            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg text-center hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{link.icon}</span>
                            <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
