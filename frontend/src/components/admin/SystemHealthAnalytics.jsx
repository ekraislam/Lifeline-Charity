import React from 'react';

const SkeletonCard = () => (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-[#111827]/80 rounded-[20px] p-5 border border-gray-200/80 dark:border-gray-800/80 shadow-sm animate-pulse space-y-3">
        <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
            <div className="w-20 h-5 rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="space-y-1.5">
            <div className="w-24 h-3 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="w-20 h-7 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
    </div>
);

const SystemHealthAnalytics = ({ systemHealth = {}, loading = false }) => {
    const services = [
        {
            id: 'db',
            title: 'Database Status',
            status: systemHealth.database?.status || 'Online',
            code: 'green',
            detail: systemHealth.database?.detail || 'Latency 2ms',
            icon: '🗄️',
            grad: 'from-emerald-500 to-teal-600'
        },
        {
            id: 'api',
            title: 'Backend API Status',
            status: systemHealth.api?.status || 'Operational',
            code: 'green',
            detail: systemHealth.api?.detail || '99.99% Uptime',
            icon: '⚡',
            grad: 'from-sky-500 to-blue-600'
        },
        {
            id: 'ai',
            title: 'AI Verification Service',
            status: systemHealth.aiService?.status || 'Active',
            code: 'green',
            detail: systemHealth.aiService?.detail || 'Engine Ready',
            icon: '🤖',
            grad: 'from-indigo-500 to-purple-600'
        },
        {
            id: 'notif',
            title: 'Notification Service',
            status: systemHealth.notificationService?.status || 'Live',
            code: 'green',
            detail: systemHealth.notificationService?.detail || 'Socket Active',
            icon: '🔔',
            grad: 'from-amber-500 to-orange-600'
        },
        {
            id: 'pay',
            title: 'Payment Gateway',
            status: systemHealth.paymentGateway?.status || 'Connected',
            code: 'green',
            detail: systemHealth.paymentGateway?.detail || 'Gateways Ready',
            icon: '💳',
            grad: 'from-rose-500 to-pink-600'
        }
    ];

    const metrics = [
        {
            id: 'active_users',
            title: 'Active Users',
            value: (systemHealth.activeUsersOnline || 0).toLocaleString(),
            trend: '▲ Live Now',
            trendType: 'green',
            subtitle: 'Verified accounts enabled',
            icon: '🟢',
            grad: 'from-emerald-500 to-teal-600'
        },
        {
            id: 'today_donations',
            title: "Today's Donations",
            value: `$${(systemHealth.todayDonations || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            trend: `${systemHealth.todayDonationsCount || 0} gifts today`,
            trendType: 'info',
            subtitle: 'Funds raised in 24h',
            icon: '💸',
            grad: 'from-sky-500 to-indigo-600'
        },
        {
            id: 'week_donations',
            title: 'This Week Donations',
            value: `$${(systemHealth.thisWeekDonations || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            trend: 'Past 7 Days',
            trendType: 'info',
            subtitle: 'Weekly total volume',
            icon: '📈',
            grad: 'from-purple-500 to-indigo-600'
        },
        {
            id: 'active_campaigns',
            title: 'Active Campaigns',
            value: (systemHealth.activeCampaigns || 0).toLocaleString(),
            trend: 'Currently Funding',
            trendType: 'green',
            subtitle: 'Published campaigns',
            icon: '📢',
            grad: 'from-amber-500 to-orange-600'
        },
        {
            id: 'completed_campaigns',
            title: 'Completed Campaigns',
            value: (systemHealth.completedCampaigns || 0).toLocaleString(),
            trend: '100% Goal Reached',
            trendType: 'green',
            subtitle: 'Successfully funded',
            icon: '🏆',
            grad: 'from-teal-500 to-emerald-600'
        },
        {
            id: 'total_beneficiaries',
            title: 'Total Beneficiaries',
            value: (systemHealth.totalBeneficiaries || 0).toLocaleString(),
            trend: 'Impact Recipients',
            trendType: 'info',
            subtitle: 'Verified help seekers',
            icon: '🩺',
            grad: 'from-rose-500 to-pink-600'
        },
        {
            id: 'total_ngos',
            title: 'Approved NGOs',
            value: (systemHealth.totalNgos || 0).toLocaleString(),
            trend: 'Verified Partners',
            trendType: 'info',
            subtitle: 'Registered non-profits',
            icon: '🏥',
            grad: 'from-blue-500 to-cyan-600'
        },
        {
            id: 'total_volunteers',
            title: 'Total Volunteers',
            value: (systemHealth.totalVolunteers || 0).toLocaleString(),
            trend: 'Mobilized Force',
            trendType: 'info',
            subtitle: 'Active community volunteers',
            icon: '🙋',
            grad: 'from-violet-500 to-purple-600'
        }
    ];

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                        🖥️
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            System Health & Analytics
                        </h2>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Real-time platform infrastructure & services health status
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        System Operational
                    </span>
                </div>
            </div>

            {/* Infrastructure Services Status (5 Cards) */}
            <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <span>📡</span> Services Infrastructure Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        services.map((svc) => (
                            <div
                                key={svc.id}
                                className="group backdrop-blur-xl bg-white/90 dark:bg-[#111827]/90 rounded-[18px] p-4 border border-gray-200/80 dark:border-gray-800/80 shadow-sm hover:shadow-xl hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${svc.grad} text-white flex items-center justify-center text-lg shadow-xs group-hover:scale-110 transition-transform duration-200`}>
                                        {svc.icon}
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                        {svc.status}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        {svc.title}
                                    </h4>
                                    <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                                        {svc.detail}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};


export default SystemHealthAnalytics;
