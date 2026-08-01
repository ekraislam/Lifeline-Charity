import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios?v=1';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { broadcastLocalCampaignUpdate } from '../../hooks/useCampaignRealtime';

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

const DonateModal = ({ isOpen, onClose, campaignProp }) => {
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loadingCampaign, setLoadingCampaign] = useState(false);

    // Form states
    const [amount, setAmount] = useState('50');
    const [customAmount, setCustomAmount] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState('monthly');

    // Checkout flow states: 'input' -> 'stripe_checkout' -> 'processing' -> 'success' -> 'cancelled'
    const [step, setStep] = useState('input');
    const [donationResult, setDonationResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (typeof campaignProp === 'object' && campaignProp !== null && campaignProp.title) {
            setCampaign(campaignProp);
        } else if (campaignProp) {
            fetchCampaignDetails(campaignProp);
        } else {
            fetchFirstCampaign();
        }
    }, [isOpen, campaignProp]);

    const fetchCampaignDetails = async (id) => {
        setLoadingCampaign(true);
        try {
            const res = await api.get(`/campaigns/${id}`);
            setCampaign(res.data);
        } catch (e) {
            console.error("Failed to load campaign:", e);
        } finally {
            setLoadingCampaign(false);
        }
    };

    const fetchFirstCampaign = async () => {
        setLoadingCampaign(true);
        try {
            const res = await api.get('/campaigns');
            if (res.data && res.data.length > 0) {
                setCampaign(res.data[0]);
            }
        } catch (e) {
            console.error("Failed to load campaigns:", e);
        } finally {
            setLoadingCampaign(false);
        }
    };

    const finalAmount = parseFloat(customAmount || amount) || 0;

    const handleInitiateStripe = async (e) => {
        e.preventDefault();
        if (finalAmount <= 0) {
            setErrorMessage('Please enter a valid donation amount greater than $0.');
            return;
        }

        if (!campaign || !campaign.id) {
            setErrorMessage('No active campaign selected.');
            return;
        }

        setErrorMessage('');
        setStep('stripe_checkout');
    };

    const handleExecuteStripePayment = async (shouldFail = false) => {
        if (shouldFail) {
            setStep('cancelled');
            setErrorMessage('Payment process was cancelled by user.');
            return;
        }

        setSubmitting(true);
        setErrorMessage('');
        try {
            const donateRes = await api.post('/donations', {
                campaign_id: campaign.id,
                amount: finalAmount,
                is_anonymous: isAnonymous,
                is_recurring: isRecurring,
                recurring_frequency: isRecurring ? frequency : 'none'
            });

            const donationId = donateRes.data.donation_id;
            const checkoutUrl = donateRes.data.checkout_url || donateRes.data.payment_url;

            if (checkoutUrl) {
                try {
                    const parsedUrl = new URL(checkoutUrl);
                    const path = parsedUrl.pathname.replace(/^\/?api/, '') + parsedUrl.search;
                    await api.get(path);
                } catch (err) {
                    console.warn("Direct callback parse warning:", err);
                }
            }

            const detailsRes = await api.get(`/donations/${donationId}`);
            setDonationResult(detailsRes.data || {
                id: donationId,
                amount: finalAmount,
                campaign_title: campaign.title,
                transaction_id: donateRes.data.transaction_id || `cs_test_${Date.now()}`,
                payment_method: 'Stripe Checkout',
                created_at: new Date().toISOString()
            });

            broadcastLocalCampaignUpdate({ campaign_id: campaign.id, amount: finalAmount });
            setStep('success');
        } catch (err) {
            console.error("Stripe Donation Execution Error:", err);
            setErrorMessage(err.response?.data?.message || 'Payment processing failed. Please try again.');
            setStep('cancelled');
        } finally {
            setSubmitting(false);
        }
    };

    const generatePDFReceipt = (receiptData) => {
        setDownloadingPDF(true);
        try {
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            doc.setFillColor(2, 132, 199);
            doc.rect(0, 0, 210, 42, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(255, 255, 255);
            doc.text('LIFELINE FOUNDATION', 15, 22);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Official Stripe Payment Receipt', 15, 29);

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('DONATION RECEIPT', 140, 22);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`NO: LL-REC-${String(receiptData.id || 0).padStart(6, '0')}`, 140, 29);

            doc.setDrawColor(226, 232, 240);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(15, 50, 180, 20, 3, 3, 'FD');

            doc.setFontSize(10);
            doc.setTextColor(71, 85, 105);
            const issueDate = receiptData.created_at ? format(new Date(receiptData.created_at), 'MMMM dd, yyyy • hh:mm a') : format(new Date(), 'MMMM dd, yyyy');
            doc.text(`Date of Issue: ${issueDate}`, 22, 62);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(16, 185, 129);
            doc.text('STATUS: PAID VIA STRIPE', 125, 62);

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text('DONATION SUMMARY', 15, 85);
            doc.setLineWidth(0.5);
            doc.setDrawColor(14, 165, 233);
            doc.line(15, 88, 195, 88);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(51, 65, 85);
            doc.text('Campaign:', 15, 98);
            doc.setFont('helvetica', 'normal');
            doc.text(receiptData.campaign_title || campaign?.title || 'Lifeline Campaign', 50, 98);

            doc.setFont('helvetica', 'bold');
            doc.text('Amount Donated:', 15, 106);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(14, 165, 233);
            doc.text(`$${parseFloat(receiptData.amount || finalAmount).toFixed(2)} USD`, 50, 106);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(51, 65, 85);
            doc.text('Payment Gateway:', 15, 114);
            doc.setFont('helvetica', 'normal');
            doc.text('Stripe Checkout (Test Mode)', 50, 114);

            doc.setFont('helvetica', 'bold');
            doc.text('Transaction ID:', 15, 122);
            doc.setFont('helvetica', 'normal');
            doc.text(receiptData.transaction_id || `cs_test_${receiptData.id}`, 50, 122);

            doc.setFillColor(254, 243, 199);
            doc.setDrawColor(251, 191, 36);
            doc.roundedRect(15, 140, 180, 20, 2, 2, 'FD');

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(146, 64, 14);
            doc.text('Tax Deductible Receipt:', 20, 148);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(180, 83, 9);
            doc.text('Lifeline Charity Foundation is a registered 501(c)(3) organization. Keep this receipt for your records.', 20, 154);

            doc.setDrawColor(203, 213, 225);
            doc.line(15, 250, 195, 250);

            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text('Thank you for supporting Lifeline Foundation!', 15, 258);
            doc.text('Stripe Verified Digital Receipt', 140, 258);

            doc.save(`Lifeline_Stripe_Receipt_${receiptData.id || Date.now()}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF:", err);
            alert("Could not generate PDF receipt.");
        } finally {
            setDownloadingPDF(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-800 transition-all animate-fade-in-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-indigo-700 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold transition-all cursor-pointer"
                        title="Close Modal"
                    >
                        &times;
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/20 tracking-wider">
                            💳 Stripe Secure Checkout
                        </span>
                    </div>
                    <h2 className="font-display text-2xl font-black tracking-tight">Make a Contribution</h2>
                    {loadingCampaign ? (
                        <div className="h-4 w-48 bg-white/30 rounded animate-pulse mt-2"></div>
                    ) : (
                        <p className="text-xs text-primary-100 mt-1 truncate">
                            Campaign: <span className="font-bold underline decoration-indigo-300">{campaign?.title || 'Lifeline General Fund'}</span>
                        </p>
                    )}
                </div>

                {/* Body Content based on Step */}
                <div className="p-6">
                    {errorMessage && (
                        <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3">
                            <span className="text-lg">⚠️</span>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* STEP 1: INPUT AMOUNT */}
                    {step === 'input' && (
                        <form onSubmit={handleInitiateStripe} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                                    Select Contribution Amount (USD)
                                </label>
                                <div className="grid grid-cols-3 gap-2.5 mb-3">
                                    {PRESET_AMOUNTS.map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => { setAmount(String(amt)); setCustomAmount(''); }}
                                            className={`py-3 rounded-2xl text-sm font-black transition-all border cursor-pointer ${
                                                amount === String(amt) && !customAmount
                                                    ? 'bg-primary-600 text-white border-primary-600 shadow-md ring-2 ring-primary-400/50'
                                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            ${amt}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative rounded-2xl">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 font-bold">
                                        $
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        placeholder="Custom Amount (USD)"
                                        value={customAmount}
                                        onChange={(e) => { setCustomAmount(e.target.value); setAmount(''); }}
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <div>
                                        <span className="text-xs font-bold text-gray-900 dark:text-white block">Make this a Monthly Donation</span>
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400">Support this cause automatically every month</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isRecurring}
                                        onChange={(e) => setIsRecurring(e.target.checked)}
                                        className="w-5 h-5 text-primary-600 rounded-md border-gray-300 focus:ring-primary-500 cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <div>
                                        <span className="text-xs font-bold text-gray-900 dark:text-white block">Donate Anonymously</span>
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400">Hide your name from public donor lists</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="w-5 h-5 text-primary-600 rounded-md border-gray-300 focus:ring-primary-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-full py-4 text-sm uppercase tracking-wider">
                                <span>Proceed to Stripe Checkout</span>
                                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-black">${finalAmount.toFixed(2)}</span>
                            </button>

                            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 font-bold">
                                🔒 256-bit SSL Encrypted • Powered by Stripe Checkout
                            </div>
                        </form>
                    )}

                    {/* STEP 2: STRIPE CHECKOUT SIMULATOR */}
                    {step === 'stripe_checkout' && (
                        <div className="space-y-6 text-center py-2">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                                        Stripe Checkout (Test Mode)
                                    </span>
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">${finalAmount.toFixed(2)} USD</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 text-left">
                                    You are completing a test donation for <strong>{campaign?.title}</strong>.
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-left space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-200">Test Card Number</label>
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Test Mode</span>
                                </div>
                                <input
                                    type="text"
                                    readOnly
                                    value="4242 •••• •••• 4242"
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 px-3 font-mono text-sm text-gray-900 dark:text-white"
                                />
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Expires</span>
                                        <input type="text" readOnly value="12/28" className="w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl py-1.5 px-3 font-mono text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">CVC</span>
                                        <input type="text" readOnly value="424" className="w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl py-1.5 px-3 font-mono text-gray-900 dark:text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleExecuteStripePayment(false)}
                                    disabled={submitting}
                                    className="btn-success w-full py-4 text-sm uppercase tracking-wider disabled:opacity-50"
                                >
                                    {submitting ? 'Processing Payment...' : `Confirm & Pay $${finalAmount.toFixed(2)}`}
                                </button>

                                <button
                                    onClick={() => handleExecuteStripePayment(true)}
                                    disabled={submitting}
                                    className="btn-danger w-full py-2.5 text-xs uppercase tracking-wider"
                                >
                                    Cancel Payment
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {step === 'success' && donationResult && (
                        <div className="text-center py-4 space-y-5">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl mx-auto shadow-inner">
                                ✓
                            </div>

                            <div>
                                <h3 className="font-display text-2xl font-black text-gray-900 dark:text-white">Payment Successful!</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Your donation of <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">${parseFloat(donationResult.amount || finalAmount).toFixed(2)} USD</strong> has been received.
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-left space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                                    <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{donationResult.transaction_id || `cs_test_${donationResult.id}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Campaign:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{donationResult.campaign_title || campaign?.title}</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={() => generatePDFReceipt(donationResult)}
                                    disabled={downloadingPDF}
                                    className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider disabled:opacity-50"
                                >
                                    {downloadingPDF ? 'Generating Receipt...' : '📄 Download Official PDF Receipt'}
                                </button>

                                <button
                                    onClick={() => { onClose(); navigate('/donations/history'); }}
                                    className="btn-secondary w-full py-3.5 text-xs uppercase tracking-wider"
                                >
                                    View Donation History
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: CANCELLED */}
                    {step === 'cancelled' && (
                        <div className="text-center py-6 space-y-4">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 text-2xl mx-auto">
                                ✕
                            </div>

                            <div>
                                <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">Payment Cancelled</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Transaction cancelled. No charges were processed.
                                </p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setStep('input')} className="btn-primary flex-1 py-3 text-xs">
                                    Try Again
                                </button>
                                <button onClick={onClose} className="btn-secondary flex-1 py-3 text-xs">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonateModal;
