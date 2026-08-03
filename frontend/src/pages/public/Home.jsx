import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDonation } from '../../context/DonationContext';
import { useLanguage } from '../../context/LanguageContext';

/* ─── Count-Up Hook ─────────────────────────────────────────────── */
function useCountUp(target, duration = 2000, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const numericTarget = parseFloat(String(target).replace(/[^0-9.]/g, ''));
        const frame = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * numericTarget));
            if (progress < 1) requestAnimationFrame(frame);
            else setCount(numericTarget);
        };
        requestAnimationFrame(frame);
    }, [start, target, duration]);
    return count;
}

/* ─── Stat Card ─────────────────────────────────────────────────── */
function StatCard({ icon, value, suffix, label, color, delay, animate }) {
    const num = useCountUp(value, 2200, animate);
    return (
        <div className="hero-stat-card" style={{ animationDelay: delay }}>
            <div className="hero-stat-icon" style={{ background: color + '18', border: '1px solid ' + color + '30' }}>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            </div>
            <div className="hero-stat-number" style={{ color }}>
                {animate ? num.toLocaleString() : '0'}{suffix}
            </div>
            <div className="hero-stat-label">{label}</div>
        </div>
    );
}

/* ─── Charity SVG Illustration ──────────────────────────────────── */
function CharityIllustration() {
    return (
        <svg viewBox="0 0 520 480" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="hero-illustration" aria-hidden="true">
            <defs>
                <linearGradient id="bgCircle" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
                <linearGradient id="handGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="greenCardG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="blueCardG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0ea5e9" floodOpacity="0.15" />
                </filter>
                <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.12" />
                </filter>
            </defs>

            {/* Soft background circles */}
            <circle cx="260" cy="240" r="190" fill="url(#bgCircle)" />
            <circle cx="390" cy="120" r="60" fill="#6366f1" fillOpacity="0.06" />
            <circle cx="100" cy="370" r="50" fill="#10b981" fillOpacity="0.08" />

            {/* Coin stack */}
            <g className="illus-float" style={{ animationDelay: '0.4s' }}>
                <ellipse cx="410" cy="322" rx="32" ry="10" fill="#f59e0b" fillOpacity="0.25" />
                <rect x="378" y="292" width="64" height="32" rx="8" fill="url(#coinGrad)" />
                <rect x="382" y="276" width="60" height="20" rx="6" fill="#fbbf24" />
                <rect x="386" y="262" width="52" height="18" rx="5" fill="#fcd34d" />
                <text x="412" y="300" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#92400e">$</text>
            </g>

            {/* Verified badge card */}
            <g className="illus-float" style={{ animationDelay: '0.8s' }} filter="url(#cardShadow)">
                <rect x="50" y="128" width="150" height="56" rx="14" fill="url(#greenCardG)" />
                <circle cx="76" cy="156" r="14" fill="white" fillOpacity="0.25" />
                <text x="76" y="162" textAnchor="middle" fontSize="15" fill="white" fontWeight="bold">✓</text>
                <rect x="99" y="144" width="82" height="9" rx="4" fill="white" fillOpacity="0.75" />
                <rect x="99" y="159" width="58" height="6" rx="3" fill="white" fillOpacity="0.45" />
            </g>

            {/* Donation card */}
            <g className="illus-float" style={{ animationDelay: '1.2s' }} filter="url(#cardShadow)">
                <rect x="328" y="368" width="152" height="56" rx="14" fill="url(#blueCardG)" />
                <circle cx="355" cy="396" r="14" fill="white" fillOpacity="0.25" />
                <text x="355" y="402" textAnchor="middle" fontSize="15" fill="white">♥</text>
                <rect x="378" y="384" width="82" height="9" rx="4" fill="white" fillOpacity="0.75" />
                <rect x="378" y="399" width="58" height="6" rx="3" fill="white" fillOpacity="0.45" />
            </g>

            {/* Hands holding heart */}
            <g filter="url(#softShadow)">
                <path d="M175 280 C175 260 185 245 200 240 L225 235 C235 233 242 240 240 250 L238 280 C255 265 270 260 280 265 L295 270 C305 275 305 290 295 295 L275 300 C265 305 252 310 240 318 L220 330 C205 340 185 345 170 338 L160 330 C148 320 148 305 160 295 Z"
                    fill="url(#handGrad)" />
                <path d="M345 280 C345 260 335 245 320 240 L295 235 C285 233 278 240 280 250 L282 280 C265 265 250 260 240 265 L225 270 C215 275 215 290 225 295 L245 300 C255 305 268 310 280 318 L300 330 C315 340 335 345 350 338 L360 330 C372 320 372 305 360 295 Z"
                    fill="url(#handGrad)" />
                <path className="illus-heartbeat"
                    d="M260 210 C260 210 225 190 215 210 C205 228 220 245 260 275 C300 245 315 228 305 210 C295 190 260 210 260 210 Z"
                    fill="url(#heartGrad)" />
            </g>

            {/* Stars / sparkles */}
            <g className="illus-twinkle">
                <polygon points="145,80 148,88 157,88 150,93 153,102 145,97 137,102 140,93 133,88 142,88" fill="#fbbf24" />
                <polygon points="380,68 382,75 389,75 383,80 385,87 380,83 375,87 377,80 371,75 378,75" fill="#818cf8" />
                <circle cx="460" cy="210" r="5" fill="#34d399" />
                <circle cx="80" cy="300" r="4" fill="#f472b6" />
                <circle cx="440" cy="370" r="3.5" fill="#fbbf24" />
            </g>

            {/* Progress bar card */}
            <g className="illus-float" style={{ animationDelay: '1.6s' }}>
                <rect x="128" y="398" width="264" height="40" rx="13" fill="white" fillOpacity="0.92" filter="url(#cardShadow)" />
                <text x="148" y="420" fontSize="10" fill="#6b7280" fontWeight="600">Campaign Funded</text>
                <text x="376" y="420" textAnchor="end" fontSize="10" fill="#10b981" fontWeight="700">84%</text>
                <rect x="148" y="426" width="224" height="5" rx="2.5" fill="#e5e7eb" />
                <rect x="148" y="426" width="188" height="5" rx="2.5" fill="url(#greenCardG)" />
            </g>
        </svg>
    );
}

