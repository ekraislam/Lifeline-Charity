import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios?v=1';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

const AdminManageDonations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedDonation, setSelectedDonation] = useState(null);

    useEffect(() => {
        fetchAdminDonations();
    }, []);

    const fetchAdminDonations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/donations');
            setDonations(res.data || []);
        } catch (e) {
            console.error("Failed to load admin donations:", e);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Summary Stats
    const stats = useMemo(() => {
        const successful = donations.filter(d => d.status === 'success');
        const totalAmount = successful.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        return {
            totalCount: donations.length,
            totalAmount,
            successCount: successful.length,
            pendingCount: donations.filter(d => d.status === 'pending').length,
            failedCount: donations.filter(d => d.status === 'failed').length
        };
    }, [donations]);

    // Filter Logic
    const filteredDonations = useMemo(() => {
        return donations.filter(d => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = (
                (d.campaign_title && d.campaign_title.toLowerCase().includes(searchLower)) ||
                (d.donor_name && d.donor_name.toLowerCase().includes(searchLower)) ||
                (d.donor_email && d.donor_email.toLowerCase().includes(searchLower)) ||
                (d.transaction_id && d.transaction_id.toLowerCase().includes(searchLower)) ||
                String(d.id).includes(searchLower)
            );
            const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [donations, searchTerm, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredDonations.length / itemsPerPage) || 1;
    const paginatedDonations = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredDonations.slice(start, start + itemsPerPage);
    }, [filteredDonations, currentPage, itemsPerPage]);

    const exportToExcel = async () => {
        try {
            const response = await api.get('/admin/export/donations', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'donations_report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error("Export error:", e);
            alert("Failed to export Excel report.");
        }
    };

    const downloadPDFReceipt = (receiptData) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // Header Background
        doc.setFillColor(14, 165, 233);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text('LIFELINE FOUNDATION', 15, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Official Administrative Receipt Record', 15, 29);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('DONATION RECEIPT', 140, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`NO: LL-REC-${String(receiptData.id).padStart(6, '0')}`, 140, 29);

        // Details
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('DONOR DETAILS', 15, 55);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${receiptData.donor_name || 'Anonymous Donor'}`, 15, 63);
        doc.text(`Email: ${receiptData.donor_email || 'N/A'}`, 15, 70);

        doc.setFont('helvetica', 'bold');
        doc.text('CONTRIBUTION DETAILS', 15, 85);
        doc.setFont('helvetica', 'normal');
        doc.text(`Campaign: ${receiptData.campaign_title}`, 15, 93);
        doc.text(`Amount: $${parseFloat(receiptData.amount).toFixed(2)} USD`, 15, 100);
        doc.text(`Payment Method: ${receiptData.payment_method || 'Credit Card'}`, 15, 107);
        doc.text(`Transaction ID: ${receiptData.transaction_id || `TXN_${receiptData.id}`}`, 15, 114);
        doc.text(`Date: ${receiptData.created_at ? format(new Date(receiptData.created_at), 'MMMM dd, yyyy • hh:mm a') : 'N/A'}`, 15, 121);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text('STATUS: VERIFIED & PAID', 15, 135);

        doc.save(`Lifeline_Admin_Receipt_${receiptData.id}.pdf`);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'success':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">Success</span>;
            case 'pending':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Pending</span>;
            case 'failed':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">Failed</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status}</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <span>All Platform Donations</span>
                        <span className="text-xs bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-bold">
                            ADMIN PANEL
                        </span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Monitor all financial contributions across all campaigns and users.
                    </p>
                </div>
                <button
                    onClick={exportToExcel}
                    className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Excel Report
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Revenue</p>
                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">${stats.totalAmount.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Transactions</p>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.totalCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Successful</p>
                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.successCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Pending / Failed</p>
                    <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{stats.pendingCount + stats.failedCount}</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        placeholder="Search by Donor, Campaign, Transaction ID..."
                        className="w-full py-2.5 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                    />
                </div>
                <div className="sm:col-span-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full py-2.5 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                    >
                        <option value="all">All Statuses</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading admin donations...</div>
                ) : paginatedDonations.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No donations found matching criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/60 text-xs font-bold uppercase text-gray-500 border-b border-gray-100 dark:border-gray-700">
                                    <th className="py-4 px-6">ID</th>
                                    <th className="py-4 px-4">Donor</th>
                                    <th className="py-4 px-4">Campaign</th>
                                    <th className="py-4 px-4 text-right">Amount</th>
                                    <th className="py-4 px-4">Date</th>
                                    <th className="py-4 px-4">Method</th>
                                    <th className="py-4 px-4">Transaction ID</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 px-6 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                {paginatedDonations.map((d) => (
                                    <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                        <td className="py-4 px-6 font-bold">#{d.id}</td>
                                        <td className="py-4 px-4">
                                            <p className="font-semibold text-gray-900 dark:text-white">{d.is_anonymous ? 'Anonymous' : (d.donor_name || 'N/A')}</p>
                                            <p className="text-xs text-gray-400">{d.donor_email || ''}</p>
                                        </td>
                                        <td className="py-4 px-4 max-w-xs truncate font-medium text-primary-600">
                                            <Link to={`/campaigns/${d.campaign_id}`}>{d.campaign_title}</Link>
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold">${parseFloat(d.amount).toFixed(2)}</td>
                                        <td className="py-4 px-4 text-xs">{d.created_at ? format(new Date(d.created_at), 'MMM dd, yyyy') : ''}</td>
                                        <td className="py-4 px-4 text-xs">{d.payment_method || 'Credit Card'}</td>
                                        <td className="py-4 px-4 font-mono text-xs text-gray-500">{d.transaction_id || `TXN_${d.id}`}</td>
                                        <td className="py-4 px-4">{getStatusBadge(d.status)}</td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedDonation(d)}
                                                    className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"
                                                >
                                                    View
                                                </button>
                                                {d.status === 'success' && (
                                                    <button
                                                        onClick={() => downloadPDFReceipt(d)}
                                                        className="px-2.5 py-1 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                                                    >
                                                        Receipt
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedDonation && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Donation Overview</h3>
                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <div><strong className="text-gray-500">ID:</strong> #{selectedDonation.id}</div>
                            <div><strong className="text-gray-500">Donor:</strong> {selectedDonation.donor_name} ({selectedDonation.donor_email})</div>
                            <div><strong className="text-gray-500">Campaign:</strong> {selectedDonation.campaign_title}</div>
                            <div><strong className="text-gray-500">Amount:</strong> ${parseFloat(selectedDonation.amount).toFixed(2)}</div>
                            <div><strong className="text-gray-500">Transaction ID:</strong> {selectedDonation.transaction_id || `TXN_${selectedDonation.id}`}</div>
                            <div><strong className="text-gray-500">Status:</strong> {selectedDonation.status}</div>
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setSelectedDonation(null)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageDonations;
