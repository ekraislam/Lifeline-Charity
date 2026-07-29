import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const res = await api.get(`/events/${id}`);
            setEvent(res.data);
        } catch (err) {
            setError('Event not found or failed to load.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!user) {
            navigate('/login', { state: { message: 'Please login as a volunteer to register for this event.' } });
            return;
        }
        if (user.role !== 'volunteer') {
            setError('Only volunteers can register for events.');
            return;
        }

        setRegistering(true);
        setError(null);
        setSuccess('');
        try {
            await api.post(`/events/${id}/register`);
            setSuccess('Successfully registered for this event!');
            fetchEventDetails(); // Refresh data to update volunteer count
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading event details...</div>;
    if (error && !event) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!event) return null;

    const isPastDeadline = event.registration_deadline && new Date() > new Date(event.registration_deadline);
    const isFull = event.max_volunteers > 0 && event.registered_volunteers >= event.max_volunteers;
    const canRegister = event.status === 'upcoming' && !isPastDeadline && !isFull;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {/* Cover Image */}
                <div className="w-full h-64 sm:h-96 bg-gray-200 relative">
                    {event.cover_image ? (
                        <img 
                            src={`${import.meta.env.VITE_API_URL}${event.cover_image}`} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-500 text-6xl">
                            📅
                        </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <span className="px-3 py-1 bg-white text-gray-800 text-sm font-bold rounded-full shadow-md">
                            {event.category_name || 'General'}
                        </span>
                        <span className={`px-3 py-1 text-sm font-bold rounded-full capitalize shadow-md
                            ${event.status === 'upcoming' ? 'bg-blue-500 text-white' : 
                              event.status === 'ongoing' ? 'bg-yellow-500 text-white' : 
                              event.status === 'completed' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {event.status}
                        </span>
                    </div>
                </div>

                <div className="p-8 sm:p-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">{event.title}</h1>
                    
                    {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}
                    {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">{success}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="col-span-2 prose prose-blue max-w-none">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">About this Event</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6 h-fit">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Date & Time</h4>
                                <p className="text-gray-900 font-medium flex items-center">
                                    <span className="mr-2">🕒</span> {new Date(event.event_date).toLocaleString()}
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</h4>
                                <p className="text-gray-900 font-medium flex items-center">
                                    <span className="mr-2">📍</span> {event.location || 'To be announced'}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Organizer</h4>
                                <p className="text-gray-900 font-medium flex items-center">
                                    <span className="mr-2">🏢</span> {event.organizer_name || 'Admin'}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-500">Volunteers</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {event.registered_volunteers} {event.max_volunteers > 0 && `/ ${event.max_volunteers}`}
                                    </span>
                                </div>
                                {event.max_volunteers > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-primary-600 h-2 rounded-full" 
                                            style={{ width: `${Math.min(100, (event.registered_volunteers / event.max_volunteers) * 100)}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>

                            {event.registration_deadline && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Registration Deadline</h4>
                                    <p className={`text-sm font-medium ${isPastDeadline ? 'text-red-600' : 'text-gray-900'}`}>
                                        {new Date(event.registration_deadline).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            <div className="pt-6">
                                {canRegister ? (
                                    <button
                                        onClick={handleRegister}
                                        disabled={registering}
                                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${registering ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    >
                                        {registering ? 'Registering...' : 'Register as Volunteer'}
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-bold text-gray-500 bg-gray-100 cursor-not-allowed"
                                    >
                                        {event.status !== 'upcoming' ? `Event is ${event.status}` : 
                                         isPastDeadline ? 'Registration Closed' : 
                                         isFull ? 'Event is Full' : 'Registration Unavailable'}
                                    </button>
                                )}
                                {(!user || user.role !== 'volunteer') && canRegister && (
                                    <p className="mt-2 text-xs text-center text-gray-500">
                                        You must be logged in as a volunteer to register.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