/* ─── Trust Badges ──────────────────────────────────────────────── */
const trustBadges = [
    { icon: '🤖', label: 'AI Verified' },
    { icon: '🔒', label: 'Secure Donations' },
    { icon: '🏛️', label: 'Verified NGOs' },
    { icon: '📊', label: 'Transparent Platform' },
];

/* ─── Home Component ─────────────────────────────────────────────── */
const Home = () => {
    const { openDonationModal } = useDonation();
    const { t } = useLanguage();
    const statsRef = useRef(null);
    const [statsVisible, setStatsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
            { threshold: 0.25 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="bg-gray-50 dark:bg-gray-950 overflow-x-hidden transition-colors duration-200">

            {/* ══════════════ HERO SECTION ══════════════ */}
            <section className="hero-section relative min-h-[92vh] flex items-center overflow-hidden">

                {/* Premium background mesh */}
                <div className="absolute inset-0 hero-bg-mesh pointer-events-none" aria-hidden="true" />

                {/* Floating gradient orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="hero-orb hero-orb-1" />
                    <div className="hero-orb hero-orb-2" />
                    <div className="hero-orb hero-orb-3" />
                    <div className="hero-orb hero-orb-4" />
                </div>

                {/* Subtle dot grid */}
                <div className="absolute inset-0 hero-grid-overlay pointer-events-none" aria-hidden="true" />

                <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 w-full py-16 lg:py-24 xl:py-28">

                    {/* Two-column hero layout */}
                    <div className="hero-layout">

                        {/* LEFT — Text */}
                        <div className="hero-text-col">

                            {/* Live badge */}
                            <div className="hero-live-badge animate-fade-in-up" style={{ animationDelay: '0s' }}>
                                <span className="live-dot-wrapper">
                                    <span className="live-dot" />
                                    <span className="live-dot-ping" />
                                </span>
                                {t('home.badge')}
                            </div>

                            {/* Headline */}
                            <h1 className="hero-headline animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                {t('home.heroPrefix')}{' '}
                                <span className="hero-gradient-text">{t('home.heroHighlight')}</span>
                            </h1>

                            {/* Sub headline */}
                            <p className="hero-sub animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                {t('home.heroSub')}
                            </p>

                            {/* Trust badges */}
                            <div className="hero-trust-row animate-fade-in-up" style={{ animationDelay: '0.28s' }}>
                                {trustBadges.map((badge) => (
                                    <div key={badge.label} className="hero-trust-badge">
                                        <span className="trust-icon">{badge.icon}</span>
                                        <span className="trust-label">{badge.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className="hero-cta-row animate-fade-in-up" style={{ animationDelay: '0.38s' }}>
                                <button
                                    onClick={() => openDonationModal()}
                                    className="hero-btn-primary"
                                    id="home-donate-btn"
                                >
                                    <span className="hero-btn-shine" aria-hidden="true" />
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                    {t('home.donateNow')}
                                    <svg className="w-4 h-4 shrink-0 hero-btn-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>

                                <Link to="/campaigns" className="hero-btn-secondary" id="home-explore-btn">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    {t('home.exploreCampaigns')}
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT — Illustration */}
                        <div className="hero-illus-col animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="hero-illus-wrapper">
                                <div className="hero-illus-glow" aria-hidden="true" />
                                <CharityIllustration />
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div
                        ref={statsRef}
                        className="hero-stats-row animate-fade-in-up"
                        style={{ animationDelay: '0.5s' }}
                    >
                        <StatCard icon="🏛️" value={500}   suffix="+"  label={t('home.stats.ngos')}       color="#0ea5e9" delay="0s"    animate={statsVisible} />
                        <StatCard icon="💰" value={2.5}   suffix="M+" label={t('home.stats.raised')}     color="#10b981" delay="0.08s" animate={statsVisible} />
                        <StatCard icon="🙌" value={12000} suffix="+"  label={t('home.stats.volunteers')} color="#6366f1" delay="0.16s" animate={statsVisible} />
                        <StatCard icon="✅" value={100}   suffix="%"  label={t('home.stats.impact')}     color="#f59e0b" delay="0.24s" animate={statsVisible} />
                    </div>
                </div>
            </section>

            {/* ══════════════ FEATURES SECTION ══════════════ */}
            <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="feature-eyebrow">{t('home.whyChoose')}</span>
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                            {t('home.maxImpact')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="feature-card feature-card-blue">
                            <div className="feature-icon-wrap feature-icon-blue">
                                <span className="text-3xl">🛡️</span>
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                                {t('home.features.verifiedTitle')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-0">
                                {t('home.features.verifiedDesc')}
                            </p>
                            <div className="feature-card-glow feature-glow-blue" aria-hidden="true" />
                        </div>

                        <div className="feature-card feature-card-green">
                            <div className="feature-icon-wrap feature-icon-green">
                                <span className="text-3xl">📊</span>
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                                {t('home.features.trackTitle')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-0">
                                {t('home.features.trackDesc')}
                            </p>
                            <div className="feature-card-glow feature-glow-green" aria-hidden="true" />
                        </div>

                        <div className="feature-card feature-card-indigo">
                            <div className="feature-icon-wrap feature-icon-indigo">
                                <span className="text-3xl">📄</span>
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                                {t('home.features.receiptTitle')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-0">
                                {t('home.features.receiptDesc')}
                            </p>
                            <div className="feature-card-glow feature-glow-indigo" aria-hidden="true" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
