import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { format } from 'date-fns';

const STATUS_CONFIG = {
    pending: { label: 'পেন্ডিং', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    under_review: { label: 'পর্যালোচনায়', color: 'bg-blue-100 text-blue-800', icon: '🔍' },
    waiting_for_ngo: { label: 'NGO-এর অপেক্ষায়', color: 'bg-purple-100 text-purple-800', icon: '🏢' },
    assigned: { label: 'NGO নির্ধারিত', color: 'bg-indigo-100 text-indigo-800', icon: '✅' },
    campaign_active: { label: 'ক্যাম্পেইন চলছে', color: 'bg-green-100 text-green-800', icon: '📢' },
    rejected: { label: 'প্রত্যাখ্যাত', color: 'bg-red-100 text-red-800', icon: '❌' },
    fulfilled: { label: 'সম্পন্ন', color: 'bg-emerald-100 text-emerald-800', icon: '🎉' },
};

const BeneficiaryDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await api.get('/beneficiaries/requests');
                setRequests(response.data);
            } catch (error) {
                console.error("Error fetching requests", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    if (loading) return <div className="p-12 text-center">Loading dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">আমার সাহায্যের আবেদনসমূহ</h1>
                    <p className="text-sm text-gray-500 mt-1">আপনার সকল আবেদনের স্থিতি এখানে দেখুন</p>
                </div>
                <Link to="/beneficiary/request" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none">
                    + নতুন আবেদন
                </Link>
            </div>

            {/* Status Guide */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-wrap gap-3">
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <span key={key} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${val.color}`}>
                        {val.icon} {val.label}
                    </span>
                ))}
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="text-5xl mb-4">📝</div>
                    <p className="text-gray-500 font-medium">আপনি এখনও কোনো আবেদন জমা দেননি</p>
                    <Link to="/beneficiary/request" className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
                        আবেদন করুন
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => {
                        const cfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
                        return (
                            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="px-6 py-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {request.title}
                                                </h3>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                    {cfg.icon} {cfg.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{request.description}</p>
                                            
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                {request.required_amount > 0 && (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <span className="font-medium">৳{parseFloat(request.required_amount).toLocaleString()}</span>
                                                        <span className="text-gray-400">প্রয়োজন</span>
                                                    </div>
                                                )}
                                                {request.assigned_ngo_org && (
                                                    <div className="flex items-center gap-1 text-indigo-600">
                                                        <span>🏢</span>
                                                        <span className="font-medium">{request.assigned_ngo_org}</span>
                                                    </div>
                                                )}
                                                <div className="text-gray-400">
                                                    জমা: {format(new Date(request.created_at), 'dd MMM yyyy')}
                                                </div>
                                            </div>

                                            {request.admin_note && (
                                                <div className="mt-3 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-600 border-l-4 border-primary-400">
                                                    <strong>অ্যাডমিন নোট:</strong> {request.admin_note}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BeneficiaryDashboard;
