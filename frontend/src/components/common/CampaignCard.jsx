import React from 'react';
import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../api/axios?v=1';
import { useDonation } from '../../context/DonationContext';
import { useLanguage } from '../../context/LanguageContext';

const CampaignCard = ({ campaign }) => {
    const { openDonationModal } = useDonation();
    const { t } = useLanguage();

    if (!campaign) return null;

    const raised = parseFloat(campaign.raised_amount || 0);
    const goal = parseFloat(campaign.goal_amount || 1);
    const progress = Math.min(100, Math.round((raised / goal) * 100));
    const remaining = Math.max(0, goal - raised);
    const isCompleted = campaign.status === 'completed' || campaign.is_completed || raised >= goal;

    /* Cover Image */
    const imageSrc = campaign.gallery && campaign.gallery[0]
        ? getMediaUrl(campaign.gallery[0])
        : campaign.cover_image
        ? getMediaUrl(campaign.cover_image)
        : null;

    /* Calculate Days Left */
    let daysLeft = null;
    if (campaign.deadline) {
        const diffTime = new Date(campaign.deadline) - new Date();
        daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    /* Donor Count */
    const donorCount = campaign.donor_count || campaign.donors_count || 0;

    /* User-friendly public badge renderer (No AI Risk levels shown to public users) */
    const renderPublicVerificationBadge = () => {
        if (campaign.is_featured || campaign.featured) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/90 text-white backdrop-blur-md shadow-sm border border-amber-300/40">
                    ⭐ Featured
                </span>
            );
        }
        if (campaign.ngo_org_name || campaign.ngo_id) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm border border-emerald-300/40">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    NGO Verified
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/90 text-white backdrop-blur-md shadow-sm border border-sky-300/40">
                🛡️ Verified Cause
            </span>
        );
    };

    /* Status badge renderer */
    const renderStatusBadge = () => {
        if (isCompleted) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur-md shadow-md border border-emerald-300/40">
                    ✓ {t('campaigns.completed') || 'Completed'}
                </span>
            );
        }
        if (campaign.is_emergency || campaign.category_name?.toLowerCase().includes('emergency')) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600/90 text-white backdrop-blur-md shadow-md border border-rose-300/40 animate-pulse">
                    🚨 Emergency
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/90 text-white backdrop-blur-md shadow-md border border-sky-300/40">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                {t('campaigns.running') || 'Running'}
            </span>
        );
    };

    return (
        <div className="group relative flex flex-col rounded-[22px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 shadow-md hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">

            {/* ── IMAGE SECTION ── */}
            <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={campaign.title}
                        className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500/10 via-indigo-500/10 to-sky-500/10 p-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-4xl opacity-60">🤝</span>
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                                {t('campaigns.noImage') || 'Lifeline Campaign'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Subtle gradient overlay for badge readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Top-Left Badges */}
                <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
                    {renderPublicVerificationBadge()}
                </div>


                {/* Top-Right Status Badge */}
                <div className="absolute top-3.5 right-3.5 z-10">
                    {renderStatusBadge()}
                </div>

                {/* Category & Location Floating Pill on Image Bottom */}
                <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-[11px] font-bold z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/20">
                        🏷️ {campaign.category_name || campaign.category || 'Charity'}
                    </span>
                    {(campaign.ngo_org_name || campaign.location) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 truncate max-w-[150px]" title={campaign.ngo_org_name || campaign.location}>
                            🏛️ {campaign.ngo_org_name || campaign.location}
                        </span>
                    )}
                </div>
            </div>

            {/* ── CARD CONTENT ── */}
            <div className="flex flex-col flex-grow p-5 space-y-4">

                {/* Title & Description */}
                <div>
                    <h3 className="font-display text-base sm:text-lg font-black text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {campaign.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {campaign.description}
                    </p>
                </div>

                {/* ── FUNDING & PROGRESS ── */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">

                    {/* Raised & Goal Header */}
                    <div className="flex justify-between items-baseline text-xs">
                        <div>
                            <span className="font-black text-base text-emerald-600 dark:text-emerald-400">
                                ${raised.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-gray-400 ml-1 font-semibold">raised</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[11px] text-gray-400 font-semibold">{t('campaigns.goal') || 'Goal'}: </span>
                            <span className="font-extrabold text-gray-700 dark:text-gray-300">${goal.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
                                isCompleted
                                    ? 'bg-emerald-500'
                                    : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500'
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Progress Sub-bar: Remaining & Percentage */}
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-gray-400 dark:text-gray-500 pt-0.5">
                        <span className="text-primary-600 dark:text-primary-400">{progress}% {t('campaigns.funded') || 'Funded'}</span>
                        <span>${remaining.toLocaleString()} {t('campaigns.remaining') || 'remaining'}</span>
                    </div>
                </div>

                {/* ── QUICK STATS ── */}
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-[11px] font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                    <span className="inline-flex items-center gap-1.5">
                        ❤️ <strong className="text-gray-900 dark:text-white font-extrabold">{donorCount}</strong> Donors
                    </span>
                    {daysLeft !== null ? (
                        <span className="inline-flex items-center gap-1.5">
                            ⏱️ <strong className="text-gray-900 dark:text-white font-extrabold">{daysLeft}</strong> {daysLeft === 1 ? 'Day' : 'Days'} Left
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5">
                            👁️ <strong className="text-gray-900 dark:text-white font-extrabold">{campaign.views || 120}</strong> Views
                        </span>
                    )}
                </div>

                {/* ── ACTION BUTTONS ── */}
                <div className="grid grid-cols-2 gap-2.5 pt-1 mt-auto">
                    <Link
                        to={`/campaigns/${campaign.id}`}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 text-center"
                        id={`campaign-detail-${campaign.id}`}
                    >
                        {t('campaigns.details') || 'Details'}
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>

                    {isCompleted ? (
                        <button
                            disabled
                            className="inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 opacity-80 cursor-not-allowed text-center"
                        >
                            ✓ {t('campaigns.completed') || 'Completed'}
                        </button>
                    ) : (
                        <button
                            onClick={() => openDonationModal(campaign)}
                            className="relative overflow-hidden inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-primary-600 hover:from-sky-600 hover:to-indigo-700 shadow-md hover:shadow-lg shadow-sky-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center cursor-pointer group/btn"
                            id={`campaign-donate-${campaign.id}`}
                        >
                            <svg className="w-3.5 h-3.5 fill-current text-white/90 group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            {t('campaigns.donateNow') || 'Donate Now'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CampaignCard;
