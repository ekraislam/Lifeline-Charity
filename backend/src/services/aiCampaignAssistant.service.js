const { GoogleGenAI } = require('@google/genai');

class AICampaignAssistantService {
    /**
     * Get Gemini AI instance if API key is present
     */
    getAIInstance() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            return new GoogleGenAI({ apiKey });
        }
        return null;
    }

    /**
     * 1. Generate 3-5 Title Suggestions (English & Bangla)
     */
    async generateTitles({ beneficiaryName = '', title = '', description = '', amount = '', urgency = 'High', language = 'en' }) {
        const isBangla = language === 'bn';
        const ai = this.getAIInstance();

        if (ai) {
            try {
                const prompt = `You are a professional fundraising copywriter for a charity platform.
Generate 4 unique, highly effective, trustworthy, emotional, and catchy campaign titles for a beneficiary requesting medical aid.
Beneficiary Name: "${beneficiaryName}"
Medical Subject / Details: "${title || description}"
Required Amount: $${amount}
Urgency Level: ${urgency}
Language: ${isBangla ? 'Bangla (বাংলা)' : 'English'}

Return ONLY a JSON array of strings containing 4 title suggestions.
Example format: ["Title 1", "Title 2", "Title 3", "Title 4"]`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });

                if (response && response.text) {
                    const text = response.text.trim().replace(/^```json/, '').replace(/```$/, '');
                    const titles = JSON.parse(text);
                    if (Array.isArray(titles) && titles.length > 0) {
                        return titles;
                    }
                }
            } catch (err) {
                console.warn("Gemini AI Title Generation Fallback:", err.message);
            }
        }

        // Rule-based Fallback Generator
        const patientStr = beneficiaryName || (isBangla ? 'রোগী' : 'Patient');
        const subjectStr = title || (isBangla ? 'জরুরি চিকিৎসা সহায়তার আবেদন' : 'Emergency Medical Assistance');
        const amtStr = amount ? `$${amount}` : '';

        if (isBangla) {
            return [
                `জরুরি আপিল: ${patientStr}-এর জীবনের জন্য ${subjectStr} চিকিৎসা সহায়তা ${amtStr}`,
                `আসুন পাশে দাঁড়ায়: ${patientStr}-এর জটিল চিকিৎসায় আপনার সাহায্য প্রয়োজন`,
                `আশার আলো: ${patientStr}-এর জরুরি চিকিৎসার ফান্ডরাইজিং ক্যাম্পেইন`,
                `জীবন বাঁচানোর আহ্বান: ${patientStr}-এর জন্য চিকিৎসা অর্থসংস্থান`
            ];
        }

        return [
            `Emergency Appeal: Help Save ${patientStr}'s Life - ${subjectStr} ${amtStr}`,
            `Hope for ${patientStr}: Urgent Funding Required for Medical Treatment`,
            `Stand with ${patientStr}: A Community Call for Critical Healthcare Aid`,
            `Life-Saving Support: Urgent Medical Assistance for ${patientStr}`
        ];
    }

    /**
     * 2. Generate Complete Campaign Description
     */
    async generateDescription({ beneficiaryName = '', title = '', description = '', hospitalName = '', doctorName = '', amount = '', urgency = 'High', language = 'en' }) {
        const isBangla = language === 'bn';
        const ai = this.getAIInstance();

        if (ai) {
            try {
                const prompt = `You are a professional medical fundraiser copywriter.
Generate a compassionate, well-structured, transparent, and compelling campaign description for a medical charity request.

Beneficiary Name: "${beneficiaryName}"
Medical Condition / Title: "${title}"
Background Notes: "${description}"
Hospital Name: "${hospitalName}"
Attending Doctor: "${doctorName}"
Required Amount: $${amount}
Language: ${isBangla ? 'Bangla (বাংলা)' : 'English'}

The description MUST include the following structured sections:
1. Patient Background & Situation
2. Diagnosis & Medical Details
3. Why Urgent Financial Assistance is Needed
4. How Donations Will Be Transparently Utilized
5. A Heartfelt Appeal to Donors

Return plain formatted text with clear paragraph breaks. Do NOT use markdown code blocks.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });

                if (response && response.text) {
                    return response.text.trim();
                }
            } catch (err) {
                console.warn("Gemini AI Description Generation Fallback:", err.message);
            }
        }

        // Rule-based Fallback Description Generator
        const nameStr = beneficiaryName || (isBangla ? 'আমাদের সুবিধাভোগী' : 'our beneficiary');
        const conditionStr = title || (isBangla ? 'জরুরি চিকিৎসা' : 'urgent medical treatment');
        const hospStr = hospitalName ? (isBangla ? `চিকিৎসাধীন: ${hospitalName}` : `under care at ${hospitalName}`) : '';
        const amtStr = amount ? `$${amount}` : '';

        if (isBangla) {
            return `প্রতিনিয়ত জীবনযুদ্ধের মুখোমুখি দাঁড়িয়ে আছেন ${nameStr}। বর্তমানে ${conditionStr}-এর জন্য অত্যন্ত সংকটজনক পরিস্থিতিতে আছেন ${hospStr}।\n\nচিকিৎসকদের পরামর্শ অনুযায়ী, অবিলম্বে প্রয়োজনীয় উন্নত চিকিৎসা শুরু করা জরুরি। তবে চিকিৎসার বিশাল ব্যয়ভার পরিবারের পক্ষে একা বহন করা অত্যন্ত দুঃসাধ্য হয়ে পড়েছে। অত্যন্ত জরুরি ভিত্তিতে আমাদের লক্ষ্যমাত্রা ${amtStr} সংগ্রহ করা।\n\nসংগৃহীত সকল অনুদান সরাসরি রোগীর ওষুধ, হাসপাতাল বিল, ডায়াগনস্টিক পরীক্ষা এবং প্রয়োজনীয় চিকিৎসায় স্বচ্ছতার সাথে ব্যবহৃত হবে।\n\nআপনার একটি ক্ষুদ্র অবদানও হতে পারে একজন মানুষের জীবন বাঁচানোর আলো। আসুন মানবিকতার টানে আমরা সবাই একসাথে পাশে দাঁড়ায়। অনুগ্রহ করে অনুদান দিন এবং ক্যাম্পেইনটি শেয়ার করুন।`;
        }

        return `We are reaching out to ask for your compassionate support for ${nameStr}, who is currently undergoing critical treatment for ${conditionStr} ${hospStr}.\n\nAccording to attending physicians, immediate medical intervention is vital. However, the overwhelming financial burden of ongoing hospital care, medication, and diagnostic tests has placed immense strain on the family. We are urgently seeking to raise ${amtStr} to ensure treatment is not delayed.\n\nEvery dollar contributed will be directly allocated towards medical expenses, pharmacy supplies, and specialized care with complete transparency.\n\nYour kindness and generosity can bring hope and healing during this difficult time. Please donate what you can and share this campaign with your network. Thank you for your support.`;
    }

    /**
     * 3. Improve Writing (Grammar, Readability, Tone)
     */
    async improveWriting({ title = '', description = '', language = 'en' }) {
        const isBangla = language === 'bn';
        const ai = this.getAIInstance();

        if (ai) {
            try {
                const prompt = `You are an expert copy editor for a humanitarian fundraising platform.
Refine and improve the grammar, spelling, flow, readability, and professional tone of the following campaign text without altering its factual meaning or adding fake claims.

Title: "${title}"
Description: "${description}"
Language: ${isBangla ? 'Bangla (বাংলা)' : 'English'}

Return ONLY a JSON object with:
{
  "improvedTitle": "refined title",
  "improvedDescription": "refined description"
}`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });

                if (response && response.text) {
                    const text = response.text.trim().replace(/^```json/, '').replace(/```$/, '');
                    return JSON.parse(text);
                }
            } catch (err) {
                console.warn("Gemini AI Improve Writing Fallback:", err.message);
            }
        }

        // Rule-based Fallback
        const cleanTitle = title.trim();
        const cleanDesc = description.trim();

        return {
            improvedTitle: cleanTitle ? (cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)) : title,
            improvedDescription: cleanDesc ? cleanDesc.replace(/\s+/g, ' ') : description
        };
    }

    /**
     * 4. Suggest Fundraising Goal Amount
     */
    async suggestGoal({ requestedAmount = 0, medicalCost = 0, treatmentType = '', language = 'en' }) {
        const isBangla = language === 'bn';
        const reqAmt = parseFloat(requestedAmount) || 0;
        const medCost = parseFloat(medicalCost) || 0;
        const baseCost = medCost > 0 ? medCost : (reqAmt > 0 ? reqAmt : 5000);

        // Include a 10% contingency for post-operative care, medicines, & transaction overhead
        const suggestedGoal = Math.round(baseCost * 1.10);

        const ai = this.getAIInstance();
        if (ai) {
            try {
                const prompt = `Analyze medical fundraising goal requirements for a campaign.
Base Medical Request: $${baseCost}
Treatment Category: "${treatmentType}"
Language: ${isBangla ? 'Bangla (বাংলা)' : 'English'}

Provide a JSON object with:
{
  "suggestedGoal": number,
  "explanation": "clear sentence explaining why this goal is recommended (including medication, hospital stay, post-op contingency, and platform processing)"
}`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });

                if (response && response.text) {
                    const text = response.text.trim().replace(/^```json/, '').replace(/```$/, '');
                    return JSON.parse(text);
                }
            } catch (err) {
                console.warn("Gemini Goal Suggestion Fallback:", err.message);
            }
        }

        return {
            suggestedGoal,
            explanation: isBangla 
                ? `প্রস্তাবিত লক্ষ্যমাত্রা $${suggestedGoal.toLocaleString()} (রোগীর প্রাথমিক চিকিৎসা ব্যয় $${baseCost.toLocaleString()} এবং ওষুধ ও পরবর্তী ১০% জরুরি খরচের হিসাব অন্তর্ভুক্ত)।`
                : `Recommended goal of $${suggestedGoal.toLocaleString()} covers the base medical estimate ($${baseCost.toLocaleString()}) plus a 10% buffer for follow-up medications and hospital care.`
        };
    }

    /**
     * 5. Analyze Campaign Quality & Trust Score
     */
    async analyzeQuality({ title = '', description = '', goalAmount = 0, categoryId = null, hasImages = false, language = 'en' }) {
        const isBangla = language === 'bn';
        const tLen = (title || '').trim().length;
        const dWords = (description || '').trim().split(/\s+/).filter(Boolean).length;
        const amt = parseFloat(goalAmount) || 0;

        let titleScore = 0;
        if (tLen >= 15 && tLen <= 90) titleScore = 95;
        else if (tLen > 0) titleScore = 60;

        let descScore = 0;
        if (dWords >= 80) descScore = 95;
        else if (dWords >= 40) descScore = 75;
        else if (dWords > 0) descScore = 50;

        let readabilityScore = dWords >= 30 ? 90 : 60;
        let completenessScore = (tLen > 0 ? 25 : 0) + (dWords > 30 ? 25 : 0) + (amt > 0 ? 25 : 0) + (hasImages ? 25 : 0);
        let trustScore = (hasImages ? 30 : 10) + (dWords >= 60 ? 35 : 15) + (tLen >= 15 ? 35 : 15);

        const overallScore = Math.round((titleScore * 0.2) + (descScore * 0.3) + (readabilityScore * 0.15) + (completenessScore * 0.2) + (trustScore * 0.15));

        const tips = [];
        if (tLen < 15) tips.push(isBangla ? 'ক্যাম্পেইনের জন্য আকর্ষণীয় ও সুনির্দিষ্ট একটি শিরোনাম ব্যবহার করুন (কমপক্ষে ৩-৫ শব্দ)।' : 'Make the campaign title more descriptive and compelling (at least 15 characters).');
        if (dWords < 50) tips.push(isBangla ? 'রোগীর বিবরণ, চিকিৎসার বিস্তারিত এবং অনুদান ব্যবহারের পরিকল্পনা সহ আরও তথ্য যোগ করুন (কমপক্ষে ৫০ শব্দ)।' : 'Add more details about the patient situation, diagnosis, and medical breakdown (at least 50 words).');
        if (!hasImages) tips.push(isBangla ? 'দাতাদের ট্রাস্ট বাড়াতে কমপক্ষে ১-৩টি স্পষ্ট ছবি আপলোড করুন।' : 'Upload 1 to 3 clear campaign gallery images to improve trust and donor engagement.');
        if (amt <= 0) tips.push(isBangla ? 'একটি বাস্তবসম্মত ফান্ডরাইজিং লক্ষ্যমাত্রা ($) নির্ধারণ করুন।' : 'Set a valid numerical target funding goal ($).');
        if (tips.length === 0) {
            tips.push(isBangla ? 'ক্যাম্পেইনের তথ্য সম্পূর্ণ ও মানসম্মত রয়েছে।' : 'Campaign details look comprehensive, clear, and well-structured!');
        }

        return {
            overallScore,
            subScores: {
                titleQuality: titleScore,
                descriptionQuality: descScore,
                readability: readabilityScore,
                completeness: completenessScore,
                trustScore
            },
            improvementTips: tips
        };
    }
}

module.exports = new AICampaignAssistantService();
