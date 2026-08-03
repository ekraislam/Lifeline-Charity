import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CreateCampaign = () => {
    const [searchParams] = useSearchParams();
    const helpRequestId = searchParams.get('help_request_id');
    const prefillTitle = searchParams.get('title') || '';
    const prefillAmount = searchParams.get('amount') || '';

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            title: prefillTitle ? `Campaign: ${prefillTitle}` : '',
            target_amount: prefillAmount || '',
            description: '',
            category_id: '2', // Default Health
            end_date: ''
        }
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [files, setFiles] = useState(null);

    // Beneficiary Details state (if linked to a help request)
    const [beneficiaryDetails, setBeneficiaryDetails] = useState(null);

    // AI Assistant State
    const [aiLanguage, setAiLanguage] = useState('en'); // 'en' | 'bn'
    const [aiLoading, setAiLoading] = useState(false);
    const [aiActiveTool, setAiActiveTool] = useState(null); // 'title' | 'description' | 'writing' | 'goal' | 'quality'
    const [aiError, setAiError] = useState(null);

    // AI Outputs
    const [generatedTitles, setGeneratedTitles] = useState([]);
    const [generatedDesc, setGeneratedDesc] = useState('');
    const [improvedText, setImprovedText] = useState(null);
    const [suggestedGoalData, setSuggestedGoalData] = useState(null);
    const [qualityAnalysis, setQualityAnalysis] = useState(null);

    // Watch current form values
    const watchTitle = watch('title');
    const watchDescription = watch('description');
    const watchAmount = watch('target_amount');
    const watchCategory = watch('category_id');

    // Load Beneficiary Details if help_request_id is present
    useEffect(() => {
        if (helpRequestId) {
            api.get(`/beneficiaries/requests/${helpRequestId}`)
                .then(res => {
                    const req = res.data;
                    setBeneficiaryDetails(req);
                    if (!watchTitle && req.title) {
                        setValue('title', `Campaign: ${req.title}`);
                    }
                    if (!watchAmount && req.required_amount) {
                        setValue('target_amount', req.required_amount);
                    }
                    if (!watchDescription && req.description) {
                        setValue('description', req.description);
                    }
                })
                .catch(err => console.error("Error loading beneficiary request for campaign", err));
        }
    }, [helpRequestId]);

    // Handle Image Upload Selection
    const handleFileChange = (e) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        if (selectedFiles.length > 5) {
            setStatus({ type: 'error', message: 'You can only select up to 5 images.' });
            e.target.value = '';
            setFiles(null);
            return;
        }

        for (let i = 0; i < selectedFiles.length; i++) {
            if (!selectedFiles[i].type.startsWith('image/')) {
                setStatus({ type: 'error', message: 'Only image files are allowed.' });
                e.target.value = '';
                setFiles(null);
                return;
            }
        }

        setStatus({ type: '', message: '' });
        setFiles(selectedFiles);
    };

    // ──────────────────────────────────────────────────────────────────
    // AI ASSISTANT API CALLS
    // ──────────────────────────────────────────────────────────────────

    const callAiAssistant = async (action, extraPayload = {}) => {
        setAiLoading(true);
        setAiError(null);
        setAiActiveTool(action);
        try {
            const payload = {
                action,
                language: aiLanguage,
                beneficiaryName: beneficiaryDetails?.beneficiary_name || '',
                title: watchTitle || beneficiaryDetails?.title || '',
                description: watchDescription || beneficiaryDetails?.description || '',
                hospitalName: beneficiaryDetails?.ai_report?.ocr_data?.hospital_name || '',
                doctorName: beneficiaryDetails?.ai_report?.ocr_data?.doctor_name || '',
                amount: watchAmount || beneficiaryDetails?.required_amount || 0,
                goalAmount: watchAmount || 0,
                categoryId: watchCategory,
                hasImages: Boolean(files && files.length > 0),
                ...extraPayload
            };

            const res = await api.post('/campaigns/ai-assistant', payload);
            return res.data;
        } catch (err) {
            console.error("AI Assistant API Error:", err);
            setAiError("AI Assistant temporarily unavailable. Please try again.");
            return null;
        } finally {
            setAiLoading(false);
        }
    };

    // 1. Generate Title Suggestions
    const handleGenerateTitles = async () => {
        const data = await callAiAssistant('generate_titles');
        if (data && data.titles) {
            setGeneratedTitles(data.titles);
        }
    };

    // 2. Generate Full Description
    const handleGenerateDescription = async () => {
        const data = await callAiAssistant('generate_description');
        if (data && data.description) {
            setGeneratedDesc(data.description);
        }
    };

    // 3. Improve Writing
    const handleImproveWriting = async () => {
        const data = await callAiAssistant('improve_writing');
        if (data && (data.improvedTitle || data.improvedDescription)) {
            setImprovedText(data);
        }
    };

    // 4. Suggest Goal Amount
    const handleSuggestGoal = async () => {
        const data = await callAiAssistant('suggest_goal');
        if (data && data.suggestedGoal) {
            setSuggestedGoalData(data);
        }
    };

    // 5. Analyze Campaign Quality
    const handleAnalyzeQuality = async () => {
        const data = await callAiAssistant('analyze_quality');
        if (data && data.overallScore !== undefined) {
            setQualityAnalysis(data);
        }
    };

    // Copy to clipboard helper
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert(aiLanguage === 'bn' ? 'লেখা কপি করা হয়েছে!' : 'Copied to clipboard!');
    };

    // Form Submission
    const onSubmit = async (data) => {
        if (files && files.length > 5) {
            setStatus({ type: 'error', message: 'You can only upload a maximum of 5 images.' });
            return;
        }
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            const payload = {
                title: data.title,
                description: data.description,
                category_id: data.category_id,
                goal_amount: data.target_amount,
                deadline: data.end_date
            };

            if (helpRequestId) {
                payload.help_request_id = parseInt(helpRequestId);
            }

            const response = await api.post('/campaigns', payload);
            const campaignId = response.data.campaignId;

            if (files && files.length > 0) {
                const formData = new FormData();
                for (let i = 0; i < files.length; i++) {
                    formData.append('images', files[i]);
                }
                await api.post(`/campaigns/${campaignId}/gallery`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setStatus({ type: 'success', message: 'Campaign created successfully! Awaiting admin approval.' });
            setTimeout(() => {
                navigate(helpRequestId ? '/ngo/dashboard' : '/dashboard');
            }, 2000);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to create campaign.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <span>📢</span> Create New Campaign
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Fill out campaign details or use our intelligent AI Assistant to write compelling appeals.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
                    >
                        ← Cancel
                    </button>
                </div>
            </div>

            {/* Beneficiary Link Notice Banner */}
            {helpRequestId && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex items-start gap-3">
                    <span className="text-xl">📋</span>
                    <div>
                        <strong className="font-bold block text-sm">Linked Beneficiary Request #{helpRequestId}</strong>
                        This campaign will be automatically linked to beneficiary <strong>{beneficiaryDetails?.beneficiary_name || 'Verified Beneficiary'}</strong>. AI Assistant features will use verified medical records for guidance.
                    </div>
                </div>
            )}

            {/* Main Form Status */}
            {status.message && (
                <div className={`p-4 rounded-2xl border text-xs font-bold ${status.type === 'success' ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300' : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300'}`}>
                    {status.message}
                </div>
            )}

            {/* 2-Column Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* ── LEFT COLUMN: CAMPAIGN FORM (7 cols) ── */}
                <div className="lg:col-span-7 space-y-6">
                    <form className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        
                        {/* Title Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                                    Campaign Title <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleGenerateTitles}
                                    disabled={aiLoading}
                                    className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    <span>✨ Generate AI Title</span>
                                </button>
                            </div>
                            <input
                                type="text"
                                {...register('title', { required: 'Title is required' })}
                                placeholder="e.g. Urgent Surgery Fund for John Doe"
                                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                            />
                            {errors.title && <span className="text-xs text-red-500 font-semibold">{errors.title.message}</span>}
                        </div>

                        {/* Description Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                                    Campaign Description <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleGenerateDescription}
                                        disabled={aiLoading}
                                        className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                                    >
                                        <span>✨ Generate AI Story</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleImproveWriting}
                                        disabled={aiLoading || (!watchTitle && !watchDescription)}
                                        className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                                    >
                                        <span>✨ Improve Writing</span>
                                    </button>
                                </div>
                            </div>
                            <textarea
                                rows="7"
                                {...register('description', { required: 'Description is required' })}
                                placeholder="Explain patient background, medical condition, cost breakdown, and how donations will be spent..."
                                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none leading-relaxed"
                            ></textarea>
                            {errors.description && <span className="text-xs text-red-500 font-semibold">{errors.description.message}</span>}
                        </div>

                        {/* Category & Target Amount Grid */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 mb-1.5">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('category_id', { required: 'Category is required' })}
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none cursor-pointer"
                                >
                                    <option value="1">Education</option>
                                    <option value="2">Health & Medical</option>
                                    <option value="3">Disaster Relief</option>
                                </select>
                                {errors.category_id && <span className="text-xs text-red-500 font-semibold">{errors.category_id.message}</span>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                                        Target Goal ($) <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleSuggestGoal}
                                        disabled={aiLoading}
                                        className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>✨ Suggest Goal</span>
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('target_amount', { required: 'Target amount required', min: 1 })}
                                    placeholder="5000"
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                />
                                {errors.target_amount && <span className="text-xs text-red-500 font-semibold">{errors.target_amount.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 mb-1.5">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    {...register('end_date', { required: 'End date is required' })}
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none cursor-pointer"
                                />
                                {errors.end_date && <span className="text-xs text-red-500 font-semibold">{errors.end_date.message}</span>}
                            </div>
                        </div>

                        {/* Gallery Images Upload */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 mb-1.5">
                                Campaign Gallery Images (Max 5)
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-950 dark:file:text-primary-300 transition-colors"
                            />
                        </div>

                        {/* Form Buttons */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 flex justify-center items-center py-3 px-4 rounded-xl text-xs font-black text-white bg-primary-600 hover:bg-primary-700 shadow-md transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Creating Campaign...</span>
                                    </div>
                                ) : (
                                    '🚀 Submit Campaign for Approval'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── RIGHT COLUMN: AI CAMPAIGN ASSISTANT PANEL (5 cols) ── */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-indigo-500/20 relative overflow-hidden space-y-6">
                        
                        {/* Panel Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xl shadow-lg">
                                    🤖
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight">AI Campaign Assistant</h2>
                                    <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Smart Fundraising Advisor</p>
                                </div>
                            </div>

                            {/* Multilingual Selector */}
                            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/10 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setAiLanguage('en')}
                                    className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all ${aiLanguage === 'en' ? 'bg-indigo-600 text-white shadow' : 'text-gray-300 hover:text-white'}`}
                                >
                                    🇺🇸 EN
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAiLanguage('bn')}
                                    className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all ${aiLanguage === 'bn' ? 'bg-indigo-600 text-white shadow' : 'text-gray-300 hover:text-white'}`}
                                >
                                    🇧🇩 বাংলা
                                </button>
                            </div>
                        </div>

                        {/* Non-blocking Advisory Disclaimer */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-[11px] text-indigo-200 leading-relaxed">
                            💡 <strong>AI Assistant Guardrail:</strong> AI suggestions are purely advisory to help you write better campaigns. AI will <strong>never</strong> auto-submit, publish, or modify your form without your manual review.
                        </div>

                        {/* Error Alert */}
                        {aiError && (
                            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-2xl text-xs text-rose-200 flex items-center justify-between">
                                <span>⚠️ {aiError}</span>
                                <button onClick={() => setAiError(null)} className="text-white font-bold">&times;</button>
                            </div>
                        )}

                        {/* Loading State Overlay */}
                        {aiLoading && (
                            <div className="p-6 bg-white/10 rounded-2xl text-center space-y-2 backdrop-blur border border-white/10">
                                <div className="w-6 h-6 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-xs font-bold text-indigo-200">
                                    {aiActiveTool === 'title' ? 'Generating 4 Catchy Titles...' :
                                     aiActiveTool === 'description' ? 'Writing Story Appeal...' :
                                     aiActiveTool === 'writing' ? 'Refining Grammar & Tone...' :
                                     aiActiveTool === 'goal' ? 'Calculating Goal Recommendation...' :
                                     'Analyzing Campaign Quality...'}
                                </p>
                            </div>
                        )}

                        {/* Quick AI Action Toolbar */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={handleGenerateTitles}
                                disabled={aiLoading}
                                className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-left transition-all flex items-center gap-2 group cursor-pointer disabled:opacity-50"
                            >
                                <span className="text-base group-hover:scale-110 transition-transform">🏷️</span>
                                <span>{aiLanguage === 'bn' ? 'টাইটেল সাজেস্ট' : 'Generate Titles'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={aiLoading}
                                className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-left transition-all flex items-center gap-2 group cursor-pointer disabled:opacity-50"
                            >
                                <span className="text-base group-hover:scale-110 transition-transform">📝</span>
                                <span>{aiLanguage === 'bn' ? 'স্টোরি বর্ণনা' : 'Generate Story'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleSuggestGoal}
                                disabled={aiLoading}
                                className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-left transition-all flex items-center gap-2 group cursor-pointer disabled:opacity-50"
                            >
                                <span className="text-base group-hover:scale-110 transition-transform">💰</span>
                                <span>{aiLanguage === 'bn' ? 'লক্ষ্যমাত্রা সাজেস্ট' : 'Suggest Goal'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleAnalyzeQuality}
                                disabled={aiLoading}
                                className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-left transition-all flex items-center gap-2 group cursor-pointer disabled:opacity-50"
                            >
                                <span className="text-base group-hover:scale-110 transition-transform">📊</span>
                                <span>{aiLanguage === 'bn' ? 'কোয়ালিটি স্কোর' : 'Analyze Quality'}</span>
                            </button>
                        </div>

                        {/* ────────────────────────────────────────────────────────────────── */}
                        {/* AI GENERATED TITLES CARD */}
                        {/* ────────────────────────────────────────────────────────────────── */}
                        {generatedTitles.length > 0 && (
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 space-y-3 animate-fade-in-up">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <strong className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                                        ✨ {aiLanguage === 'bn' ? 'প্রস্তাবিত টাইটেল সমূহ' : 'AI Title Suggestions'} ({generatedTitles.length})
                                    </strong>
                                    <button
                                        type="button"
                                        onClick={handleGenerateTitles}
                                        disabled={aiLoading}
                                        className="text-[11px] text-indigo-200 hover:text-white font-bold underline"
                                    >
                                        🔄 {aiLanguage === 'bn' ? 'পুনরায় জেনারেট' : 'Regenerate'}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {generatedTitles.map((t, idx) => (
                                        <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-3 text-xs">
                                            <span className="font-semibold text-gray-100 flex-1">{t}</span>
                                            <button
                                                type="button"
                                                onClick={() => setValue('title', t)}
                                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px] whitespace-nowrap shadow cursor-pointer"
                                            >
                                                ✓ Use Title
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ────────────────────────────────────────────────────────────────── */}
                        {/* AI GENERATED DESCRIPTION CARD */}
                        {/* ────────────────────────────────────────────────────────────────── */}
                        {generatedDesc && (
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 space-y-3 animate-fade-in-up">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <strong className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                                        ✨ {aiLanguage === 'bn' ? 'জেনারেট করা ক্যাম্পেইন স্টোরি' : 'AI Generated Story Appeal'}
                                    </strong>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(generatedDesc)}
                                            className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md hover:bg-white/20 font-bold"
                                        >
                                            📋 Copy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setValue('description', generatedDesc)}
                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                                        >
                                            ✓ Apply Story
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto p-3 bg-slate-900/80 rounded-xl border border-white/5 font-normal">
                                    {generatedDesc}
                                </p>
                            </div>
                        )}

                        {/* ────────────────────────────────────────────────────────────────── */}
                        {/* AI IMPROVED WRITING CARD */}
                        {/* ────────────────────────────────────────────────────────────────── */}
                        {improvedText && (
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 space-y-3 animate-fade-in-up">
                                <strong className="text-xs font-black uppercase text-emerald-300 tracking-wider block border-b border-white/10 pb-2">
                                    ✨ {aiLanguage === 'bn' ? 'লেখা পরিমার্জন রেজাল্ট' : 'Writing Improvement Result'}
                                </strong>
                                {improvedText.improvedTitle && (
                                    <div className="text-xs space-y-1">
                                        <span className="text-gray-400 text-[10px] uppercase font-bold">Refined Title:</span>
                                        <div className="p-2 bg-slate-900/80 rounded-lg text-emerald-300 font-bold">{improvedText.improvedTitle}</div>
                                    </div>
                                )}
                                {improvedText.improvedDescription && (
                                    <div className="text-xs space-y-1">
                                        <span className="text-gray-400 text-[10px] uppercase font-bold">Refined Description:</span>
                                        <div className="p-2 bg-slate-900/80 rounded-lg text-gray-200 max-h-36 overflow-y-auto leading-relaxed">{improvedText.improvedDescription}</div>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (improvedText.improvedTitle) setValue('title', improvedText.improvedTitle);
                                        if (improvedText.improvedDescription) setValue('description', improvedText.improvedDescription);
                                        setImprovedText(null);
                                    }}
                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow cursor-pointer"
                                >
                                    ✓ Apply Writing Improvements
                                </button>
                            </div>
                        )}

                        {/* ────────────────────────────────────────────────────────────────── */}
                        {/* AI SUGGESTED GOAL CARD */}
                        {/* ────────────────────────────────────────────────────────────────── */}
                        {suggestedGoalData && (
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 space-y-3 animate-fade-in-up">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <strong className="text-xs font-black uppercase text-amber-300 tracking-wider">
                                        💰 {aiLanguage === 'bn' ? 'প্রস্তাবিত লক্ষ্যমাত্রা' : 'Suggested Fundraising Goal'}
                                    </strong>
                                    <span className="text-base font-black text-amber-400">${suggestedGoalData.suggestedGoal?.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                                    {suggestedGoalData.explanation}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setValue('target_amount', suggestedGoalData.suggestedGoal)}
                                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow cursor-pointer"
                                >
                                    ✓ {aiLanguage === 'bn' ? `লক্ষ্যমাত্রা $${suggestedGoalData.suggestedGoal?.toLocaleString()} সেট করুন` : `Apply Goal ($${suggestedGoalData.suggestedGoal?.toLocaleString()})`}
                                </button>
                            </div>
                        )}

                        {/* ────────────────────────────────────────────────────────────────── */}
                        {/* CAMPAIGN QUALITY SCORE ANALYSIS METER */}
                        {/* ────────────────────────────────────────────────────────────────── */}
                        {qualityAnalysis && (
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 space-y-4 animate-fade-in-up">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <strong className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                                        📊 {aiLanguage === 'bn' ? 'ক্যাম্পেইন কোয়ালিটি অ্যানালাইসিস' : 'Campaign Quality Analysis'}
                                    </strong>
                                    <span className={`text-base font-black px-2.5 py-0.5 rounded-lg ${
                                        qualityAnalysis.overallScore >= 80 ? 'bg-emerald-500 text-white' :
                                        qualityAnalysis.overallScore >= 60 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                                    }`}>
                                        {qualityAnalysis.overallScore} / 100
                                    </span>
                                </div>

                                {/* Quality Meter Gauge */}
                                <div className="space-y-1">
                                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                qualityAnalysis.overallScore >= 80 ? 'bg-emerald-400' :
                                                qualityAnalysis.overallScore >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                                            }`}
                                            style={{ width: `${qualityAnalysis.overallScore}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Sub-scores Breakdown Pills */}
                                {qualityAnalysis.subScores && (
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                                            <span className="text-gray-400 block uppercase font-bold">Title Quality</span>
                                            <span className="font-extrabold text-indigo-300">{qualityAnalysis.subScores.titleQuality}%</span>
                                        </div>
                                        <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                                            <span className="text-gray-400 block uppercase font-bold">Description Quality</span>
                                            <span className="font-extrabold text-indigo-300">{qualityAnalysis.subScores.descriptionQuality}%</span>
                                        </div>
                                        <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                                            <span className="text-gray-400 block uppercase font-bold">Readability</span>
                                            <span className="font-extrabold text-emerald-300">{qualityAnalysis.subScores.readability}%</span>
                                        </div>
                                        <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                                            <span className="text-gray-400 block uppercase font-bold">Trust Score</span>
                                            <span className="font-extrabold text-emerald-300">{qualityAnalysis.subScores.trustScore}%</span>
                                        </div>
                                    </div>
                                )}

                                {/* Actionable Improvement Tips */}
                                {qualityAnalysis.improvementTips && qualityAnalysis.improvementTips.length > 0 && (
                                    <div className="space-y-1.5 pt-1 text-xs">
                                        <span className="font-bold text-amber-300 block uppercase text-[10px]">💡 {aiLanguage === 'bn' ? 'উন্নতির জন্য টিপস:' : 'AI Improvement Tips:'}</span>
                                        <ul className="list-disc pl-4 space-y-1 text-gray-200 text-[11px] leading-relaxed">
                                            {qualityAnalysis.improvementTips.map((tip, idx) => (
                                                <li key={idx}>{tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CreateCampaign;
