import React, { useState, useEffect, useContext } from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const VolunteerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, tasksRes] = await Promise.all([
                    api.get('/volunteers/stats'),
                    api.get('/volunteers/tasks')
                ]);
                setStats(statsRes.data);
                setTasks(tasksRes.data.tasks || []);
            } catch (error) {
                console.error("Error fetching volunteer dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handleTaskSignup = async (taskId) => {
        try {
            await api.post('/volunteers/tasks', { task_id: taskId });
            alert('Successfully signed up for task!');
            // Refresh tasks
            const res = await api.get('/volunteers/tasks');
            setTasks(res.data.tasks || []);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to sign up for task');
        }
    };

    const handleAttendance = async (taskId) => {
        try {
            await api.post(`/volunteers/tasks/${taskId}/attendance`, { status: 'present', hours: 2 });
            alert('Attendance marked!');
            // Refresh
            const [statsRes, tasksRes] = await Promise.all([
                api.get('/volunteers/stats'),
                api.get('/volunteers/tasks')
            ]);
            setStats(statsRes.data);
            setTasks(tasksRes.data.tasks || []);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to mark attendance');
        }
    };

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
                        <dt className="text-sm font-medium text-gray-500 truncate">Tasks Completed</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.tasks_completed || 0}</dd>
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

            {/* Available Tasks */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Tasks</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
                {tasks.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No tasks available at the moment.</div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {tasks.map((task) => (
                            <li key={task.id}>
                                <div className="px-4 py-4 flex items-center sm:px-6 justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-primary-600 truncate">{task.title}</p>
                                        <p className="mt-1 flex items-center text-sm text-gray-500">
                                            {task.description}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">Campaign ID: {task.campaign_id}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleTaskSignup(task.id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none"
                                        >
                                            Sign Up
                                        </button>
                                        <button
                                            onClick={() => handleAttendance(task.id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none"
                                        >
                                            Mark Present
                                        </button>
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
