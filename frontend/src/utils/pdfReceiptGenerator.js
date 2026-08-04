import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export const generateProfessionalPDFReceipt = (receiptData, customTitle = 'DONATION RECEIPT', filenamePrefix = 'Lifeline_Receipt') => {
    try {
        const receiptNo = receiptData.receipt_number || `LL-REC-${String(receiptData.id || 0).padStart(6, '0')}`;
        
        let dateObj = new Date();
        if (receiptData.created_at || receiptData.date) {
            const parsed = new Date(receiptData.created_at || receiptData.date);
            if (!isNaN(parsed.getTime())) dateObj = parsed;
        }
        const issueDate = format(dateObj, 'MMMM dd, yyyy • hh:mm a');

        // Clean campaign title (strip any duplicated "Campaign: " prefix)
        let campaignTitle = (receiptData.campaign_title || 'General Community Fund').trim();
        campaignTitle = campaignTitle.replace(/^Campaign:\s*/i, '').trim();

        // 1. Try HTML5 Canvas rendering for 100% native UTF-8 (Bengali, English, Symbols) font support
        const canvas = document.createElement('canvas');
        const width = 1600;
        const height = 2260;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Fill background white
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);

            // Helper for rounded rectangles
            const drawRoundedRect = (x, y, w, h, r, fillStyle, strokeStyle, strokeWidth = 1) => {
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y, x + w, y + h, r);
                ctx.arcTo(x + w, y + h, x, y + h, r);
                ctx.arcTo(x, y + h, x, y, r);
                ctx.arcTo(x, y, x + w, y, r);
                ctx.closePath();
                if (fillStyle) {
                    ctx.fillStyle = fillStyle;
                    ctx.fill();
                }
                if (strokeStyle) {
                    ctx.strokeStyle = strokeStyle;
                    ctx.lineWidth = strokeWidth;
                    ctx.stroke();
                }
            };

            // Helper for multi-line wrapped text
            const drawWrappedText = (text, x, y, maxWidth, lineHeight, font = 'bold 20px "Inter", "Hind Siliguri", "Segoe UI", sans-serif', color = '#0F172A') => {
                ctx.font = font;
                ctx.fillStyle = color;
                ctx.textBaseline = 'top';

                const words = String(text).split(' ');
                let line = '';
                let currentY = y;
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && n > 0) {
                        ctx.fillText(line.trim(), x, currentY);
                        line = words[n] + ' ';
                        currentY += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line.trim(), x, currentY);
                return currentY;
            };

            // ════════════ HEADER BAR ════════════
            ctx.fillStyle = '#0EA5E9'; // Ocean Blue
            ctx.fillRect(0, 0, width, 220);

            // Brand
            ctx.font = 'bold 42px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textBaseline = 'top';
            ctx.fillText('LIFELINE CHARITY', 90, 60);

            ctx.font = '20px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText('Lifeline Charity Management & Philanthropy Ecosystem', 90, 125);

            // Document Title & Receipt ID (Right Aligned)
            ctx.textAlign = 'right';
            ctx.font = 'bold 30px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(customTitle.toUpperCase(), 1510, 60);

            ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(`ID: ${receiptNo}`, 1510, 115);

            ctx.textAlign = 'left'; // Reset alignment

            // ════════════ ISSUE METADATA BANNER ════════════
            drawRoundedRect(90, 260, 1420, 100, 16, '#F8FAFC', '#E2E8F0', 2);

            ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#0F172A';
            ctx.fillText('Date of Issue:', 130, 295);

            ctx.font = '22px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#475569';
            ctx.fillText(issueDate, 300, 295);

            // Status Badge (Green circle dot + text)
            ctx.beginPath();
            ctx.arc(1330, 310, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#10B981';
            ctx.fill();

            ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#10B981';
            ctx.fillText('VERIFIED & PAID', 1350, 295);

            // ════════════ DONOR INFORMATION CARD ════════════
            ctx.font = 'bold 24px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#0F172A';
            ctx.fillText('DONOR INFORMATION', 90, 410);

            drawRoundedRect(90, 450, 680, 260, 16, '#F8FAFC', '#E2E8F0', 2);

            const drawLabelValue = (label, val, x, y, labelWidth = 170) => {
                ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
                ctx.fillStyle = '#64748B';
                ctx.fillText(label, x, y);

                ctx.font = 'bold 20px "Inter", "Hind Siliguri", "Segoe UI", sans-serif';
                ctx.fillStyle = '#0F172A';
                ctx.fillText(String(val || 'N/A'), x + labelWidth, y);
            };

            drawLabelValue('Donor Name:', receiptData.donor_name || 'Anonymous Donor', 120, 485);
            drawLabelValue('Email:', receiptData.donor_email || 'N/A', 120, 535);
            drawLabelValue('Phone:', receiptData.donor_phone || 'N/A', 120, 585);
            drawLabelValue('Type:', receiptData.is_anonymous ? 'Anonymous Donation' : 'Public Contribution', 120, 635);

            // ════════════ CAMPAIGN INFORMATION CARD ════════════
            ctx.font = 'bold 24px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#0F172A';
            ctx.fillText('CAMPAIGN INFORMATION', 830, 410);

            drawRoundedRect(830, 450, 680, 260, 16, '#F8FAFC', '#E2E8F0', 2);

            // Campaign Label
            ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#64748B';
            ctx.fillText('Campaign:', 860, 485);

            // Campaign Name (Supports Bengali / UTF-8 natively!)
            drawWrappedText(campaignTitle, 1020, 485, 460, 28, 'bold 20px "Inter", "Hind Siliguri", "Segoe UI", sans-serif', '#0F172A');

            drawLabelValue('NGO Partner:', receiptData.ngo_name || 'Lifeline Partner Organization', 860, 585, 170);
            drawLabelValue('Category:', receiptData.category_name || 'Medical & Relief', 860, 635, 170);

            // ════════════ DONATION DETAILS TABLE ════════════
            ctx.font = 'bold 24px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#0F172A';
            ctx.fillText('DONATION DETAILS', 90, 760);

            // Table Header
            drawRoundedRect(90, 800, 1420, 60, 12, '#0F172A', null);

            ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('DESCRIPTION', 130, 818);
            ctx.fillText('TRANSACTION ID', 700, 818);
            ctx.fillText('METHOD', 1100, 818);
            ctx.textAlign = 'right';
            ctx.fillText('AMOUNT (USD)', 1470, 818);
            ctx.textAlign = 'left';

            // Table Body Row
            drawRoundedRect(90, 860, 1420, 120, 12, '#FFFFFF', '#E2E8F0', 2);

            ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#0F172A';
            ctx.fillText('Charitable Contribution', 130, 895);

            ctx.font = '18px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#64748B';
            ctx.fillText('Status: Completed', 130, 930);

            ctx.font = '20px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#475569';
            ctx.fillText(receiptData.transaction_id || `TXN_${receiptData.id}`, 700, 910);
            ctx.fillText(receiptData.payment_method || 'Stripe / Card', 1100, 910);

            const amountFormatted = `$${parseFloat(receiptData.amount || 0).toFixed(2)} USD`;
            ctx.textAlign = 'right';
            ctx.font = 'bold 24px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#0EA5E9';
            ctx.fillText(amountFormatted, 1470, 910);
            ctx.textAlign = 'left';

            // ════════════ TOTAL SUMMARY BOX ════════════
            drawRoundedRect(830, 1020, 680, 140, 16, '#F8FAFC', '#E2E8F0', 2);

            ctx.font = 'bold 24px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#0F172A';
            ctx.fillText('TOTAL DONATED:', 870, 1070);

            ctx.textAlign = 'right';
            ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#10B981';
            ctx.fillText(amountFormatted, 1470, 1065);
            ctx.textAlign = 'left';

            // ════════════ THANK YOU SECTION ════════════
            drawRoundedRect(90, 1200, 1420, 140, 16, '#F0FDF4', '#99F6E4', 2);

            ctx.font = 'bold 24px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#0F766E';
            ctx.fillText('Thank you for supporting Lifeline Charity!', 130, 1240);

            ctx.font = '20px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#14B8A6';
            ctx.fillText('Your generosity helps save lives, empower communities, and bring hope to people in need.', 130, 1285);

            // ════════════ FOOTER ════════════
            ctx.beginPath();
            ctx.moveTo(90, 2100);
            ctx.lineTo(1510, 2100);
            ctx.strokeStyle = '#E2E8F0';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#0F172A';
            ctx.fillText('Lifeline Charity Platform', 90, 2130);

            ctx.font = '16px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = '#64748B';
            ctx.fillText('Website: www.lifeline-charity.org  |  Support Email: support@lifeline.org', 90, 2160);
            ctx.fillText('This receipt was generated automatically by the Lifeline Charity Platform. © 2026 Lifeline Charity. All rights reserved.', 90, 2190);

            // Convert Canvas to Image & Export PDF
            const imgData = canvas.toDataURL('image/png');
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            doc.addImage(imgData, 'PNG', 0, 0, 210, 297);
            doc.save(`${filenamePrefix}_${receiptNo}.pdf`);
            return;
        }
    } catch (canvasErr) {
        console.error("Canvas PDF generation error, using jsPDF fallback:", canvasErr);
    }

    // Direct jsPDF Fallback (with sanitized ASCII strings)
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const receiptNo = receiptData.receipt_number || `LL-REC-${String(receiptData.id || 0).padStart(6, '0')}`;

        doc.setFillColor(14, 165, 233);
        doc.rect(0, 0, 210, 38, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text('LIFELINE CHARITY', 15, 20);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Lifeline Charity Management & Philanthropy Ecosystem', 15, 27);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(customTitle.toUpperCase(), 195, 20, { align: 'right' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`ID: ${receiptNo}`, 195, 27, { align: 'right' });

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(15, 44, 180, 16, 3, 3, 'FD');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Date of Issue:', 22, 54);

        doc.setFillColor(16, 185, 129);
        doc.circle(156, 53, 1.2, 'F');
        doc.setTextColor(16, 185, 129);
        doc.text('VERIFIED & PAID', 190, 54, { align: 'right' });

        const sanitizeAscii = (str) => String(str || '').replace(/[^\x00-\x7F]/g, '');
        let cleanTitle = sanitizeAscii(receiptData.campaign_title || 'General Fund').replace(/^Campaign:\s*/i, '').trim();

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('Campaign:', 113, 81);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(cleanTitle || 'Community Support', 133, 81);

        doc.save(`${filenamePrefix}_${receiptNo}.pdf`);
    } catch (err) {
        console.error("Failed to generate fallback PDF receipt:", err);
        alert("Could not generate PDF receipt.");
    }
};
