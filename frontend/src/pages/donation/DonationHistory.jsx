import React, { useState, useEffect } from 'react';
import api from '../../api/axios?v=1';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

const DonationHistory = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await api.get('/donations/history');
                setDonations(response.data);
            } catch (error) {
                console.error("Error fetching donations", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDonations();
    }, []);

    const downloadReceipt = async (donationId) => {
        try {
            // Fetch specific receipt data
            const response = await api.get(`/donations/${donationId}/receipt`);
            const receiptData = response.data;
            
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(22);
            doc.setTextColor(14, 165, 233); // Primary color
            doc.text('Lifeline', 20, 20);
            
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('Donation Receipt', 20, 30);
            
            // Details
            doc.setFontSize(12);
            doc.text(`Receipt ID: ${receiptData.receipt_url.split('-')[1]}`, 20, 45);
            doc.text(`Date: ${format(new Date(receiptData.date), 'MMMM dd, yyyy')}`, 20, 52);
            
            doc.text(`Donor Name: ${receiptData.donor_name}`, 20, 65);
            doc.text(`Campaign: ${receiptData.campaign_title}`, 20, 72);
            
            doc.setFontSize(14);
            doc.text(`Amount Donated: $${receiptData.amount}`, 20, 85);
            
            // Footer
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Thank you for your generous contribution!', 20, 110);
            doc.text('Lifeline connects donors, volunteers, and NGOs.', 20, 116);
            
            doc.save(`Receipt_${donationId}.pdf`);
            
        } catch (error) {
            console.error("Error downloading receipt", error);
            alert("Could not download receipt.");
        }
    };

    if (loading) return <div className="p-12 text-center">Loading donation history...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Donation History</h1>

            {donations.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
                    You haven't made any donations yet.
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {donations.map((donation) => (
                            <li key={donation.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-primary-600 truncate">
                                            Donation to Campaign #{donation.campaign_id}
                                        </p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {donation.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                Amount: <span className="font-bold text-gray-900 dark:text-white ml-1">${donation.amount}</span>
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                                            <p>
                                                Donated on {format(new Date(donation.created_at), 'MMM dd, yyyy')}
                                            </p>
                                            {donation.status === 'success' && (
                                                <button 
                                                    onClick={() => downloadReceipt(donation.id)}
                                                    className="ml-4 px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all duration-150 inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                                >
                                                    <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    <span>Download Receipt</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DonationHistory;
