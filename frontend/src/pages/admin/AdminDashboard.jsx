import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ThemeContext } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Sparkline = ({ color = '#0ea5e9', points = '0,25 15,18 30,22 45,10 60,14 75,5 90,8', id }) => (
    <div className="w-20 h-10 shrink-0">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 90 30">
            <defs>
                <linearGradient id={`sparkline-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                </linearGradient>
            </defs>
            <polygon
                points={`0,30 ${points} 90,30`}
                fill={`url(#sparkline-grad-${id})`}
            />
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    </div>
);

const StatCard = ({ id, label, value, subtitle, trend = '▲ +12.4%', colorGrad = 'from-sky-500 to-blue-600', strokeColor = '#0ea5e9', sparklinePoints, icon }) => (
    <div className="group relative overflow-hidden rounded-[18px] bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-gray-800/80 p-6 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between space-y-4">

        {/* Top Glow Accent */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-sky-500/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

        {/* Header Row: Animated Icon + Sparkline */}
        <div className="flex items-center justify-between relative z-10">
            <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${colorGrad} flex items-center justify-center text-xl text-white shadow-md shadow-sky-500/15 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0`}>
                {icon}
            </div>
            <Sparkline color={strokeColor} points={sparklinePoints} id={id} />
        </div>

        {/* Middle Row: Label & Big Bold Number */}
        <div className="space-y-1 relative z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">{label}</span>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value ?? '—'}</div>
        </div>

        {/* Bottom Row: Trend Pill & Subtitle */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/80 text-xs relative z-10">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {trend}
            </span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 truncate max-w-[120px] text-right">{subtitle || 'vs last month'}</span>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { isDark } = React.useContext(ThemeContext);
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/admin/stats')
            .then(r => setStats(r.data))
            .catch(e => { console.error(e); setError(t('common.error')); })
            .finally(() => setLoading(false));
    }, []);

    const quickLinks = [
        { label: t('admin.manageCampaigns'), href: '/admin/campaigns', icon: '📋', grad: 'from-sky-500 to-blue-600' },
        { label: t('admin.manageDonations'), href: '/admin/donations', icon: '💳', grad: 'from-emerald-500 to-teal-600' },
        { label: t('admin.manageEvents'),    href: '/admin/events',   icon: '📅', grad: 'from-violet-500 to-purple-600' },
        { label: t('admin.manageUsers'),     href: '/admin/users',    icon: '👥', grad: 'from-indigo-500 to-blue-600' },
        { label: t('admin.manageNGOs'),      href: '/admin/ngos',     icon: '🏢', grad: 'from-amber-500 to-orange-600' },
        { label: t('admin.manageVolunteers'),href: '/admin/volunteers',icon: '🙋', grad: 'from-rose-500 to-pink-600' },
        { label: t('admin.verifyBeneficiary'),href: '/admin/beneficiaries',icon: '✅', grad: 'from-teal-500 to-emerald-600' },
        { label: t('admin.systemSettings'), href: '/admin/settings', icon: '⚙️', grad: 'from-gray-600 to-slate-700' },
        { label: t('admin.contactMessages'),href: '/admin/contact-messages',icon: '✉️', grad: 'from-cyan-500 to-blue-600' },
        { label: t('admin.exportReports'),  href: '/admin/reports',  icon: '📊', grad: 'from-fuchsia-500 to-pink-600' },
    ];

    if (loading) return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map(n => <div key={n} className="skeleton-pulse h-40 w-full rounded-[18px]" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="skeleton-pulse h-80 w-full rounded-[18px]" />
                <div className="skeleton-pulse h-80 w-full rounded-[18px]" />
            </div>
        </div>
    );

    if (error) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-rose-500 font-bold">{error}</div>;

    const barData = {
        labels: stats?.donationTrendLabels || ['Jan','Feb','Mar','Apr','May','Jun'],
        datasets: [{
            label: 'Donations ($)',
            data: stats?.donationTrendData || [0,0,0,0,0,0],
            backgroundColor: 'rgba(14, 165, 233, 0.85)',
            hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
            borderColor: '#0ea5e9',
            borderWidth: 0,
            borderRadius: 8,
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
                backgroundColor: isDark ? '#111827' : '#ffffff',
                titleColor: isDark ? '#ffffff' : '#0f172a',
                bodyColor: isDark ? '#cbd5e1' : '#334155',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                borderWidth: 1,
                titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: '700' },
                bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
                padding: 12,
                cornerRadius: 12,
                callbacks: {
                    label: (ctx) => ` Donations: $${ctx.raw.toLocaleString()}`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
            },
            y: {
                grid: { color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(241, 245, 249, 0.9)' },
                beginAtZero: true,
                ticks: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    font: { family: 'Plus Jakarta Sans', size: 11 },
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
                '#0ea5e9',
                '#10b981',
                '#f59e0b',
                '#f43f5e'
            ],
            borderWidth: 0,
            hoverOffset: 8
        }],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
                    usePointStyle: true,
                    padding: 16,
                    color: isDark ? '#cbd5e1' : '#334155'
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                titleColor: isDark ? '#ffffff' : '#0f172a',
                bodyColor: isDark ? '#cbd5e1' : '#334155',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/70 dark:bg-[#0B1220] transition-colors duration-200">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.dashboard')}</h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time platform analytics, user acquisition, and financial KPIs</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            Live Analytics
                        </span>
                    </div>
                </div>

                {/* Modern SaaS KPI Analytics Cards (32px section gap, 24px padding inside, 18px border radius) */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <StatCard
                        id="users"
                        label={t('admin.stats.totalUsers')}
                        value={stats?.total_users?.toLocaleString()}
                        subtitle="Registered Accounts"
                        trend="▲ +14.2%"
                        icon="👤"
                        colorGrad="from-sky-500 to-blue-600"
                        strokeColor="#0ea5e9"
                        sparklinePoints="0,25 15,18 30,22 45,10 60,14 75,5 90,8"
                    />
                    <StatCard
                        id="campaigns"
                        label={t('admin.manageCampaigns')}
                        value={stats?.total_campaigns?.toLocaleString()}
                        subtitle="Platform Causes"
                        trend="▲ +8.7%"
                        icon="📋"
                        colorGrad="from-indigo-500 to-purple-600"
                        strokeColor="#6366f1"
                        sparklinePoints="0,20 15,15 30,25 45,12 60,18 75,6 90,10"
                    />
                    <StatCard
                        id="donations"
                        label={t('admin.stats.totalAmount')}
                        value={`$${parseFloat(stats?.total_donations||0).toLocaleString(undefined, {minimumFractionDigits: 2})}`}
                        subtitle="Raised Funding"
                        trend="▲ +21.5%"
                        icon="💰"
                        colorGrad="from-emerald-500 to-teal-600"
                        strokeColor="#10b981"
                        sparklinePoints="0,28 15,22 30,16 45,18 60,10 75,4 90,2"
                    />
                    <StatCard
                        id="volunteers"
                        label={t('admin.manageVolunteers')}
                        value={stats?.total_volunteers?.toLocaleString()}
                        subtitle="Active Helpers"
                        trend="▲ +10.1%"
                        icon="🙋"
                        colorGrad="from-violet-500 to-pink-600"
                        strokeColor="#8b5cf6"
                        sparklinePoints="0,22 15,20 30,12 45,16 60,8 75,10 90,4"
                    />
                    <StatCard
                        id="ngos"
                        label={t('admin.stats.totalNGOs')}
                        value={stats?.total_ngos?.toLocaleString()}
                        subtitle="Partner Organizations"
                        trend="▲ +5.3%"
                        icon="🏢"
                        colorGrad="from-amber-500 to-orange-600"
                        strokeColor="#f59e0b"
                        sparklinePoints="0,26 15,24 30,18 45,14 60,16 75,8 90,6"
                    />
                </div>

                {/* Analytics Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 bg-white dark:bg-[#111827] p-6 rounded-[18px] border border-gray-200/80 dark:border-gray-800/80 shadow-md">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 dark:text-white">Financial Donations Overview</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Monthly donation growth trends ($)</p>
                            </div>
                            <span className="text-xs font-bold text-sky-500 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">Monthly</span>
                        </div>
                        <div className="h-72">
                            <Bar data={barData} options={barOptions} />
                        </div>
                    </div>

                    <div className="lg:col-span-5 bg-white dark:bg-[#111827] p-6 rounded-[18px] border border-gray-200/80 dark:border-gray-800/80 shadow-md flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 dark:text-white">User Distribution</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Registered members by role</p>
                            </div>
                        </div>
                        <div className="h-64 relative flex items-center justify-center">
                            <Doughnut data={pieData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-[18px] border border-gray-200/80 dark:border-gray-800/80 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <span>⚡</span> Management Quick Actions
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {quickLinks.map(link => (
                            <Link key={link.href} to={link.href}
                                className="group flex flex-col items-center p-4 rounded-[14px] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-sky-500/30 hover:bg-sky-50/50 dark:hover:bg-sky-950/40 hover:-translate-y-1 transition-all duration-200 text-center">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${link.grad} text-white flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform mb-2.5`}>
                                    {link.icon}
                                </div>
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 line-clamp-1">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;


