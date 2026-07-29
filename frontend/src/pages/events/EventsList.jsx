import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const EventsList = () => {
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold leading-9 text-gray-900 sm:text-4xl mb-4">
                        Upcoming Events
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Join hands with our community. Participate as a volunteer in these upcoming events.
                    </p>
                </div>
            </div>

            <div className="mb-8 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search events by title or location..."
                    className="flex-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="appearance-none rounded-md relative block w-full sm:w-48 px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <Link key={event.id} to={`/events/${event.id}`} className="block group">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                                <div className="relative h-48 w-full bg-gray-200">
                                    {event.cover_image ? (
                                        <img
                                            src={`http://localhost:5000${event.cover_image}`}
                                            alt={event.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-500 text-4xl">
                                            📅
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize shadow-sm
                                            ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                                              event.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' : 
                                              event.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="text-sm font-medium text-primary-600 mb-1">
                                        {event.category_name || 'General'}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                        {event.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">
                                        {event.description}
                                    </p>
                                    <div className="mt-auto space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <span className="mr-2">🕒</span>
                                            {new Date(event.event_date).toLocaleString()}
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-2">📍</span>
                                            <span className="truncate">{event.location || 'TBA'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventsList;
