import React from 'react';
import { Link } from 'react-router-dom';

const getStatusBadge = (count) => {
    if (count === 0) {
        return {
            label: 'None Pending',
            sub: 'No pending items.',
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-500/20',
            dot: 'bg-emerald-500'
        };
    }
    if (count <= 5) {
        return {
            label: 'Few Pending',
            sub: `${count} item${count > 1 ? 's' : ''} awaiting review`,
            bg: 'bg-amber-500/10',
            text: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-500/20',
            dot: 'bg-amber-500'
        };
    }
    return {
        label: 'High Priority',
        sub: `${count} items require urgent action!`,
        bg: 'bg-rose-500/10',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/20',
        dot: 'bg-rose-500 animate-ping'
    };
};

const SkeletonCard = () => (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-[#111827]/80 rounded-[20px] p-6 border border-gray-200/80 dark:border-gray-800/80 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="w-24 h-6 rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="space-y-2">
            <div className="w-32 h-4 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="w-16 h-8 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="w-48 h-3 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="w-full h-10 rounded-xl bg-gray-200 dark:bg-gray-800 pt-2" />
    </div>
);

const PendingAdminActions = ({ pendingActions = {}, loading = false }) => {
    const cards = [
        {
            id: 'beneficiary',
            icon: '🩺',
            gradient: 'from-rose-500 to-pink-600',
            title: 'Beneficiary Requests',
            subtitle: 'Requests waiting for verification & assignment',
            count: pendingActions.beneficiaryRequests || 0,
            btnText: 'View Requests',
            link: '/admin/beneficiaries'
        },
        {
            id: 'aiQueue',
            icon: '🤖',
            gradient: 'from-indigo-500 to-purple-600',
            title: 'AI Verification Queue',
            subtitle: 'Reports waiting for manual review',
            count: pendingActions.aiVerificationQueue || 0,
            btnText: 'Review AI Reports',
            link: '/admin/beneficiaries'
        },
        {
            id: 'ngo',
            icon: '🏥',
            gradient: 'from-emerald-500 to-teal-600',
            title: 'NGO Approval Requests',
            subtitle: 'NGOs waiting for approval',
            count: pendingActions.ngoApprovals || 0,
            btnText: 'Review NGOs',
            link: '/admin/ngos'
        },
        {
            id: 'payout',
            icon: '💰',
            gradient: 'from-amber-500 to-orange-600',
            title: 'Payout Requests',
            subtitle: 'Beneficiaries waiting for fund release',
            count: pendingActions.payoutRequests || 0,
            btnText: 'Review Payouts',
            link: '/admin/campaigns'
        },
        {
            id: 'volunteer',
            icon: '🙋',
            gradient: 'from-sky-500 to-blue-600',
            title: 'Volunteer Applications',
            subtitle: 'Pending volunteer requests',
            count: pendingActions.volunteerApplications || 0,
            btnText: 'Review Applications',
            link: '/admin/volunteers'
        },
        {
            id: 'event',
            icon: '📅',
            gradient: 'from-violet-500 to-indigo-600',
            title: 'Event Approvals',
            subtitle: 'Pending event requests',
            count: pendingActions.eventApprovals || 0,
            btnText: 'Review Events',
            link: '/admin/events'
        }
    ];

    const totalPending = cards.reduce((acc, c) => acc + c.count, 0);

    return (
        <div className="space-y-6">

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                        ⚡
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            Pending Admin Actions
                        </h2>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Immediate items requiring administrative review and approval
                        </p>
                    </div>
                </div>

                {/* Total Counter Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 shadow-xs">
                        <span className={`w-2 h-2 rounded-full ${totalPending > 0 ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                        {totalPending === 0 ? 'All Clear (0 Pending)' : `${totalPending} Total Actions Required`}
                    </span>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    cards.map((card) => {
                        const badge = getStatusBadge(card.count);
                        return (
                            <div
                                key={card.id}
                                className="group relative backdrop-blur-xl bg-white/90 dark:bg-[#111827]/90 rounded-[20px] p-6 border border-gray-200/80 dark:border-gray-800/80 shadow-md hover:shadow-2xl hover:border-sky-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                            >
                                {/* Top Header Row */}
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                                            {card.icon}
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${badge.bg} ${badge.text} ${badge.border}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Title & Count */}
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight mb-1">
                                        {card.title}
                                    </h3>
                                    
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tight">
                                            {card.count}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-400">
                                            {card.count === 1 ? 'item' : 'items'}
                                        </span>
                                    </div>

                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-6">
                                        {card.count === 0 ? 'No pending items.' : card.subtitle}
                                    </p>
                                </div>

                                {/* Quick Action Button */}
                                <div>
                                    <Link
                                        to={card.link}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 border border-sky-200/80 dark:border-sky-800/80 shadow-xs transition-all duration-200 group-hover:shadow-md cursor-pointer text-center"
                                    >
                                        <span>{card.btnText}</span>
                                        <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PendingAdminActions;
