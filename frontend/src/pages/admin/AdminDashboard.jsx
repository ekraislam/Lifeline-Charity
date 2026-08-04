import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ThemeContext } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import SystemHealthAnalytics from '../../components/admin/SystemHealthAnalytics';



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

const ChartToolbar = ({ activeTab, onChange, tabs = ['Daily', 'Weekly', 'Monthly', 'Yearly'] }) => (
    <div className="inline-flex items-center p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-inner shrink-0">
        {tabs.map(tab => (
            <button
                key={tab}
                onClick={() => onChange(tab)}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                    activeTab === tab
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20 scale-[1.02]'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
                {tab}
            </button>
        ))}
    </div>
);

const EmptyChartState = ({ message = "No data available yet" }) => (
    <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 p-6">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center text-3xl shadow-inner border border-gray-200/50 dark:border-gray-700/50">
            📊
        </div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{message}</p>
        <p className="text-xs text-gray-400 max-w-xs">Data will populate automatically as platform activity and transactions occur.</p>
    </div>
);

const AdminDashboard = () => {
    const { isDark } = React.useContext(ThemeContext);
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [timeframe, setTimeframe] = useState('Monthly');
    const [userFilter, setUserFilter] = useState('All Users');

    const fetchAdminStats = () => {
        api.get('/admin/stats')
            .then(r => setStats(r.data))
            .catch(e => { console.error(e); setError(t('common.error')); })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAdminStats();
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
                <div className="skeleton-pulse h-80 w-full rounded-[20px]" />
                <div className="skeleton-pulse h-80 w-full rounded-[20px]" />
            </div>
        </div>
    );

    if (error) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-rose-500 font-bold">{error}</div>;

    const getFilteredBarData = () => {
        if (timeframe === 'Daily') {
            return {
                labels: stats?.dailyTrend?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                data: stats?.dailyTrend?.data || [0, 0, 0, 0, 0, 0, 0]
            };
        }
        if (timeframe === 'Weekly') {
            return {
                labels: stats?.weeklyTrend?.labels || ['W1', 'W2', 'W3', 'W4'],
                data: stats?.weeklyTrend?.data || [0, 0, 0, 0]
            };
        }
        if (timeframe === 'Yearly') {
            const currentYear = new Date().getFullYear();
            return {
                labels: stats?.yearlyTrend?.labels || [String(currentYear - 3), String(currentYear - 2), String(currentYear - 1), String(currentYear)],
                data: stats?.yearlyTrend?.data || [0, 0, 0, 0]
            };
        }
        return {
            labels: stats?.donationTrendLabels || ['Jan','Feb','Mar','Apr','May','Jun'],
            data: stats?.donationTrendData || [0, 0, 0, 0, 0, 0]
        };
    };


    const activeBarInfo = getFilteredBarData();
    const hasBarData = activeBarInfo.data.some(v => v > 0);

    const barData = {
        labels: activeBarInfo.labels,
        datasets: [
            {
                label: 'Donations ($)',
                data: activeBarInfo.data,
                backgroundColor: isDark ? 'rgba(14, 165, 233, 0.85)' : 'rgba(14, 165, 233, 0.9)',
                hoverBackgroundColor: '#6366f1',
                borderColor: '#0ea5e9',
                borderWidth: 0,
                borderRadius: 8,
                categoryPercentage: 0.6,
                barPercentage: 0.65
            }
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1200,
            easing: 'easeInOutQuart'
        },
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
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
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
                grid: { color: isDark ? 'rgba(51, 65, 85, 0.3)' : '#f1f5f9' },
                beginAtZero: true,
                ticks: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    font: { family: 'Plus Jakarta Sans', size: 11 },
                    callback: (val) => `$${val}`
                }
            }
        }
    };

    const userCounts = [
        stats?.usersByRole?.donor||0,
        stats?.usersByRole?.volunteer||0,
        stats?.usersByRole?.ngo||0,
        stats?.usersByRole?.beneficiary||0
    ];
    const hasPieData = userCounts.some(v => v > 0);

    const pieData = {
        labels: ['Donors','Volunteers','NGOs','Beneficiaries'],
        datasets: [{
            label: '# of Users',
            data: userCounts,
            backgroundColor: [
                '#0ea5e9',
                '#10b981',
                '#f59e0b',
                '#f43f5e'
            ],
            borderWidth: 0,
            hoverOffset: 10
        }],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1200
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { family: 'Plus Jakarta Sans', size: 11, weight: '700' },
                    usePointStyle: true,
                    pointStyle: 'circle',
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
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

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

                {/* Modern SaaS KPI Analytics Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Financial & Revenue Growth Bar Chart */}
                    <div className="lg:col-span-7 backdrop-blur-xl bg-white/90 dark:bg-[#111827]/90 p-6 rounded-[20px] border border-gray-200/80 dark:border-gray-800/80 shadow-md hover:shadow-xl hover:border-sky-500/30 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>📈</span> Financial Donations & Revenue
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">Donation growth trends ($)</p>
                            </div>
                            <ChartToolbar activeTab={timeframe} onChange={setTimeframe} tabs={['Daily', 'Weekly', 'Monthly', 'Yearly']} />
                        </div>
                        <div className="h-72">
                            {hasBarData ? (
                                <Bar data={barData} options={barOptions} />
                            ) : (
                                <EmptyChartState message="No data available yet" />
                            )}
                        </div>
                    </div>

                    {/* User Role Distribution Doughnut Chart */}
                    <div className="lg:col-span-5 backdrop-blur-xl bg-white/90 dark:bg-[#111827]/90 p-6 rounded-[20px] border border-gray-200/80 dark:border-gray-800/80 shadow-md hover:shadow-xl hover:border-sky-500/30 transition-all duration-300 flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>🍩</span> User Role Breakdown
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">Registered platform members</p>
                            </div>
                            <ChartToolbar activeTab={userFilter} onChange={setUserFilter} tabs={['All Users', 'Active', 'Growth']} />
                        </div>
                        <div className="h-64 relative flex items-center justify-center">
                            {hasPieData ? (
                                <Doughnut data={pieData} options={doughnutOptions} />
                            ) : (
                                <EmptyChartState message="No data available yet" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Management Quick Actions Grid */}
                <div className="bg-white/90 dark:bg-[#111827]/90 p-5 sm:p-6 rounded-[20px] border border-gray-200/80 dark:border-gray-800/80 shadow-md backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <span>⚡</span> Management Quick Actions
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {quickLinks.map(link => (
                            <Link key={link.href} to={link.href}
                                className="group flex flex-col items-center p-3.5 rounded-[16px] bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-sky-500/40 hover:bg-sky-50/60 dark:hover:bg-sky-950/40 hover:-translate-y-1 transition-all duration-200 text-center">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${link.grad} text-white flex items-center justify-center text-lg shadow-xs group-hover:scale-110 transition-transform mb-2`}>
                                    {link.icon}
                                </div>
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 line-clamp-1">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>


                {/* System Health & Analytics Section */}
                <SystemHealthAnalytics
                    systemHealth={stats?.systemHealth}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;

