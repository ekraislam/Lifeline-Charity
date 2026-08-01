import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../api/axios';

const ICONS = {
    beneficiary_request:   { emoji: '📋', color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-900/40' },
    beneficiary_assigned:  { emoji: '👥', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
    campaign_approved:     { emoji: '✅', color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
    campaign_rejected:     { emoji: '❌', color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-100 dark:bg-rose-900/40' },
    donation_success:      { emoji: '💳', color: 'text-green-600 dark:text-green-400',     bg: 'bg-green-100 dark:bg-green-900/40' },
    campaign_milestone:    { emoji: '🏆', color: 'text-yellow-600 dark:text-yellow-400',  bg: 'bg-yellow-100 dark:bg-yellow-900/40' },
    campaign_completed:    { emoji: '🎉', color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
    event_updated:         { emoji: '📅', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40' },
    volunteer_joined_event:{ emoji: '🤝', color: 'text-cyan-600 dark:text-cyan-400',       bg: 'bg-cyan-100 dark:bg-cyan-900/40' },
    ngo_info:              { emoji: '🔔', color: 'text-primary-600 dark:text-primary-400',bg: 'bg-primary-100 dark:bg-primary-900/40' },
};

const getIcon = (type) => ICONS[type] || ICONS['ngo_info'];

const relativeTime = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationToast = ({ notification, onClose }) => {
    const icon = getIcon(notification.type);

    useEffect(() => {
        const t = setTimeout(onClose, 5000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="animate-slide-in-right fixed bottom-6 right-6 z-[9999] max-w-sm w-full pointer-events-auto">
            <div className="card-premium p-4 flex items-start gap-3 border-l-4 border-primary-500 shadow-2xl bg-white dark:bg-gray-900">
                <span className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg ${icon.bg}`}>
                    {icon.emoji}
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900 dark:text-white leading-tight">{notification.title}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-white text-lg leading-none cursor-pointer"
                >×</button>
            </div>
        </div>
    );
};

const NGONotificationBell = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to fetch NGO notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'ngo') {
            fetchNotifications();
        }
    }, [user, fetchNotifications]);

    useEffect(() => {
        if (user?.role !== 'ngo') return;

        const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });

        socket.on('connect', () => {
            socket.emit('join', { userId: user.id, role: 'ngo' });
        });

        const handleNew = (incoming) => {
            const n = {
                id: incoming.id || Date.now(),
                title: incoming.title,
                message: incoming.message,
                type: incoming.type || 'ngo_info',
                is_read: false,
                created_at: incoming.created_at || new Date().toISOString(),
                priority: incoming.priority || 'normal',
            };
            setNotifications(prev => {
                if (prev.find(x => x.id === n.id)) return prev;
                return [n, ...prev];
            });
            if (n.priority === 'high' || n.priority === 'normal') {
                setToast(n);
            }
        };

        socket.on('notification', handleNew);

        return () => {
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) { console.error(err); }
    };

    const deleteOne = async (id, e) => {
        e.stopPropagation();
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) { console.error(err); }
    };

    const clearAll = async () => {
        try {
            await api.delete('/notifications/clear-all');
            setNotifications([]);
        } catch (err) { console.error(err); }
    };

    const handleClick = (n) => {
        if (!n.is_read) markRead(n.id);
    };

    const displayed = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    if (user?.role !== 'ngo') return null;

    return (
        <>
            <div className="relative" ref={panelRef}>
                <button
                    id="ngo-notification-bell"
                    onClick={() => setOpen(o => !o)}
                    className="relative w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
                    aria-label="NGO Notifications"
                >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-black bg-primary-600 text-white leading-none animate-pulse">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {open && (
                    <div className="absolute right-0 top-12 w-[380px] max-h-[540px] flex flex-col card-premium shadow-2xl z-50 overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white">NGO Updates</h3>
                                <p className="text-[11px] text-gray-400">{unreadCount} unread</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                            {['all', 'unread'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                                        filter === tab
                                            ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[380px]">
                            {loading ? (
                                <div className="p-6 space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl skeleton-pulse flex-shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 skeleton-pulse rounded-full w-3/4" />
                                                <div className="h-2 skeleton-pulse rounded-full w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : displayed.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                                    <span className="text-4xl mb-3">🏢</span>
                                    <p className="text-sm font-black text-gray-500 dark:text-gray-400">
                                        {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-1">Beneficiary & campaign activity will appear here in real time.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                                    {displayed.map(n => {
                                        const icon = getIcon(n.type);
                                        return (
                                            <div
                                                key={n.id}
                                                onClick={() => handleClick(n)}
                                                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group ${
                                                    !n.is_read
                                                        ? 'bg-primary-50/40 dark:bg-primary-950/20 hover:bg-primary-50 dark:hover:bg-primary-950/40'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                                                }`}
                                            >
                                                <span className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${icon.bg}`}>
                                                    {icon.emoji}
                                                </span>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-xs leading-tight ${!n.is_read ? 'font-black text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-300'}`}>
                                                            {n.title}
                                                        </p>
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            {!n.is_read && (
                                                                <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-0.5" />
                                                            )}
                                                            <button
                                                                onClick={(e) => deleteOne(n.id, e)}
                                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm leading-none cursor-pointer"
                                                                title="Delete"
                                                            >×</button>
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium">{relativeTime(n.created_at)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {toast && (
                <NotificationToast
                    notification={toast}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};

export default NGONotificationBell;
