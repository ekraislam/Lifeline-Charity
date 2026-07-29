import React, { useState, useEffect, useContext } from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import logo from '../../assets/fogo.png';
import sig1 from '../../assets/sig1.png';
import sig2 from '../../assets/sig2.png';

const VolunteerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');
    const { register, handleSubmit, setValue } = useForm();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, eventsRes, profileRes] = await Promise.all([
                    api.get('/volunteers/stats'),
                    api.get('/volunteers/events'),
                    api.get('/profile')
                ]);
                setStats(statsRes.data);
                setEvents(eventsRes.data.events || []);
                
                // Fetch profile to get skills and availability
                if (profileRes.data) {
                    setValue('skills', profileRes.data.volunteer?.skills || '');
                    setValue('availability', profileRes.data.volunteer?.availability || '');
                }
            } catch (error) {
                console.error("Error fetching volunteer dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [setValue]);

    const onProfileSubmit = async (data) => {
        setProfileLoading(true);
        setProfileSuccess('');
        setProfileError('');
        try {
            await api.put('/volunteers/profile', data);
            setProfileSuccess('Profile updated successfully!');
        } catch (error) {
            setProfileError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const downloadCertificate = async () => {
        const doc = new jsPDF({
            orientation: 'landscape',
        });

        // Add a premium double border
        doc.setLineWidth(4);
        doc.setDrawColor(30, 58, 138); // deep blue
        doc.rect(10, 10, 277, 190);
        
        doc.setLineWidth(1);
        doc.setDrawColor(212, 175, 55); // gold
        doc.rect(14, 14, 269, 182);

        // Try to load the logo
        try {
            const img = new Image();
            img.src = logo;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if logo fails
            });
            if (img.width > 0) {
                // Add logo at the top
                doc.addImage(img, 'PNG', 128, 20, 40, 40);
            }
        } catch (e) {
            console.warn("Could not load logo", e);
        }

        // Set font to Times for a more classic look
        doc.setFont("times", "bold");
        doc.setFontSize(42);
        doc.setTextColor(30, 58, 138);
        doc.text("CERTIFICATE OF APPRECIATION", 148, 75, { align: 'center' });

        doc.setFont("times", "italic");
        doc.setFontSize(18);
        doc.setTextColor(100, 100, 100);
        doc.text("This certificate is proudly presented to", 148, 95, { align: 'center' });
        
        doc.setFont("times", "bold");
        doc.setFontSize(36);
        doc.setTextColor(0, 0, 0);
        doc.text(user?.name || "Volunteer", 148, 115, { align: 'center' });
        
        // Underline for name
        const textWidth = doc.getTextWidth(user?.name || "Volunteer");
        doc.setLineWidth(0.5);
        doc.setDrawColor(100, 100, 100);
        doc.line(148 - (textWidth/2) - 10, 118, 148 + (textWidth/2) + 10, 118);

        doc.setFont("times", "normal");
        doc.setFontSize(16);
        doc.setTextColor(50, 50, 50);
        doc.text("In recognition of your outstanding dedication, selfless service, and", 148, 135, { align: 'center' });
        doc.text("commitment to making a positive impact in our community.", 148, 143, { align: 'center' });
        
        doc.setFont("times", "bolditalic");
        doc.setFontSize(16);
        doc.setTextColor(212, 175, 55); // gold
        doc.text(`Total Volunteered Hours: ${stats?.total_hours || 0}`, 148, 155, { align: 'center' });
        
        // Load Signatures
        try {
            const sig1Img = new Image();
            sig1Img.src = sig1;
            await new Promise(r => { sig1Img.onload = r; sig1Img.onerror = r; });
            if (sig1Img.width > 0) doc.addImage(sig1Img, 'PNG', 40, 145, 40, 20);
            
            const sig2Img = new Image();
            sig2Img.src = sig2;
            await new Promise(r => { sig2Img.onload = r; sig2Img.onerror = r; });
            if (sig2Img.width > 0) doc.addImage(sig2Img, 'PNG', 200, 145, 40, 20);
        } catch (e) { console.warn("Could not load signatures", e); }

        // Bottom section
        doc.setFont("times", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Awarded on: ${format(new Date(), 'MMMM dd, yyyy')}`, 148, 175, { align: 'center' });
        
        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.text("President", 60, 175, { align: 'center' });
        doc.text("Director", 220, 175, { align: 'center' });
        
        doc.setLineWidth(0.5);
        doc.line(30, 168, 90, 168); // sig1 line
        doc.line(190, 168, 250, 168); // sig2 line

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Volunteer Profile Form */}
                <div className="lg:col-span-1 bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Volunteer Profile</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Update your skills and availability.</p>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        {profileSuccess && <div className="mb-4 p-2 bg-green-50 text-green-700 text-sm rounded">{profileSuccess}</div>}
                        {profileError && <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded">{profileError}</div>}
                        <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Skills</label>
                                <textarea
                                    {...register('skills')}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="e.g. First Aid, Teaching, Event Management"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Availability</label>
                                <textarea
                                    {...register('availability')}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="e.g. Weekends only, Monday mornings"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {profileLoading ? 'Saving...' : 'Save Profile Details'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Assigned Events / My Applications */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">My Applications</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        {events.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 bg-gray-50">
                                <div className="text-4xl mb-3">📅</div>
                                You have not applied to any events yet.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {events.map((ev) => (
                                    <li key={ev.registration_id}>
                                        <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:px-6 justify-between gap-4">
                                            <div>
                                                <p className="text-lg font-bold text-primary-700">{ev.title}</p>
                                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                                    {ev.description}
                                                </p>
                                                <div className="mt-2 flex flex-wrap items-center text-xs text-gray-500 gap-4">
                                                    <span>📍 {ev.location}</span>
                                                    <span>🕒 {new Date(ev.event_date).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex items-center justify-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                                                    ${ev.attendance_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                      ev.attendance_status === 'approved' ? 'bg-green-100 text-green-800' : 
                                                      'bg-red-100 text-red-800'}`}>
                                                    {ev.attendance_status}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
