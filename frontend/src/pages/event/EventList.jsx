import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { format } from 'date-fns';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events');
                setEvents(response.data);
            } catch (error) {
                console.error("Error fetching events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Upcoming Events</h2>
                <p className="mt-4 text-xl text-gray-500">Join our community events and make a difference.</p>
            </div>

            {loading ? (
                <div className="flex justify-center"><div className="animate-pulse h-32 w-full bg-gray-200 rounded-md"></div></div>
            ) : events.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No upcoming events at the moment.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
                            <div className="h-48 bg-primary-100 flex items-center justify-center">
                                {/* Using a placeholder or first image if we had an event gallery array */}
                                <svg className="h-16 w-16 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                                
                                <div className="mt-auto space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {format(new Date(event.date), 'MMM dd, yyyy h:mm a')}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {event.location}
                                    </div>
                                </div>
                                <Link to={`/events/${event.id}`} className="block w-full text-center bg-primary-50 border border-primary-500 text-primary-700 hover:bg-primary-100 font-medium py-2 rounded-md transition-colors">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventList;
