import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-800',
};

const AssignEventModal = ({ volunteer, onClose, onAssign }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Assuming we have a public or admin endpoint to list upcoming events
                const res = await api.get('/events');
                setEvents(res.data.events || res.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleSubmit = async () => {
        if (!selectedEvent) return;
        setAssigning(true);
        try {
            await api.post(`/admin/volunteers/${volunteer.id}/assign`, { eventId: selectedEvent });
            alert('Successfully assigned to event!');
            onAssign();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to assign volunteer');
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Assign Volunteer to Event</h3>
                <p className="text-sm text-gray-600 mb-4">Assign <strong>{volunteer.user_name}</strong> to an upcoming event.</p>
                
                {loading ? (
                    <div className="py-4 text-center text-sm text-gray-500">Loading events...</div>
                ) : events.length === 0 ? (
                    <div className="py-4 text-center text-sm text-red-500">No events available.</div>
                ) : (
                    <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none mb-6"
                    >
                        <option value="">-- Select an Event --</option>
                        {events.filter(ev => {
                            if (!volunteer.registered_events) return true;
                            const registeredIds = volunteer.registered_events.split(',').map(id => parseInt(id, 10));
                            return !registeredIds.includes(ev.id);
                        }).map(ev => (
                            <option key={ev.id} value={ev.id}>{ev.title} ({new Date(ev.event_date).toLocaleDateString()})</option>
                        ))}
                    </select>
                )}

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedEvent || assigning}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                    >
                        {assigning ? 'Assigning...' : 'Assign'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminManageVolunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchVolunteers = async () => {
        setLoading(true);
        try {
            const r = await api.get('/admin/volunteers');
            setVolunteers(r.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchVolunteers(); }, []);

    const handleStatus = async (id, status) => {
        setActionLoading(id + status);
        try {
            await api.put(`/admin/volunteers/${id}/status`, { status });
            setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status } : v));
        } catch (e) { alert('Failed to update status'); }
        finally { setActionLoading(null); }
    };

    const filteredVolunteers = filterStatus === 'all' 
        ? volunteers 
        : volunteers.filter(v => v.status === filterStatus);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {assignTarget && (
                <AssignEventModal
                    volunteer={assignTarget}
                    onClose={() => setAssignTarget(null)}
                    onAssign={fetchVolunteers}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Volunteers</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Approve applications and assign volunteers to events.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600">Filter:</label>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading volunteers...</div>
            ) : filteredVolunteers.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                    <div className="text-5xl mb-3">🙋‍♂️</div>
                    <p className="font-medium">No volunteers found</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Volunteer Info</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Skills & Availability</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Registered</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredVolunteers.map(v => (
                                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-semibold text-gray-900">{v.user_name}</p>
                                            <p className="text-xs text-gray-500">{v.email}</p>
                                            <p className="text-xs text-gray-500">{v.phone || 'No phone'}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-gray-800"><span className="font-medium">Skills:</span> {v.skills || 'Not specified'}</p>
                                            <p className="text-sm text-gray-600"><span className="font-medium">Time:</span> {v.availability || 'Not specified'}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[v.status] || 'bg-gray-100'}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(v.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {v.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleStatus(v.id, 'approved')} disabled={actionLoading} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium">✓ Approve</button>
                                                        <button onClick={() => handleStatus(v.id, 'rejected')} disabled={actionLoading} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-medium">✗ Reject</button>
                                                    </>
                                                )}
                                                {v.status === 'approved' && (
                                                    <button onClick={() => setAssignTarget(v)} className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 font-medium">📅 Assign Event</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageVolunteers;
