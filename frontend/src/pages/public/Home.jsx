import React from 'react';
import { Link } from 'react-router-dom';
import { useDonation } from '../../context/DonationContext';
import { useLanguage } from '../../context/LanguageContext';

const Home = () => {
    const { openDonationModal } = useDonation();
    const { t } = useLanguage();

    return (
        <div className="bg-gray-50 dark:bg-gray-950 overflow-x-hidden transition-colors duration-200">
            {/* Hero Section */}
            <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[55%] rounded-full bg-primary-500/15 blur-3xl animate-blob"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-500/15 blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-[-15%] left-[20%] w-[55%] h-[50%] rounded-full bg-emerald-500/15 blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    {/* Live Movement Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel text-primary-700 dark:text-primary-300 font-extrabold text-xs tracking-wider uppercase mb-8 shadow-xs animate-fade-in-up">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-primary-600 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        </span>
                        {t('home.badge')}
                    </div>
                    
                    <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-[1.08] max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        {t('home.heroPrefix')}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-emerald-500 pb-2 inline-block">
                            {t('home.heroHighlight')}
                        </span>
                    </h1>
                    
                    <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {t('home.heroSub')}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <button
                            onClick={() => openDonationModal()}
                            className="btn-primary w-full sm:w-auto py-4 px-8 text-sm uppercase tracking-wider group"
                            id="home-donate-btn"
                        >
                            {t('home.donateNow')}
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                        <Link to="/campaigns" className="btn-secondary w-full sm:w-auto py-4 px-8 text-sm uppercase tracking-wider">
                            {t('home.exploreCampaigns')}
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-20 pt-10 border-t border-gray-200/60 dark:border-gray-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <div className="glass-card p-6 rounded-3xl text-center group hover:scale-105 transition-transform duration-300">
                            <h4 className="stat-number text-primary-600 dark:text-primary-400">500+</h4>
                            <p className="text-meta mt-1">{t('home.stats.ngos')}</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl text-center group hover:scale-105 transition-transform duration-300">
                            <h4 className="stat-number text-emerald-600 dark:text-emerald-400">$2.5M+</h4>
                            <p className="text-meta mt-1">{t('home.stats.raised')}</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl text-center group hover:scale-105 transition-transform duration-300">
                            <h4 className="stat-number text-indigo-600 dark:text-indigo-400">12k+</h4>
                            <p className="text-meta mt-1">{t('home.stats.volunteers')}</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl text-center group hover:scale-105 transition-transform duration-300">
                            <h4 className="stat-number text-amber-600 dark:text-amber-400">100%</h4>
                            <p className="text-meta mt-1">{t('home.stats.impact')}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Value Proposition Feature Section */}
            <div className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-black tracking-widest text-primary-600 uppercase mb-2 block">{t('home.whyChoose')}</span>
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                            {t('home.maxImpact')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card-premium p-8 flex flex-col items-start text-left">
                            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-800 flex items-center justify-center text-3xl mb-6">
                                🛡️
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">{t('home.features.verifiedTitle')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {t('home.features.verifiedDesc')}
                            </p>
                        </div>

                        <div className="card-premium p-8 flex flex-col items-start text-left">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-3xl mb-6">
                                📊
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">{t('home.features.trackTitle')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {t('home.features.trackDesc')}
                            </p>
                        </div>

                        <div className="card-premium p-8 flex flex-col items-start text-left">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-3xl mb-6">
                                📄
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">{t('home.features.receiptTitle')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {t('home.features.receiptDesc')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
