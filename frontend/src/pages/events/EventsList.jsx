import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getMediaUrl } from '../../api/axios?v=1';
import { useLanguage } from '../../context/LanguageContext';

const EventsList = () => {
    const { t } = useLanguage();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchEvents();
    }, [searchTerm, statusFilter]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (statusFilter) params.status = statusFilter;
            
            const res = await api.get('/events', { params });
            setEvents(res.data.events || []);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = (e, eventId, eventTitle) => {
        e.preventDefault();
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: eventTitle,
                url: `${window.location.origin}/events/${eventId}`
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`);
            alert('Event link copied to clipboard!');
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
            {/* ══════════════ HERO SECTION ══════════════ */}
            <section className="relative py-16 lg:py-24 overflow-hidden">
                <div className="absolute inset-0 hero-bg-mesh pointer-events-none" aria-hidden="true" />
                <div className="absolute inset-0 hero-grid-overlay pointer-events-none" aria-hidden="true" />

                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="hero-orb hero-orb-1" />
                    <div className="hero-orb hero-orb-2" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 mb-6 backdrop-blur-md animate-fade-in-up">
                        <span>🗓️</span> Community Impact & Action
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
                        Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">Events</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                        Join hands with our community. Participate as a volunteer, support local initiatives, and make a hands-on impact in upcoming events.
                    </p>
                </div>
            </section>

            {/* ══════════════ MAIN CONTENT & FILTERS ══════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">

                {/* Filter & Search Bar */}
                <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 p-4 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-xl mb-10">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                🔍
                            </div>
                            <input
                                type="text"
                                placeholder="Search events by title, category, or location..."
                                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="w-full sm:w-56">
                            <select
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Event Statuses</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ══════════════ EVENT CARDS / EMPTY STATE / LOADING ══════════════ */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800/80 animate-pulse space-y-4">
                                <div className="w-full h-48 rounded-2xl bg-gray-200 dark:bg-gray-800" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-3xl p-12 text-center border border-gray-200/80 dark:border-gray-800/80 shadow-xl max-w-lg mx-auto space-y-4">
                        <div className="w-20 h-20 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-4xl mx-auto">
                            📅
                        </div>
                        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">No events available right now.</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            We couldn't find any community events matching your filter criteria. Check back soon for new initiatives!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => {
                            const isUpcoming = event.status === 'upcoming';
                            const isOngoing = event.status === 'ongoing';
                            const isCompleted = event.status === 'completed';

                            return (
                                <div
                                    key={event.id}
                                    className="group backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Image & Status Badge */}
                                        <div className="relative h-52 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            <img
                                                src={event.cover_image ? getMediaUrl(event.cover_image) : (
                                                    (event.title?.toLowerCase().includes('blood') || event.category_name?.toLowerCase().includes('blood'))
                                                    ? 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=80'
                                                    : (event.title?.toLowerCase().includes('medical') || event.title?.toLowerCase().includes('health') || event.category_name?.toLowerCase().includes('health'))
                                                    ? 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80'
                                                    : (event.title?.toLowerCase().includes('cloth') || event.title?.toLowerCase().includes('winter'))
                                                    ? 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80'
                                                    : 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=80'
                                                )}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=80';
                                                }}
                                            />

                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full shadow-md backdrop-blur-md border ${
                                                    isUpcoming ? 'bg-sky-500/90 text-white border-sky-400/40' :
                                                    isOngoing ? 'bg-amber-500/90 text-white border-amber-400/40' :
                                                    isCompleted ? 'bg-emerald-500/90 text-white border-emerald-400/40' :
                                                    'bg-gray-500/90 text-white border-gray-400/40'
                                                }`}>
                                                    {event.status}
                                                </span>
                                            </div>

                                            {/* Category Tag */}
                                            <div className="absolute bottom-4 left-4">
                                                <span className="px-3 py-1 text-xs font-bold bg-white/90 dark:bg-gray-900/90 text-primary-600 dark:text-primary-400 rounded-full shadow-sm backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
                                                    {event.category_name || 'Community Service'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div className="p-6 space-y-4">
                                            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {event.title}
                                            </h3>

                                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                                                {event.description}
                                            </p>

                                            {/* Metadata */}
                                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base">🕒</span>
                                                    <span>{event.event_date ? new Date(event.event_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base">📍</span>
                                                    <span className="truncate">{event.location || 'Location TBA'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Buttons */}
                                    <div className="p-6 pt-0 flex items-center gap-3">
                                        <Link
                                            to={`/events/${event.id}`}
                                            className="btn-primary flex-1 justify-center py-2.5 text-xs font-bold shadow-md shadow-primary-500/20"
                                        >
                                            View Details & Register
                                        </Link>

                                        <button
                                            onClick={(e) => handleShare(e, event.id, event.title)}
                                            className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                            title="Share Event"
                                        >
                                            🔗
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default EventsList;
