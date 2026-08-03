import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api, { API_BASE_URL } from '../../api/axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';


// Relative time formatter helper
const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 45) return 'just now';
    if (diffSec < 90) return '1 min ago';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mins ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
};

// Notification Icon Mapper
const getNotificationIcon = (type) => {
    if (!type) return '🔔';
    const t = type.toLowerCase();
    if (t.includes('donation') || t.includes('payment')) return '💳';
    if (t.includes('ai')) return '🤖';
    if (t.includes('help_request') || t.includes('beneficiary')) return '📋';
    if (t.includes('campaign')) return '📢';
    if (t.includes('event')) return '📅';
    if (t.includes('volunteer')) return '🙋';
    if (t.includes('ngo')) return '🏥';
    if (t.includes('contact') || t.includes('message')) return '📩';
    if (t.includes('security') || t.includes('password')) return '🔒';
    if (t.includes('welcome') || t.includes('user')) return '👋';
    return '🔔';
};

// Toast Alert Component
const ToastAlert = ({ notification, onClose, onNavigate }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-900 border border-primary-500/30 rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-slide-in backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl shrink-0">
                {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-900 dark:text-white leading-snug truncate">
                    {notification.title}
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2 leading-relaxed">
                    {notification.message}
                </p>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold block mt-1">
                    {formatRelativeTime(notification.created_at)}
                </span>
            </div>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-base font-bold leading-none p-1"
            >
                &times;
            </button>
        </div>
    );
};

const NotificationBell = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread'
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    const panelRef = useRef(null);
    const socketRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Fetch Notifications from Server
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to fetch user notifications:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Socket.IO Real-Time Connection
    useEffect(() => {
        if (!user) return;

        const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join', { userId: user.id, role: user.role });
        });

        const handleIncoming = (incoming) => {
            const n = {
                id: incoming.id || Date.now(),
                title: incoming.title || 'Notification',
                message: incoming.message || '',
                type: incoming.type || 'info',
                is_read: false,
                created_at: incoming.created_at || new Date().toISOString(),
                priority: incoming.priority || 'normal'
            };

            setNotifications(prev => {
                if (prev.some(x => x.id === n.id)) return prev;
                return [n, ...prev];
            });

            // Show Floating Toast Alert
            setToast(n);
        };

        socket.on('notification', handleIncoming);
        socket.on('admin_notification', handleIncoming);

        return () => {
            socket.disconnect();
        };
    }, [user]);

    // Close panel on clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Actions
    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Mark read error:', err.message);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Mark all read error:', err.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Delete notification error:', err.message);
        }
    };

    const handleClearAll = async () => {
        try {
            await api.delete('/notifications/clear-all');
            setNotifications([]);
        } catch (err) {
            console.error('Clear all error:', err.message);
        }
    };

    // Navigation router based on notification type
    const handleViewDetails = (notification) => {
        handleMarkAsRead(notification.id);
        setOpen(false);

        const type = (notification.type || '').toLowerCase();
        if (type.includes('admin') || user?.role === 'admin') {
            if (type.includes('campaign')) navigate('/admin/campaigns');
            else if (type.includes('beneficiary') || type.includes('help_request')) navigate('/admin/verify-beneficiaries');
            else if (type.includes('volunteer')) navigate('/admin/volunteers');
            else if (type.includes('ngo')) navigate('/admin/ngos');
            else navigate('/admin/dashboard');
        } else if (user?.role === 'ngo') {
            if (type.includes('campaign')) navigate('/ngo/campaigns');
            else if (type.includes('beneficiary')) navigate('/ngo/requests');
            else navigate('/ngo/dashboard');
        } else if (user?.role === 'beneficiary') {
            navigate('/beneficiary/dashboard');
        } else if (user?.role === 'volunteer') {
            navigate('/volunteer/dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    if (!user) return null;

    const displayedNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.is_read) 
        : notifications;

    return (
        <div className="relative" ref={panelRef}>
            {/* Navbar Bell Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="relative p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none cursor-pointer"
                title="Notifications"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* Badge Count */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-black text-white bg-red-600 rounded-full border-2 border-white dark:border-gray-900 shadow-md animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Toast Alert floating notification */}
            {toast && (
                <ToastAlert
                    notification={toast}
                    onClose={() => setToast(null)}
                    onNavigate={() => handleViewDetails(toast)}
                />
            )}

            {/* Notification Drawer Panel */}
            {open && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-fade-in-up">
                    
                    {/* Panel Header */}
                    <div className="p-4 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🔔</span>
                            <div>
                                <h3 className="text-sm font-black tracking-tight">Notifications</h3>
                                <p className="text-[10px] text-primary-200 font-semibold">{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] transition-all cursor-pointer"
                                >
                                    Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="px-2 py-1 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-white font-bold text-[10px] transition-all cursor-pointer"
                                    title="Clear All"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-1.5 text-center text-xs font-extrabold rounded-xl transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 py-1.5 text-center text-xs font-extrabold rounded-xl transition-all ${filter === 'unread' ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-xs text-gray-400">Loading notifications...</div>
                        ) : displayedNotifications.length === 0 ? (
                            <div className="p-10 text-center space-y-2">
                                <span className="text-3xl block">🎉</span>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">No notifications found.</p>
                                <p className="text-[10px] text-gray-400">You are all caught up!</p>
                            </div>
                        ) : (
                            displayedNotifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 transition-all duration-200 flex items-start gap-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!n.is_read ? 'bg-primary-50/40 dark:bg-primary-950/20' : ''}`}
                                >
                                    {/* Icon */}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${!n.is_read ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        {getNotificationIcon(n.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <h4 className={`text-xs ${!n.is_read ? 'font-black text-gray-900 dark:text-white' : 'font-bold text-gray-700 dark:text-gray-300'} truncate`}>
                                                {n.title}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 font-medium">
                                                {formatRelativeTime(n.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 leading-relaxed line-clamp-2 font-normal">
                                            {n.message}
                                        </p>

                                        {/* Action toolbar */}
                                        <div className="mt-2 flex items-center gap-3">
                                            <button
                                                onClick={() => handleViewDetails(n)}
                                                className="text-[10px] font-black text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                                            >
                                                View Details →
                                            </button>
                                            {!n.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    className="text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(n.id)}
                                                className="text-[10px] font-bold text-red-500 hover:text-red-700 ml-auto opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                title="Delete notification"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
