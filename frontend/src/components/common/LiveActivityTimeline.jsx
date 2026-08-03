import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import io from 'socket.io-client';
import { API_BASE_URL } from '../../api/axios';


const COLOR_MAP = {
    success: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
        badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
    },
    info: {
        bg: 'bg-sky-500/10',
        text: 'text-sky-600 dark:text-sky-400',
        border: 'border-sky-500/20',
        dot: 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]',
        badge: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
    },
    warning: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
        badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
    },
    critical: {
        bg: 'bg-rose-500/10',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/20',
        dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
        badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
    }
};

const formatRelativeTime = (dateInput) => {
    if (!dateInput) return 'Just now';
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return 'Recently';
        const distance = formatDistanceToNow(date, { addSuffix: true });
        return distance.replace('about ', '');
    } catch {
        return 'Recently';
    }
};

const groupActivities = (items) => {
    const groups = { Today: [], Yesterday: [], Earlier: [] };
    items.forEach(item => {
        const date = item.timestamp ? new Date(item.timestamp) : new Date();
        if (isToday(date)) {
            groups.Today.push(item);
        } else if (isYesterday(date)) {
            groups.Yesterday.push(item);
        } else {
            groups.Earlier.push(item);
        }
    });
    return groups;
};

const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const LiveActivityTimeline = ({ activities = [], onRefresh, title = "Live Activity Stream" }) => {
    const [liveItems, setLiveItems] = useState(activities);
    const [visibleCount, setVisibleCount] = useState(10);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        setLiveItems(activities);
    }, [activities]);

    // WebSocket listener for real-time instant append
    useEffect(() => {
        try {
            const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
            socket.on('activity_logged', (newAct) => {
                setLiveItems(prev => [newAct, ...prev]);
            });
            return () => socket.disconnect();
        } catch (e) {
            console.warn('Socket connection error in LiveActivityTimeline:', e.message);
        }
    }, []);


    // 30-Second Auto Refresh Poll
    useEffect(() => {
        const interval = setInterval(() => {
            if (onRefresh) {
                onRefresh();
            }
            setLastUpdated(new Date());
        }, 30000);
        return () => clearInterval(interval);
    }, [onRefresh]);

    const displayedActivities = liveItems.slice(0, visibleCount);
    const grouped = groupActivities(displayedActivities);
    const hasMore = liveItems.length > visibleCount;

    return (
        <div className="backdrop-blur-xl bg-white/90 dark:bg-[#111827]/90 rounded-[20px] p-6 border border-gray-200/80 dark:border-gray-800/80 shadow-md hover:shadow-xl transition-all duration-300 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center text-lg shadow-md shrink-0">
                        ⚡
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                            {title}
                        </h2>
                        <p className="text-xs text-gray-400">Updates live every 30s</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Live Sync
                    </span>
                </div>
            </div>

            {/* Empty State */}
            {liveItems.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center text-3xl mx-auto shadow-inner border border-gray-200/50 dark:border-gray-700/50">
                        📡
                    </div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">No recent activity yet.</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">Activities will appear in real-time as users register, make donations, or submit community requests.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([groupKey, items]) => {
                        if (items.length === 0) return null;
                        return (
                            <div key={groupKey} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/80 px-2.5 py-0.5 rounded-md">
                                        {groupKey}
                                    </span>
                                    <div className="h-px bg-gray-100 dark:bg-gray-800/80 flex-1" />
                                </div>

                                <div className="relative pl-6 space-y-4">
                                    {/* Vertical Timeline Connector Line */}
                                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-sky-500/30 via-indigo-500/20 to-transparent" />

                                    {items.map((act, idx) => {
                                        const typeColor = COLOR_MAP[act.type || 'info'] || COLOR_MAP.info;
                                        return (
                                            <div
                                                key={act.id || idx}
                                                className="group relative flex items-start gap-4 p-4 rounded-[16px] bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                            >
                                                {/* Timeline Animated Dot */}
                                                <div className="absolute -left-[19px] top-5 w-3 h-3 rounded-full bg-white dark:bg-gray-900 border-2 border-sky-500 flex items-center justify-center shrink-0">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${typeColor.dot}`} />
                                                </div>

                                                {/* User Avatar */}
                                                {act.avatar ? (
                                                    <img
                                                        src={act.avatar}
                                                        alt={act.user || 'User'}
                                                        className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0 shadow-xs"
                                                    />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                                                        {getInitials(act.user)}
                                                    </div>
                                                )}

                                                {/* Details */}
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                                                                {act.user || 'System User'}
                                                            </span>
                                                            {act.role && (
                                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${typeColor.badge}`}>
                                                                    {act.role}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 shrink-0">
                                                            {formatRelativeTime(act.timestamp)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm shrink-0">{act.icon || '📌'}</span>
                                                        <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                            {act.title}
                                                        </h4>
                                                    </div>

                                                    {act.description && (
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                            {act.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="pt-2 text-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                className="px-5 py-2 rounded-xl text-xs font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 transition-all cursor-pointer"
                            >
                                Load More Activities ({liveItems.length - visibleCount} remaining)
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveActivityTimeline;

