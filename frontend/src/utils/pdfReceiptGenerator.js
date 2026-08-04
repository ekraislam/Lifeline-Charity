import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export const generateProfessionalPDFReceipt = (receiptData, customTitle = 'DONATION RECEIPT', filenamePrefix = 'Lifeline_Receipt') => {
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const primaryColor = [14, 165, 233]; // Ocean Blue
        const darkColor = [15, 23, 42];      // Slate 900
        const grayText = [71, 85, 105];     // Slate 600
        const lightBg = [248, 250, 252];    // Slate 50
        const borderColor = [226, 232, 240];// Slate 200
        const successColor = [16, 185, 129];// Emerald Green

        // ════════════════ HEADER BAR ════════════════
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 38, 'F');

        // Brand Name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text('LIFELINE CHARITY', 15, 20);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Lifeline Charity Management & Philanthropy Ecosystem', 15, 27);

        // Document Title & ID (Right Aligned)
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(customTitle.toUpperCase(), 195, 20, { align: 'right' });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const receiptNo = receiptData.receipt_number || `LL-REC-${String(receiptData.id || 0).padStart(6, '0')}`;
        doc.text(`ID: ${receiptNo}`, 195, 27, { align: 'right' });

        // ════════════════ ISSUE METADATA BANNER ════════════════
        doc.setFillColor(...lightBg);
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.3);
        doc.roundedRect(15, 44, 180, 16, 3, 3, 'FD');

        const issueDate = receiptData.created_at || receiptData.date
            ? format(new Date(receiptData.created_at || receiptData.date), 'MMMM dd, yyyy • hh:mm a')
            : format(new Date(), 'MMMM dd, yyyy • hh:mm a');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('Date of Issue:', 22, 54);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayText);
        doc.text(issueDate, 47, 54);

        // Status Badge
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...successColor);
        doc.text('● VERIFIED & PAID', 190, 54, { align: 'right' });

        // ════════════════ DONOR INFORMATION CARD ════════════════
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('DONOR INFORMATION', 15, 70);

        doc.setFillColor(...lightBg);
        doc.setDrawColor(...borderColor);
        doc.roundedRect(15, 73, 87, 36, 3, 3, 'FD');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...grayText);
        doc.text('Donor Name:', 20, 81);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkColor);
        doc.text(receiptData.donor_name || 'Anonymous Donor', 45, 81);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...grayText);
        doc.text('Email:', 20, 89);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkColor);
        doc.text(receiptData.donor_email || 'N/A', 45, 89);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...grayText);
        doc.text('Phone:', 20, 97);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkColor);
        doc.text(receiptData.donor_phone || 'N/A', 45, 97);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...grayText);
        doc.text('Type:', 20, 104);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkColor);
        doc.text(receiptData.is_anonymous ? 'Anonymous Donation' : 'Public Contribution', 45, 104);

        // ════════════════ CAMPAIGN INFORMATION CARD ════════════════
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('CAMPAIGN INFORMATION', 108, 70);

        doc.setFillColor(...lightBg);
        doc.setDrawColor(...borderColor);
        doc.roundedRect(108, 73, 87, 36, 3, 3, 'FD');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...grayText);
        doc.text('Campaign:', 113, 81);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkColor);
        const campaignName = receiptData.campaign_title || 'General Community Fund';
        const splitCampaign = doc.splitTextToSize(campaignName, 55);
        doc.text(splitCampaign, 133, 81);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...grayText);
        doc.text('NGO Partner:', 113, 93);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkColor);
        doc.text(receiptData.ngo_name || 'Lifeline Partner Organization', 137, 93);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...grayText);
        doc.text('Category:', 113, 101);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkColor);
        doc.text(receiptData.category_name || 'Medical & Relief', 133, 101);

        // ════════════════ DONATION DETAILS TABLE ════════════════
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('DONATION DETAILS', 15, 120);

        // Table Header
        const tableY = 124;
        doc.setFillColor(...darkColor);
        doc.rect(15, tableY, 180, 8, 'F');

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('DESCRIPTION', 20, tableY + 5.5);
        doc.text('TRANSACTION ID', 95, tableY + 5.5);
        doc.text('METHOD', 145, tableY + 5.5);
        doc.text('AMOUNT (USD)', 190, tableY + 5.5, { align: 'right' });

        // Table Body Row
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...borderColor);
        doc.rect(15, tableY + 8, 180, 18, 'D');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('Charitable Contribution', 20, tableY + 16);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayText);
        doc.text(`Status: Completed`, 20, tableY + 22);

        doc.text(receiptData.transaction_id || `TXN_${receiptData.id}`, 95, tableY + 16);
        doc.text(receiptData.payment_method || 'Stripe / Card', 145, tableY + 16);

        const amountFormatted = `$${parseFloat(receiptData.amount || 0).toFixed(2)} USD`;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(amountFormatted, 190, tableY + 16, { align: 'right' });

        // ════════════════ TOTAL SUMMARY BOX ════════════════
        const summaryY = tableY + 32;
        doc.setFillColor(...lightBg);
        doc.setDrawColor(...borderColor);
        doc.roundedRect(108, summaryY, 87, 20, 3, 3, 'FD');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('TOTAL DONATED:', 115, summaryY + 12);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...successColor);
        doc.text(amountFormatted, 190, summaryY + 12, { align: 'right' });

        // ════════════════ THANK YOU SECTION ════════════════
        const thankY = summaryY + 28;
        doc.setFillColor(240, 253, 250); // Mint Tint
        doc.setDrawColor(153, 246, 228);
        doc.roundedRect(15, thankY, 180, 22, 3, 3, 'FD');

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 118, 110);
        doc.text('Thank you for supporting Lifeline Charity!', 22, thankY + 9);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(20, 148, 136);
        doc.text('Your generosity helps save lives, empower communities, and bring hope to people in need.', 22, thankY + 16);

        // ════════════════ FOOTER ════════════════
        const footerY = 270;
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.4);
        doc.line(15, footerY, 195, footerY);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('Lifeline Charity Platform', 15, footerY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayText);
        doc.text('Website: www.lifeline-charity.org  |  Support Email: support@lifeline.org', 15, footerY + 11);
        doc.text('This receipt was generated automatically by the Lifeline Charity Platform. © 2026 Lifeline Charity. All rights reserved.', 15, footerY + 16);

        // Save PDF
        doc.save(`${filenamePrefix}_${receiptNo}.pdf`);
    } catch (err) {
        console.error("Failed to generate PDF:", err);
        alert("Could not generate PDF receipt.");
    }
};
