import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

import { ThemeContext } from '../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatCard = ({ label, value, color = 'text-gray-900 dark:text-white', icon }) => (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xs hover:shadow-md transition-all rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="px-5 py-5 flex items-center justify-between">
            <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className={`mt-1 text-2xl font-black ${color}`}>{value ?? '—'}</dd>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-2xl">
                {icon}
            </div>
        </div>
    </div>
);

const quickLinks = [
    { label: 'Manage Campaigns', href: '/admin/campaigns', icon: '📋' },
    { label: 'Manage Donations', href: '/admin/donations', icon: '💳' },
    { label: 'Manage Events', href: '/admin/events', icon: '📅' },
    { label: 'Manage Users', href: '/admin/users', icon: '👥' },
    { label: 'Manage NGOs', href: '/admin/ngos', icon: '🏢' },
    { label: 'Manage Volunteers', href: '/admin/volunteers', icon: '🙋' },
    { label: 'Verify Beneficiaries', href: '/admin/beneficiaries', icon: '✅' },
    { label: 'System Settings', href: '/admin/settings', icon: '⚙️' },
    { label: 'Contact Messages', href: '/admin/contact-messages', icon: '✉️' },
    { label: 'Export Reports', href: '/admin/reports', icon: '📊' },
];

const AdminDashboard = () => {
    const { isDark } = React.useContext(ThemeContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/admin/stats')
            .then(r => setStats(r.data))
            .catch(e => { console.error(e); setError('Failed to load dashboard data.'); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">Loading Admin Dashboard...</div>;
    if (error) return <div className="p-12 text-center text-rose-500 font-bold">{error}</div>;

    const barData = {
        labels: stats?.donationTrendLabels || ['Jan','Feb','Mar','Apr','May','Jun'],
        datasets: [{
            label: 'Donations ($)',
            data: stats?.donationTrendData || [0,0,0,0,0,0],
            backgroundColor: 'rgba(2, 132, 199, 0.75)',
            hoverBackgroundColor: 'rgba(2, 132, 199, 1)',
            borderColor: '#0284c7',
            borderWidth: 1.5,
            borderRadius: 6,
            categoryPercentage: 0.6,
            barPercentage: 0.7
        }],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                titleColor: isDark ? '#ffffff' : '#0f172a',
                bodyColor: isDark ? '#cbd5e1' : '#334155',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                titleFont: { family: 'Inter', size: 13, weight: '600' },
                bodyFont: { family: 'Inter', size: 12 },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => ` Donations: $${ctx.raw.toFixed(2)}`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: isDark ? '#9ca3af' : '#4b5563', font: { family: 'Inter', size: 12, weight: '500' } }
            },
            y: {
                grid: { color: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)' },
                beginAtZero: true,
                ticks: {
                    color: isDark ? '#9ca3af' : '#4b5563',
                    font: { family: 'Inter', size: 11 },
                    callback: (val) => `$${val}`
                }
            }
        }
    };

    const pieData = {
        labels: ['Donors','Volunteers','NGOs','Beneficiaries'],
        datasets: [{
            label: '# of Users',
            data: [stats?.usersByRole?.donor||0, stats?.usersByRole?.volunteer||0, stats?.usersByRole?.ngo||0, stats?.usersByRole?.beneficiary||0],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: [
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444'
            ],
            borderWidth: 2,
            hoverOffset: 6
        }],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { family: 'Inter', size: 12, weight: '500' },
                    usePointStyle: true,
                    padding: 18
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { family: 'Inter', size: 13, weight: '600' },
                bodyFont: { family: 'Inter', size: 12 },
                padding: 10,
                cornerRadius: 8
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">System Overview</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
                <StatCard label="Total Users" value={stats?.total_users} icon="👤" />
                <StatCard label="Total Campaigns" value={stats?.total_campaigns} icon="📋" />
                <StatCard label="Total Donations" value={`$${parseFloat(stats?.total_donations||0).toFixed(2)}`} color="text-green-600 dark:text-green-400" icon="💰" />
                <StatCard label="Active Volunteers" value={stats?.total_volunteers} icon="🙋" />
                <StatCard label="Total NGOs" value={stats?.total_ngos} color="text-blue-600 dark:text-blue-400" icon="🏢" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Donation Trends (Last 6 Months)</h2>
                    <div className="h-72">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Demographics</h2>
                    <div className="h-72 flex items-center justify-center">
                        <Doughnut data={pieData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Links</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickLinks.map(link => (
                        <Link key={link.href} to={link.href}
                            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl text-center border border-gray-100 dark:border-gray-800 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-all duration-150 group">
                            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{link.icon}</span>
                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary-700 dark:group-hover:text-primary-400">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
