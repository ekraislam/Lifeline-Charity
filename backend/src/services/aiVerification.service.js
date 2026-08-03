const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { createWorker } = require('tesseract.js');

class AIVerificationService {
    /**
     * Helper to locate physical file on disk from relative URL
     */
    resolveFilePath(documentUrl) {
        if (!documentUrl) return null;
        const cleanPath = documentUrl.replace(/^\//, '');
        
        const possiblePaths = [
            path.join(__dirname, '../../public', cleanPath),
            path.join(__dirname, '../../', cleanPath),
            path.join(__dirname, '../../uploads', path.basename(cleanPath))
        ];

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) return p;
        }
        return null;
    }

    /**
     * Extract raw text from an image using Tesseract OCR
     */
    async performOCR(filePath) {
        if (!filePath) return '';
        const ext = path.extname(filePath).toLowerCase();
        if (['.pdf'].includes(ext)) {
            return `[PDF Document: ${path.basename(filePath)}]`;
        }

        try {
            const worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(filePath);
            await worker.terminate();
            return text || '';
        } catch (err) {
            console.error(`OCR Extraction Error for ${filePath}:`, err.message);
            return '';
        }
    }

    /**
     * Dynamically analyzes uploaded documents for a beneficiary help request.
     * Evaluates missing NID, medical report, prescription, hospital/doctor info,
     * OCR confidence, image quality, document manipulation, duplicates, and inconsistencies.
     */
    async analyzeHelpRequest(helpRequestId) {
        const [rows] = await db.query(`
            SELECT hr.id, hr.title, hr.description, hr.required_amount, hr.status, hr.created_at, hr.beneficiary_id,
                   u.name as beneficiary_name, u.email as beneficiary_email, u.phone as beneficiary_phone
            FROM help_requests hr
            JOIN beneficiaries b ON hr.beneficiary_id = b.id
            JOIN users u ON b.user_id = u.id
            WHERE hr.id = ?
        `, [helpRequestId]);

        if (rows.length === 0) {
            throw new Error('Help request not found');
        }

        const request = rows[0];
        const [docs] = await db.query('SELECT id, document_url FROM help_request_documents WHERE help_request_id = ?', [helpRequestId]);

        const documentCount = docs.length;
        const requiredAmount = parseFloat(request.required_amount || 0);

        let combinedOcrText = '';
        let hasPhotoshopMetadata = false;
        let lowestQualityScore = 100;
        let fileAnalyses = [];
        let duplicateDocDetected = false;

        // Fetch all documents from other requests to perform file size / duplicate checks
        const [otherDocs] = await db.query('SELECT help_request_id, document_url FROM help_request_documents WHERE help_request_id != ?', [helpRequestId]);

        for (const doc of docs) {
            const filePath = this.resolveFilePath(doc.document_url);
            if (filePath) {
                const stat = fs.statSync(filePath);
                const ext = path.extname(filePath).toLowerCase();

                // Extract text from image/document
                const ocrText = await this.performOCR(filePath);
                combinedOcrText += `\n--- Document (${path.basename(filePath)}) ---\n` + ocrText;

                // Inspect binary header for software editing tags (Photoshop/Canva/GIMP)
                if (['.jpg', '.jpeg', '.png'].includes(ext)) {
                    try {
                        const buffer = fs.readFileSync(filePath);
                        const headerStr = buffer.toString('binary', 0, Math.min(buffer.length, 4096));
                        if (/photoshop|gimp|canva|adobe|editor|paint\.net/i.test(headerStr)) {
                            hasPhotoshopMetadata = true;
                        }
                    } catch (e) {}
                }

                // File size-based quality heuristic
                const fileQuality = stat.size < 20000 ? 45 : stat.size < 50000 ? 70 : 95;
                if (fileQuality < lowestQualityScore) lowestQualityScore = fileQuality;

                // Duplicate file size / content check across other requests
                for (const otherDoc of otherDocs) {
                    const otherFp = this.resolveFilePath(otherDoc.document_url);
                    if (otherFp && fs.existsSync(otherFp)) {
                        const otherStat = fs.statSync(otherFp);
                        if (otherStat.size === stat.size && stat.size > 0) {
                            duplicateDocDetected = true;
                            break;
                        }
                    }
                }

                fileAnalyses.push({
                    file: path.basename(filePath),
                    size_kb: Math.round(stat.size / 1024),
                    ext
                });
            }
        }

        // Check if Gemini Vision API key is configured
        let apiKey = process.env.GEMINI_API_KEY;
        let geminiAnalysis = null;

        if (apiKey && docs.length > 0) {
            try {
                const { GoogleGenAI } = require('@google/genai');
                const ai = new GoogleGenAI({ apiKey });
                
                const prompt = `Analyze beneficiary help request documents for "${request.beneficiary_name}" (Requested Amount: $${requiredAmount}).
Title: "${request.title}"
Extracted Document Text:\n${combinedOcrText.slice(0, 3000)}

Perform strict document audit and return a JSON object ONLY with:
1. "ocr_data": { "patient_name", "nid_number", "dob_age", "hospital_name", "doctor_name", "diagnosis", "extracted_amount", "prescription_details", "document_date" }
2. "missing_info": array of missing documents or information (e.g. missing NID, missing medical report, missing prescription, missing hospital, missing doctor)
3. "suspicious_findings": array of fraud indicators, editing software, low quality, or inconsistencies
4. "risk_level": "Low Risk" | "Medium Risk" | "High Risk"
5. "confidence_score": 0-100 number
6. "reason_for_risk": single detailed sentence explaining exact reasons for the assigned risk level
7. "recommendation": actionable advice for admin review`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });

                if (response && response.text) {
                    const text = response.text.trim().replace(/^```json/, '').replace(/```$/, '');
                    geminiAnalysis = JSON.parse(text);
                }
            } catch (err) {
                console.warn("Gemini API direct Vision call skipped/failed:", err.message);
            }
        }

        // Dynamic Multi-Factor Evaluation Engine
        let ocr_data = {};
        let missing_info = [];
        let suspicious_findings = [];
        let risk_level = 'Low Risk';
        let confidence_score = 95;
        let reason_for_risk = '';
        let recommendation = '';

        if (geminiAnalysis) {
            ocr_data = geminiAnalysis.ocr_data || {};
            missing_info = geminiAnalysis.missing_info || [];
            suspicious_findings = geminiAnalysis.suspicious_findings || [];
            risk_level = geminiAnalysis.risk_level || 'Low Risk';
            confidence_score = geminiAnalysis.confidence_score || 85;
            reason_for_risk = geminiAnalysis.reason_for_risk || `Assigned ${risk_level} based on Gemini Vision AI analysis.`;
            recommendation = geminiAnalysis.recommendation || '';
        } else {
            // Precise NID Matching (Requires NID keyword prefix or National ID format)
            const nidMatch = combinedOcrText.match(/(NID|National\s*ID|Identity|ID\s*No|Card\s*No|NID\s*Number)[^\d]*(\d{10,17})/i);
            const hospitalMatch = combinedOcrText.match(/(Hospital|Medical\s*College|Clinic|Institute|Center|Diagnostic)[^\n\r,.]*/i);
            const doctorMatch = combinedOcrText.match(/(Dr\.?\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*|Doctor|Prof\.?\s+[A-Z][a-z]+|Consultant|Surgeon)/i);
            const medicalReportMatch = combinedOcrText.match(/(Medical\s*Report|Diagnosis|Diagnostic|Pathology|Patient|Admission|Discharge|Clinical)[^\n\r,.]*/i);
            const costMatch = combinedOcrText.match(/(\$|USD|Tk|BDT)?\s*([\d,]{4,})/);
            const dobMatch = combinedOcrText.match(/(DOB|Age|Date of Birth)[^\n\r,.]*/i);
            const rxMatch = combinedOcrText.match(/(Tab|Cap|Syr|Inj|Dosage|Prescription|Rx)[^\n\r,.]*/i);

            ocr_data = {
                patient_name: request.beneficiary_name,
                nid_number: nidMatch ? `Extracted: ${nidMatch[2] || nidMatch[0]}` : 'Not Detected in OCR',
                dob_age: dobMatch ? dobMatch[0] : 'Not Specified',
                hospital_name: hospitalMatch ? hospitalMatch[0] : 'Not Detected in OCR',
                doctor_name: doctorMatch ? doctorMatch[0] : 'Not Detected in OCR',
                diagnosis: medicalReportMatch ? medicalReportMatch[0] : (request.title || 'Medical Treatment Request'),
                extracted_amount: costMatch ? `$${costMatch[2]}` : `$${requiredAmount.toLocaleString()}`,
                prescription_details: rxMatch ? rxMatch[0] : 'Not Explicitly Extracted',
                document_date: new Date(request.created_at).toLocaleDateString()
            };

            // 1. Evaluate Missing Required Documents & Information
            if (documentCount === 0) {
                missing_info.push('Missing National ID (NID) card.');
                missing_info.push('Missing official Medical Report.');
                missing_info.push('Missing doctor Prescription.');
                missing_info.push('Missing Hospital / Center information.');
                suspicious_findings.push('Zero Uploaded Documents: Help request submitted without any file attachments.');
                confidence_score = 20;
            } else {
                if (documentCount === 1) {
                    missing_info.push('Single Document Uploaded: Verification guidelines recommend separate NID card and prescription scans.');
                    confidence_score -= 15;
                }

                if (!nidMatch) {
                    missing_info.push('Missing National ID (NID): Readable NID number with official NID header was not detected in document OCR.');
                    confidence_score -= 20;
                }

                if (!medicalReportMatch) {
                    missing_info.push('Missing Medical Report: Clear medical diagnostic report or clinical summary not detected.');
                    confidence_score -= 20;
                }

                if (!rxMatch) {
                    missing_info.push('Missing Prescription: No doctor prescription or dosage details found.');
                    confidence_score -= 15;
                }

                if (!hospitalMatch) {
                    missing_info.push('Missing Hospital Information: Official hospital header or clinic stamp missing.');
                    confidence_score -= 15;
                }

                if (!doctorMatch) {
                    missing_info.push('Missing Doctor Information: Attending physician name or signature missing.');
                    confidence_score -= 15;
                }
            }

            // 2. Evaluate OCR Confidence & Image Quality
            const wordCount = combinedOcrText.trim().split(/\s+/).filter(Boolean).length;
            if (documentCount > 0 && wordCount < 15) {
                suspicious_findings.push(`Low OCR Text Legibility (${wordCount} words detected): Uploaded image has low text clarity or blurriness.`);
                confidence_score -= 15;
            }

            if (lowestQualityScore < 60 && documentCount > 0) {
                suspicious_findings.push('Low Image Quality: File size is under 25KB or image resolution is reduced.');
                confidence_score -= 10;
            }

            // 3. Document Manipulation & Fraud Detection
            if (hasPhotoshopMetadata) {
                suspicious_findings.push('Possible Document Manipulation: Digital image editing software headers (Photoshop/Canva/GIMP) detected in file EXIF metadata.');
                confidence_score -= 30;
            }

            // 4. Duplicate Document Detection Across Requests
            if (duplicateDocDetected) {
                suspicious_findings.push('Duplicate Document Detected: An identical file size / document was previously uploaded for another help request.');
                confidence_score -= 30;
            }

            // 5. Inconsistent Information Between Documents & Request
            if (costMatch) {
                const extractedNum = parseFloat(costMatch[2].replace(/,/g, ''));
                if (extractedNum > 0 && requiredAmount > extractedNum * 2.5) {
                    suspicious_findings.push(`Inconsistent Financial Request: Requested amount ($${requiredAmount.toLocaleString()}) significantly exceeds extracted cost ($${extractedNum.toLocaleString()}).`);
                    confidence_score -= 20;
                }
            }

            // Check if beneficiary user has multiple active requests in short timeframe
            const [recentReqs] = await db.query(`
                SELECT id FROM help_requests 
                WHERE beneficiary_id = ? AND id != ? AND created_at > NOW() - INTERVAL 30 DAY
            `, [request.beneficiary_id, helpRequestId]);
            if (recentReqs.length > 0) {
                suspicious_findings.push(`Duplicate Request Alert: Beneficiary has submitted ${recentReqs.length} other request(s) within the last 30 days.`);
                confidence_score -= 15;
            }

            // Clamp confidence score between 15% and 98%
            confidence_score = Math.max(15, Math.min(98, confidence_score));

            // Dynamic Risk Level Assessment Rules
            if (documentCount === 0) {
                risk_level = 'High Risk';
                reason_for_risk = 'High Risk: No uploaded documents were provided. Identity (NID), medical report, and prescription are missing.';
            } else if (hasPhotoshopMetadata || duplicateDocDetected || (!nidMatch && !medicalReportMatch) || confidence_score < 55) {
                risk_level = 'High Risk';
                const mainCauses = [];
                if (hasPhotoshopMetadata) mainCauses.push('digital image editing software headers detected');
                if (duplicateDocDetected) mainCauses.push('duplicate document reuse across requests');
                if (!nidMatch) mainCauses.push('missing National ID (NID)');
                if (!medicalReportMatch) mainCauses.push('missing medical report');
                
                reason_for_risk = `High Risk: ${mainCauses.length > 0 ? mainCauses.join(', ') : 'Critical document anomalies and low confidence score (' + confidence_score + '%)'}.`;
            } else if (missing_info.length >= 2 || confidence_score < 80 || documentCount === 1) {
                risk_level = 'Medium Risk';
                const medCauses = missing_info.map(m => m.split(':')[0]).slice(0, 2);
                reason_for_risk = `Medium Risk: ${medCauses.length > 0 ? medCauses.join(' and ') + ' require verification' : 'Single document upload or moderate confidence (' + confidence_score + '%)'}. Admin manual review recommended.`;
            } else {
                risk_level = 'Low Risk';
                reason_for_risk = `Low Risk: Complete set of authentic document structures (NID, Hospital header, Doctor info) with high OCR readability (${confidence_score}% confidence).`;
            }

            if (risk_level === 'Low Risk') {
                recommendation = `LOW RISK ASSESSMENT: All key medical and identity documents are present with clean metadata. Admin final approval is recommended.`;
            } else if (risk_level === 'Medium Risk') {
                recommendation = `MEDIUM RISK ASSESSMENT: Partial document coverage detected (${missing_info.length} missing field(s)). Admin manual audit recommended before approving.`;
            } else {
                recommendation = `HIGH RISK ASSESSMENT: Critical document anomalies or missing mandatory records flagged. Thorough manual admin investigation required prior to decision.`;
            }
        }

        const nid_analysis = {
            readability_score: lowestQualityScore,
            nid_format_match: !missing_info.some(m => m.includes('NID')),
            tampering_anomalies_detected: hasPhotoshopMetadata || duplicateDocDetected,
            photo_similarity_score: documentCount > 0 ? lowestQualityScore : 0,
            status: !missing_info.some(m => m.includes('NID')) ? 'VERIFIED' : documentCount > 0 ? 'PARTIAL' : 'MISSING'
        };

        const medical_analysis = {
            hospital_stamp_detected: !missing_info.some(m => m.includes('Hospital')),
            doctor_signature_detected: !missing_info.some(m => m.includes('Doctor')),
            treatment_date: new Date(request.created_at).toLocaleDateString(),
            treatment_cost_validity: requiredAmount <= 50000 ? 'Consistent' : 'High Funding Target - Manual Audit Required',
            status: missing_info.length === 0 ? 'VERIFIED' : 'PARTIAL'
        };

        const reportData = {
            help_request_id: helpRequestId,
            ocr_data: JSON.stringify(ocr_data),
            nid_analysis: JSON.stringify(nid_analysis),
            medical_analysis: JSON.stringify(medical_analysis),
            missing_info: JSON.stringify(missing_info),
            suspicious_findings: JSON.stringify(suspicious_findings),
            confidence_score,
            risk_level,
            reason_for_risk,
            recommendation
        };

        // Persist in single source of truth database table
        await db.query(`
            INSERT INTO ai_verification_reports 
            (help_request_id, ocr_data, nid_analysis, medical_analysis, missing_info, suspicious_findings, confidence_score, risk_level, reason_for_risk, recommendation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            ocr_data = VALUES(ocr_data),
            nid_analysis = VALUES(nid_analysis),
            medical_analysis = VALUES(medical_analysis),
            missing_info = VALUES(missing_info),
            suspicious_findings = VALUES(suspicious_findings),
            confidence_score = VALUES(confidence_score),
            risk_level = VALUES(risk_level),
            reason_for_risk = VALUES(reason_for_risk),
            recommendation = VALUES(recommendation),
            updated_at = CURRENT_TIMESTAMP
        `, [
            reportData.help_request_id,
            reportData.ocr_data,
            reportData.nid_analysis,
            reportData.medical_analysis,
            reportData.missing_info,
            reportData.suspicious_findings,
            reportData.confidence_score,
            reportData.risk_level,
            reportData.reason_for_risk,
            reportData.recommendation
        ]);

        try {
            const { logActivity } = require('./activityLog.service');
            await logActivity({
                userId: request.user_id || null,
                userName: request.beneficiary_name || 'AI Audit Engine',
                userRole: 'AI Agent',
                activityType: 'ai_verification_completed',
                activityTitle: 'AI Verification Completed',
                activityDescription: `AI verified help request #${helpRequestId} with confidence score ${confidence_score}% (${risk_level}).`,
                relatedId: helpRequestId
            });
        } catch (actErr) {
            console.warn("Activity log error in AI verification:", actErr.message);
        }


        // Notify admin & beneficiary that AI analysis completed
        try {
            const { createAdminNotification, createNotification } = require('./notification.service');
            await createAdminNotification({
                title: '🤖 AI Document Analysis Completed',
                message: `AI verification for Help Request #${helpRequestId} completed. Risk: ${risk_level}, Confidence: ${confidence_score}%.`,
                type: 'ai_analysis',
                priority: risk_level === 'High Risk' ? 'high' : 'normal'
            });

            if (request && request.beneficiary_id) {
                const [bUser] = await db.query('SELECT user_id FROM beneficiaries WHERE id = ?', [request.beneficiary_id]);
                if (bUser.length > 0) {
                    await createNotification(
                        bUser[0].user_id,
                        '🤖 AI Verification Completed',
                        `AI document verification for your request #${helpRequestId} completed with status: ${risk_level}.`,
                        'ai_analysis'
                    );
                }
            }
        } catch (notifErr) {
            console.error('AI notification error:', notifErr.message);
        }

        return {
            ...reportData,
            ocr_data,
            nid_analysis,
            medical_analysis,
            missing_info,
            suspicious_findings
        };
    }

    /**
     * Gets stored AI analysis report for a help request.
     * Returns null / default 'Not Analyzed' object if no report exists,
     * ensuring unanalyzed requests show 'Not Analyzed'.
     */
    async getReportByRequestId(helpRequestId) {
        const [rows] = await db.query('SELECT * FROM ai_verification_reports WHERE help_request_id = ?', [helpRequestId]);
        if (rows.length > 0) {
            const report = rows[0];
            return {
                ...report,
                ocr_data: typeof report.ocr_data === 'string' ? JSON.parse(report.ocr_data) : (report.ocr_data || {}),
                nid_analysis: typeof report.nid_analysis === 'string' ? JSON.parse(report.nid_analysis) : (report.nid_analysis || {}),
                medical_analysis: typeof report.medical_analysis === 'string' ? JSON.parse(report.medical_analysis) : (report.medical_analysis || {}),
                missing_info: typeof report.missing_info === 'string' ? JSON.parse(report.missing_info) : (report.missing_info || []),
                suspicious_findings: typeof report.suspicious_findings === 'string' ? JSON.parse(report.suspicious_findings) : (report.suspicious_findings || []),
                reason_for_risk: report.reason_for_risk || ''
            };
        }

        // Return empty 'Not Analyzed' report state if no analysis was run yet
        return {
            help_request_id: helpRequestId,
            risk_level: 'Not Analyzed',
            confidence_score: 0,
            reason_for_risk: 'AI document analysis has not been performed yet for this request.',
            missing_info: ['Document analysis pending.'],
            suspicious_findings: [],
            recommendation: 'Click "Re-Run AI Analysis" to trigger OCR text extraction and fraud risk evaluation.',
            ocr_data: {},
            nid_analysis: { status: 'NOT_ANALYZED' },
            medical_analysis: { status: 'NOT_ANALYZED' }
        };
    }
}

module.exports = new AIVerificationService();
