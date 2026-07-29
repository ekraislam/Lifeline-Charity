import React, { useState, useEffect, useContext } from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const VolunteerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, eventsRes] = await Promise.all([
                    api.get('/volunteers/stats'),
                    api.get('/volunteers/events')
                ]);
                setStats(statsRes.data);
                setEvents(eventsRes.data.events || []);
            } catch (error) {
                console.error("Error fetching volunteer dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const downloadCertificate = () => {
        const doc = new jsPDF({
            orientation: 'landscape',
        });

        // Add border
        doc.setLineWidth(5);
        doc.setDrawColor(14, 165, 233);
        doc.rect(10, 10, 277, 190);
        
        doc.setFontSize(40);
        doc.setTextColor(14, 165, 233);
        doc.text("Certificate of Appreciation", 148, 50, { align: 'center' });

        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text("This certificate is proudly presented to", 148, 80, { align: 'center' });
        
        doc.setFontSize(30);
        doc.setFont("helvetica", "bold");
        doc.text(user?.name || "Volunteer", 148, 100, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "normal");
        doc.text("In recognition of your outstanding dedication and service.", 148, 120, { align: 'center' });
        
        doc.text(`Total Hours Volunteered: ${stats?.total_hours || 0}`, 148, 135, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Awarded on: ${format(new Date(), 'MMMM dd, yyyy')}`, 148, 160, { align: 'center' });
        
        doc.setFontSize(14);
        doc.text("Lifeline Foundation", 148, 180, { align: 'center' });

        doc.save(`Lifeline_Certificate_${user?.name || 'Volunteer'}.pdf`);
    };

    if (loading) return <div className="p-12 text-center">Loading dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Volunteer Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Hours</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total_hours || 0}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Events Assigned</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.events_assigned || 0}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg flex items-center justify-center p-6">
                    <button
                        onClick={downloadCertificate}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Download Certificate
                    </button>
                </div>
            </div>

            {/* Assigned Events */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Assigned Events</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
                {events.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-gray-50">
                        <div className="text-4xl mb-3">📅</div>
                        You have not been assigned to any events yet.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {events.map((ev) => (
                            <li key={ev.registration_id}>
                                <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:px-6 justify-between gap-4">
                                    <div>
                                        <p className="text-lg font-bold text-primary-700">{ev.title}</p>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {ev.description}
                                        </p>
                                        <div className="mt-2 flex items-center text-xs text-gray-500 gap-4">
                                            <span>📍 {ev.location}</span>
                                            <span>🕒 {new Date(ev.event_date).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${ev.attendance_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            Status: {ev.attendance_status}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default VolunteerDashboard;
