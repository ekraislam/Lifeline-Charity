import React, { useState, useEffect, useContext } from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useForm } from 'react-hook-form';
import logo from '../../assets/fogo.png';
import sig1 from '../../assets/sig1.png';
import sig2 from '../../assets/sig2.png';

const VolunteerDashboard = () => {
    const { user } = useContext(AuthContext);
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');
    const { register, handleSubmit, setValue } = useForm();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

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
        doc.text(`Total Volunteered Hours: ${parseFloat(stats?.total_hours || 0).toFixed(1)}`, 148, 155, { align: 'center' });
        doc.text(`Events Assigned: ${Math.max(stats?.events_assigned || 0, stats?.participated_events || 0)}`, 148, 163, { align: 'center' });
        
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

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(n => <div key={n} className="skeleton-pulse h-28 w-full rounded-[22px]" />)}
            </div>
            <div className="skeleton-pulse h-64 w-full rounded-[22px]" />
        </div>
    );

    const eventCount = Math.max(stats?.events_assigned || 0, stats?.participated_events || 0);
    const totalHours = parseFloat(stats?.total_hours || 0);
    const isEligible = totalHours >= 10 && eventCount >= 2;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-display text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Volunteer Portal</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track community service hours, event assignments, and certificates</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                        Active Volunteer
                    </span>
                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="group relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-wider text-violet-500">Total Hours</span>
                            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{totalHours.toFixed(1)}</div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                            ⏱️
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-wider text-sky-500">Events Assigned</span>
                            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats?.events_assigned || 0}</div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                            📅
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500">My Contributions</span>
                            <a href="/donations/history" className="mt-1.5 inline-flex items-center text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline">
                                💳 Giving History &rarr;
                            </a>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                            🎁
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-md flex flex-col justify-between items-center text-center">
                    <button
                        onClick={downloadCertificate}
                        disabled={!isEligible}
                        title={!isEligible ? "You need at least 10 total hours and 2 events to download the certificate." : ""}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                        🎓 Download Certificate
                    </button>
                    {!isEligible && (
                        <p className="mt-2 text-[10px] font-bold text-gray-400">
                            Requires 10 hrs & 2 events
                        </p>
                    )}
                </div>
            </div>

            {/* Profile & Skills Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-900 rounded-[22px] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-md">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <span>🧠</span> Skills & Availability Profile
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Keep your profile updated so NGOs and administrators can invite you to relevant community events.</p>
                    </div>

                    {profileSuccess && <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl">✓ {profileSuccess}</div>}
                    {profileError && <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl">✕ {profileError}</div>}

                    <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">Skills & Expertise</label>
                            <textarea
                                {...register('skills')}
                                rows="3"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                placeholder="e.g. First Aid, Teaching, Logistics, Public Relations"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">Weekly Availability</label>
                            <textarea
                                {...register('availability')}
                                rows="3"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                placeholder="e.g. Weekends, Monday mornings, Evening emergency calls"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer transition-all"
                        >
                            {profileLoading ? 'Saving Details...' : 'Save Profile Details'}
                        </button>
                    </form>
                </div>
            </div>


            {/* My Events Table */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8 border border-gray-100 dark:border-gray-700">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">My Events</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Events you are assigned to or have participated in.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full sm:w-64 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full sm:w-auto rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="All">All Statuses</option>
                            <option value="pending">Registered</option>
                            <option value="attended">Completed / Attended</option>
                            <option value="absent">Absent</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours Credited</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {events
                                .filter(ev => {
                                    const matchSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || (ev.description && ev.description.toLowerCase().includes(searchTerm.toLowerCase()));
                                    const isPast = ev.is_event_past || new Date() >= new Date(ev.event_date);
                                    const computedStatus = ev.attendance_status === 'attended' 
                                        ? 'attended' 
                                        : ev.attendance_status === 'absent' 
                                        ? 'absent' 
                                        : isPast 
                                        ? 'completed' 
                                        : 'pending';
                                    const matchStatus = statusFilter === 'All' || 
                                        (statusFilter === 'pending' && computedStatus === 'pending') ||
                                        (statusFilter === 'attended' && (computedStatus === 'attended' || computedStatus === 'completed')) ||
                                        (statusFilter === 'absent' && computedStatus === 'absent');
                                    return matchSearch && matchStatus;
                                })
                                .map((ev) => {
                                    const isPast = ev.is_event_past || new Date() >= new Date(ev.event_date);
                                    const computedStatus = ev.attendance_status === 'attended' 
                                        ? 'attended' 
                                        : ev.attendance_status === 'absent' 
                                        ? 'absent' 
                                        : isPast 
                                        ? 'completed' 
                                        : 'pending';
                                    const hours = computedStatus === 'absent' ? 0 : parseFloat(ev.hours_credit || 4.0);

                                    return (
                                        <tr key={ev.registration_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{ev.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {ev.location}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {new Date(ev.event_date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                {hours.toFixed(1)} hrs
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${computedStatus === 'attended' || computedStatus === 'completed' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                      computedStatus === 'absent' 
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                    {computedStatus === 'completed' ? 'Completed' : computedStatus === 'pending' ? 'Registered' : computedStatus.charAt(0).toUpperCase() + computedStatus.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                            {events.filter(ev => {
                                    const matchSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || (ev.description && ev.description.toLowerCase().includes(searchTerm.toLowerCase()));
                                    const isPast = ev.is_event_past || new Date() >= new Date(ev.event_date);
                                    const computedStatus = ev.attendance_status === 'attended' 
                                        ? 'attended' 
                                        : ev.attendance_status === 'absent' 
                                        ? 'absent' 
                                        : isPast 
                                        ? 'completed' 
                                        : 'pending';
                                    const matchStatus = statusFilter === 'All' || 
                                        (statusFilter === 'pending' && computedStatus === 'pending') ||
                                        (statusFilter === 'attended' && (computedStatus === 'attended' || computedStatus === 'completed')) ||
                                        (statusFilter === 'absent' && computedStatus === 'absent');
                                    return matchSearch && matchStatus;
                                }).length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No events found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
