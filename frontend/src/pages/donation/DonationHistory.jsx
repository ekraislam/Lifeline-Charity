import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios?v=1';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

const DonationHistory = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/donations/history');
            setDonations(response.data || []);
        } catch (error) {
            console.error("Error fetching donation history:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Summary Stats
    const stats = useMemo(() => {
        const successful = donations.filter(d => d.status === 'success');
        const totalAmount = successful.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        const uniqueCampaigns = new Set(donations.map(d => d.campaign_id)).size;

        return {
            totalAmount,
            totalCount: donations.length,
            successCount: successful.length,
            uniqueCampaigns
        };
    }, [donations]);

    // Unique payment methods for filter dropdown
    const availableMethods = useMemo(() => {
        const methods = donations.map(d => d.payment_method || 'Credit Card');
        return Array.from(new Set(methods));
    }, [donations]);

    // Filter and Sort Logic
    const filteredDonations = useMemo(() => {
        return donations
            .filter(d => {
                const matchesSearch = (
                    (d.campaign_title && d.campaign_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (d.transaction_id && d.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (String(d.id).includes(searchTerm))
                );
                const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
                const matchesMethod = methodFilter === 'all' || (d.payment_method || 'Credit Card') === methodFilter;
                return matchesSearch && matchesStatus && matchesMethod;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
                if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
                if (sortBy === 'amount_high') return (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0);
                if (sortBy === 'amount_low') return (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0);
                return 0;
            });
    }, [donations, searchTerm, statusFilter, methodFilter, sortBy]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredDonations.length / itemsPerPage) || 1;
    const paginatedDonations = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredDonations.slice(start, start + itemsPerPage);
    }, [filteredDonations, currentPage, itemsPerPage]);

    const handleCopyTxn = (txnId, e) => {
        e.stopPropagation();
        if (!txnId) return;
        navigator.clipboard.writeText(txnId);
        setCopiedId(txnId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const generatePDFReceipt = (receiptData) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Header Background
        doc.setFillColor(14, 165, 233); // Primary Ocean Blue
        doc.rect(0, 0, 210, 40, 'F');

        // Logo & Organization Name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text('LIFELINE FOUNDATION', 15, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Connecting Hearts, Empowering Communities', 15, 29);

        // Receipt Tag
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('DONATION RECEIPT', 140, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`NO: ${receiptData.receipt_number || `LL-REC-${String(receiptData.id || 0).padStart(6, '0')}`}`, 140, 29);

        // Date & Status Banner
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, 48, 180, 18, 3, 3, 'FD');

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const receiptDate = receiptData.date ? format(new Date(receiptData.date), 'MMMM dd, yyyy • hh:mm a') : format(new Date(), 'MMMM dd, yyyy');
        doc.text(`Date of Issue: ${receiptDate}`, 22, 59);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // Green
        doc.text('STATUS: OFFICIAL PAID RECEIPT', 125, 59);

        // Donor & Org Info Grid
        // Donor Details (Left)
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('DONOR DETAILS', 15, 78);

        doc.setLineWidth(0.5);
        doc.setDrawColor(14, 165, 233);
        doc.line(15, 81, 95, 81);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        doc.text('Name:', 15, 89);
        doc.setFont('helvetica', 'normal');
        doc.text(receiptData.donor_name || 'Generous Donor', 40, 89);

        doc.setFont('helvetica', 'bold');
        doc.text('Email:', 15, 96);
        doc.setFont('helvetica', 'normal');
        doc.text(receiptData.donor_email || 'N/A', 40, 96);

        // Organization Info (Right)
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('ISSUED BY', 115, 78);

        doc.line(115, 81, 195, 81);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text('Lifeline Charity Management System', 115, 89);
        doc.text('Email: support@lifeline-charity.org', 115, 96);
        doc.text('Website: www.lifeline-charity.org', 115, 103);

        // Contribution Details Table
        const tableY = 115;
        doc.setFillColor(30, 41, 59);
        doc.rect(15, tableY, 180, 10, 'F');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('DESCRIPTION / CAMPAIGN', 20, tableY + 6.5);
        doc.text('PAYMENT METHOD', 105, tableY + 6.5);
        doc.text('AMOUNT (USD)', 155, tableY + 6.5);

        // Table Content
        doc.setFillColor(255, 255, 255);
        doc.rect(15, tableY + 10, 180, 25, 'D');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        
        // Campaign Title Wrap
        const campaignTitle = receiptData.campaign_title || 'General Contribution';
        const splitTitle = doc.splitTextToSize(campaignTitle, 80);
        doc.text(splitTitle, 20, tableY + 18);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`Txn ID: ${receiptData.transaction_id || `TXN_${receiptData.id}`}`, 20, tableY + 28);

        doc.text(receiptData.payment_method || 'Credit Card', 105, tableY + 18);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(14, 165, 233);
        doc.text(`$${parseFloat(receiptData.amount || 0).toFixed(2)}`, 155, tableY + 18);

        // Total Section Box
        const summaryY = tableY + 42;
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(115, summaryY, 80, 22, 2, 2, 'F');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('TOTAL PAID:', 122, summaryY + 14);

        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text(`$${parseFloat(receiptData.amount || 0).toFixed(2)} USD`, 152, summaryY + 14);

        // Tax Exemption Note
        doc.setFillColor(254, 243, 199);
        doc.setDrawColor(251, 191, 36);
        doc.roundedRect(15, summaryY + 30, 180, 18, 2, 2, 'FD');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(146, 64, 14);
        doc.text('Tax Exemption & Tax Information:', 20, summaryY + 37);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 83, 9);
        doc.text('Lifeline Foundation is a registered tax-exempt charitable organization. Please retain this receipt for tax purposes.', 20, summaryY + 43);

        // Authorization Stamp & Footer
        const footerY = 240;
        doc.setDrawColor(203, 213, 225);
        doc.line(15, footerY, 195, footerY);

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('Thank you for making a difference in the lives of those in need!', 15, footerY + 8);
        doc.text('This is an electronically generated official receipt and requires no physical signature.', 15, footerY + 13);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(14, 165, 233);
        doc.text('Lifeline Verification Seal: VERIFIED', 140, footerY + 8);

        // Save PDF
        doc.save(`Lifeline_Receipt_${receiptData.receipt_number || receiptData.id}.pdf`);
    };

    const downloadReceipt = async (donation) => {
        setDownloadingId(donation.id);
        try {
            const response = await api.get(`/donations/${donation.id}/receipt`);
            const receiptData = response.data;
            generatePDFReceipt(receiptData);
        } catch (error) {
            console.error("Error downloading receipt:", error);
            // Fallback: generate PDF from local table row data
            generatePDFReceipt({
                id: donation.id,
                receipt_number: `LL-REC-${String(donation.id).padStart(6, '0')}`,
                date: donation.created_at,
                donor_name: donation.is_anonymous ? 'Anonymous Donor' : 'Valued Donor',
                donor_email: 'N/A',
                campaign_title: donation.campaign_title,
                amount: donation.amount,
                payment_method: donation.payment_method || 'Credit Card',
                transaction_id: donation.transaction_id || `TXN_${donation.id}`,
                status: donation.status
            });
        } finally {
            setDownloadingId(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'success':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>Success
                </span>;
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500 animate-pulse"></span>Pending
                </span>;
            case 'failed':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500"></span>Failed
                </span>;
            case 'refunded':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-purple-500"></span>Refunded
                </span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status}</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <span>My Donation History</span>
                        <span className="text-xs bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            {filteredDonations.length} Records
                        </span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        View your philanthropic impact, inspect details, and download official PDF tax receipts.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/campaigns"
                        className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-full shadow-md text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Make New Donation
                    </Link>
                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Contributed</p>
                        <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400 mt-1">${stats.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl">
                        💰
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Donations</p>
                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.totalCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl">
                        🎁
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Successful Payments</p>
                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.successCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl">
                        ✅
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Campaigns Supported</p>
                        <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{stats.uniqueCampaigns}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 text-2xl">
                        🏛️
                    </div>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
                    {/* Search Input */}
                    <div className="lg:col-span-4 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            placeholder="Search campaign or transaction ID..."
                            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="lg:col-span-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="block w-full py-2.5 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Payment Statuses</option>
                            <option value="success">Success Only</option>
                            <option value="pending">Pending Only</option>
                            <option value="failed">Failed Only</option>
                            <option value="refunded">Refunded Only</option>
                        </select>
                    </div>

                    {/* Payment Method Filter */}
                    <div className="lg:col-span-3">
                        <select
                            value={methodFilter}
                            onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
                            className="block w-full py-2.5 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Payment Methods</option>
                            {availableMethods.map(method => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div className="lg:col-span-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="block w-full py-2.5 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="amount_high">Amount: High to Low</option>
                            <option value="amount_low">Amount: Low to High</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Responsive Table Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium">Loading your donation history...</p>
                    </div>
                ) : paginatedDonations.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/60 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl mx-auto mb-4">
                            🎗️
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No donations found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                            {searchTerm || statusFilter !== 'all' || methodFilter !== 'all'
                                ? "No transactions matched your search or filter criteria. Try resetting your filters."
                                : "You haven't made any donations yet. Explore our active campaigns and start making a difference today!"}
                        </p>
                        {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all') ? (
                            <button
                                onClick={() => { setSearchTerm(''); setStatusFilter('all'); setMethodFilter('all'); }}
                                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-950/60 rounded-xl"
                            >
                                Clear All Filters
                            </button>
                        ) : (
                            <Link
                                to="/campaigns"
                                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-md text-sm transition-all"
                            >
                                Browse Active Campaigns
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="py-4 px-6">Campaign Name</th>
                                        <th className="py-4 px-4 text-right">Amount</th>
                                        <th className="py-4 px-4">Donation Date</th>
                                        <th className="py-4 px-4">Payment Method</th>
                                        <th className="py-4 px-4">Transaction ID</th>
                                        <th className="py-4 px-4">Status</th>
                                        <th className="py-4 px-6 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                                    {paginatedDonations.map((donation) => (
                                        <tr key={donation.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-900/40 transition-colors">
                                            {/* Campaign Name */}
                                            <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white max-w-xs truncate">
                                                <Link
                                                    to={`/campaigns/${donation.campaign_id}`}
                                                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                    title={donation.campaign_title}
                                                >
                                                    {donation.campaign_title || `Campaign #${donation.campaign_id}`}
                                                </Link>
                                                {donation.is_anonymous && (
                                                    <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                                        Anonymous
                                                    </span>
                                                )}
                                            </td>

                                            {/* Donation Amount */}
                                            <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">
                                                <span className="text-xs text-gray-400 font-normal mr-0.5">$</span>
                                                {parseFloat(donation.amount).toFixed(2)}
                                            </td>

                                            {/* Donation Date */}
                                            <td className="py-4 px-4 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                                                {donation.created_at ? format(new Date(donation.created_at), 'MMM dd, yyyy • hh:mm a') : 'N/A'}
                                            </td>

                                            {/* Payment Method */}
                                            <td className="py-4 px-4 text-gray-700 dark:text-gray-200 text-xs whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/70 px-2.5 py-1 rounded-lg">
                                                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {donation.payment_method || 'Credit Card'}
                                                </span>
                                            </td>

                                            {/* Transaction ID */}
                                            <td className="py-4 px-4 font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span>{donation.transaction_id || `TXN_${donation.id}`}</span>
                                                    <button
                                                        onClick={(e) => handleCopyTxn(donation.transaction_id || `TXN_${donation.id}`, e)}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                                        title="Copy Transaction ID"
                                                    >
                                                        {copiedId === (donation.transaction_id || `TXN_${donation.id}`) ? (
                                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Copied!</span>
                                                        ) : (
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Payment Status */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {getStatusBadge(donation.status)}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Details Button */}
                                                    <button
                                                        onClick={() => setSelectedDonation(donation)}
                                                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all inline-flex items-center gap-1"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Details
                                                    </button>

                                                    {/* Receipt Download Button */}
                                                    {donation.status === 'success' && (
                                                        <button
                                                            onClick={() => downloadReceipt(donation)}
                                                            disabled={downloadingId === donation.id}
                                                            className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                                                        >
                                                            {downloadingId === donation.id ? (
                                                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                            ) : (
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            )}
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

                        {/* Pagination Footer */}
                        <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                    Showing <strong className="font-semibold text-gray-800 dark:text-gray-200">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
                                    <strong className="font-semibold text-gray-800 dark:text-gray-200">
                                        {Math.min(currentPage * itemsPerPage, filteredDonations.length)}
                                    </strong>{' '}
                                    of <strong className="font-semibold text-gray-800 dark:text-gray-200">{filteredDonations.length}</strong> donations
                                </span>
                                <div className="flex items-center gap-1">
                                    <span>Per page:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        className="py-1 px-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                    </select>
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                            currentPage === page
                                                ? 'bg-primary-600 text-white shadow-sm'
                                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Donation Details Modal */}
            {selectedDonation && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700 transition-all">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white relative">
                            <button
                                onClick={() => setSelectedDonation(null)}
                                className="absolute top-5 right-5 text-white/80 hover:text-white text-2xl font-bold focus:outline-none"
                            >
                                &times;
                            </button>
                            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase bg-white/20 rounded-full tracking-wider mb-2">
                                Donation Details
                            </span>
                            <h3 className="text-xl font-bold pr-6 line-clamp-1">{selectedDonation.campaign_title || `Campaign #${selectedDonation.campaign_id}`}</h3>
                            <p className="text-xs text-primary-100 mt-1">Receipt Number: LL-REC-{String(selectedDonation.id).padStart(6, '0')}</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <span className="text-xs text-gray-400 block font-medium uppercase">Donation Amount</span>
                                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">${parseFloat(selectedDonation.amount).toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block font-medium uppercase">Payment Status</span>
                                    <div className="mt-1">{getStatusBadge(selectedDonation.status)}</div>
                                </div>
                            </div>

                            <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Date & Time:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {selectedDonation.created_at ? format(new Date(selectedDonation.created_at), 'MMMM dd, yyyy • hh:mm a') : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Payment Gateway:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{selectedDonation.payment_method || 'Credit Card'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                                    <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-1 rounded">
                                        {selectedDonation.transaction_id || `TXN_${selectedDonation.id}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Anonymous Donation:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{selectedDonation.is_anonymous ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Recurring Frequency:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white capitalize">{selectedDonation.recurring_frequency || 'One-time'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 dark:bg-gray-900/60 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                            {selectedDonation.status === 'success' && (
                                <button
                                    onClick={() => downloadReceipt(selectedDonation)}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download PDF Receipt
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedDonation(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
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

export default DonationHistory;
