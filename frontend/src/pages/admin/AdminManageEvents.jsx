import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AdminManageEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingVolunteers, setViewingVolunteers] = useState(null); // stores event ID if viewing
    const [volunteersList, setVolunteersList] = useState([]);

    useEffect(() => {
        fetchAllEvents();
    }, []);

    const fetchAllEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data.events || []);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await api.delete(`/events/${id}`);
                fetchAllEvents();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete event');
            }
        }
    };

    const fetchVolunteers = async (eventId) => {
        try {
            const res = await api.get(`/events/${eventId}/volunteers`);
            setVolunteersList(res.data.volunteers || []);
            setViewingVolunteers(eventId);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to fetch volunteers');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage All Events</h1>
                    <p className="mt-2 text-sm text-gray-500">View, edit, and delete all events across the platform.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Link
                        to="/admin/events/create"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Create New Event
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                    <p className="text-gray-500 mb-4">No events found in the system.</p>
                    <Link to="/admin/events/create" className="text-primary-600 font-medium hover:text-primary-500">
                        Create an event manually
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {events.map((event) => (
                            <li key={event.id}>
                                <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-lg font-bold text-primary-700 truncate">{event.title}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                                                    ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                                                      event.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' : 
                                                      event.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {event.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex flex-col gap-1 text-sm text-gray-500">
                                                <p className="flex items-center">
                                                    📅 {new Date(event.event_date).toLocaleDateString()}
                                                </p>
                                                <p className="flex items-center">
                                                    📍 {event.location || 'N/A'}
                                                </p>
                                                <p className="flex items-center">
                                                    🏢 Organizer: {event.organizer_name || 'Admin'}
                                                </p>
                                                <p className="flex items-center">
                                                    🙋 Registered Volunteers: {event.registered_volunteers} / {event.max_volunteers || 'Unlimited'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                                        <Link to={`/events/${event.id}`} className="text-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                                            View Public
                                        </Link>
                                        <button onClick={() => fetchVolunteers(event.id)} className="px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200">
                                            Volunteers
                                        </button>
                                        <Link to={`/admin/events/edit/${event.id}`} className="text-center px-3 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200">
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDelete(event.id)} className="px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Volunteer List Modal */}
            {viewingVolunteers && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setViewingVolunteers(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Registered Volunteers</h3>
                                {volunteersList.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No volunteers registered yet.</p>
                                ) : (
                                    <div className="max-h-96 overflow-y-auto">
                                        <ul className="divide-y divide-gray-200">
                                            {volunteersList.map(vol => (
                                                <li key={vol.registration_id} className="py-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{vol.name}</p>
                                                        <p className="text-sm text-gray-500">{vol.email} • {vol.phone || 'No phone'}</p>
                                                        <p className="text-xs text-gray-400 mt-1">Skills: {vol.skills || 'None listed'}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${vol.attendance_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                        {vol.attendance_status}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" onClick={() => setViewingVolunteers(null)} className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:w-auto sm:text-sm">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageEvents;
