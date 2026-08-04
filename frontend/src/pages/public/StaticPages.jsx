import React, { useState } from 'react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

export const About = () => {
    const [stats, setStats] = useState(null);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/search/public-stats');
                if (res.data) setStats(res.data);
            } catch (err) {}
        };
        fetchStats();
    }, []);

    const raisedAmount = stats ? parseFloat(stats.total_raised || 0) : 2000000;
    let formattedRaised = '$2M+';
    if (stats) {
        if (raisedAmount >= 1000000) formattedRaised = `$${(raisedAmount / 1000000).toFixed(1)}M+`;
        else if (raisedAmount >= 1000) formattedRaised = `$${(raisedAmount / 1000).toFixed(1)}K+`;
        else formattedRaised = `$${Math.round(raisedAmount)}+`;
    }

    return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen overflow-x-hidden transition-colors duration-200">
        {/* ══════════════ HERO SECTION ══════════════ */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
            {/* Background mesh */}
            <div className="absolute inset-0 hero-bg-mesh pointer-events-none" aria-hidden="true" />
            <div className="absolute inset-0 hero-grid-overlay pointer-events-none" aria-hidden="true" />

            {/* Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="hero-orb hero-orb-1" />
                <div className="hero-orb hero-orb-2" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 mb-6 backdrop-blur-md animate-fade-in-up">
                    <span>✨</span> Empowering Humanity & Transparent Giving
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
                    Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">Story</span>
                </h1>

                <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                    Lifeline was founded on a simple yet profound belief: that everyone has the power to make a difference.
                    What started as a small community initiative has grown into a global platform bridging the gap between those who want to help and those who need it most.
                    We are dedicated to building a transparent, efficient, and compassionate ecosystem for philanthropy.
                </p>
            </div>
        </section>

        {/* ══════════════ MISSION & VISION ══════════════ */}
        <section className="py-12 lg:py-16 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Mission */}
                    <div className="group backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 p-8 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-lg mb-6 group-hover:scale-110 transition-transform">
                            🎯
                        </div>
                        <h2 className="font-display text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Our Mission</h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                            To empower individuals, NGOs, and volunteers by providing a seamless, transparent platform that maximizes the impact of charitable giving. We strive to connect resources with real-world needs, ensuring that every act of kindness reaches its intended destination.
                        </p>
                    </div>

                    {/* Vision */}
                    <div className="group backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 p-8 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-3xl shadow-lg mb-6 group-hover:scale-110 transition-transform">
                            👁️
                        </div>
                        <h2 className="font-display text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Our Vision</h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                            To create a world where geographical boundaries and logistical hurdles no longer stand in the way of human compassion. We envision a future where technology amplifies empathy, creating resilient communities and a fairer world for everyone.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* ══════════════ WHAT WE DO ══════════════ */}
        <section className="py-16 lg:py-20 bg-gray-100/60 dark:bg-gray-900/40 border-y border-gray-200/60 dark:border-gray-800/60 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">What We Do</h2>
                    <p className="mt-3 text-base sm:text-lg text-gray-500 dark:text-gray-400 font-medium">A holistic approach to making a real, lasting difference.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 text-3xl mb-6 shadow-xs">💝</div>
                        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-3">Transparent Crowdfunding</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">We host vetted campaigns, allowing donors to fund causes with complete confidence and real-time tracking.</p>
                    </div>

                    <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-500 text-3xl mb-6 shadow-xs">🤝</div>
                        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-3">NGO Partnerships</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">We provide non-profits with the digital tools they need to manage events, volunteers, and beneficiary requests efficiently.</p>
                    </div>

                    <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 text-3xl mb-6 shadow-xs">🙋</div>
                        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-3">Volunteer Mobilization</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">We connect passionate individuals with local community service events, tracking hours and awarding certificates.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* ══════════════ CORE VALUES & WHY CHOOSE US ══════════════ */}
        <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                {/* Core Values */}
                <div className="space-y-8">
                    <div>
                        <h2 className="font-display text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Our Core Values</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Principles that guide our daily operations and decisions.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-4 p-5 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:shadow-md transition-all">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg shrink-0">✓</div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transparency</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Every donation is tracked, and every NGO is heavily vetted to ensure your contributions make a real impact.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:shadow-md transition-all">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-lg shrink-0">✓</div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Compassion</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Empathy drives everything we do. We put the needs of our beneficiaries first.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:shadow-md transition-all">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black text-lg shrink-0">✓</div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Innovation</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">We leverage modern technology to reduce overhead and maximize the efficiency of charitable work.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* ══════════════ CTA ══════════════ */}
        <section className="py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Ready to make a difference?</h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of others who are already making a positive impact on the world.
                Whether you want to donate, volunteer, or partner with us, there is a place for you here.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                <a href="/register" className="btn-primary justify-center shadow-lg shadow-primary-500/25">
                    Join Lifeline
                </a>
                <a href="/contact" className="btn-secondary justify-center">
                    Contact Us
                </a>
            </div>
        </section>
    </div>
    );
};

export const Contact = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const data = {
            name: e.target.name.value,
            email: e.target.email.value,
            message: e.target.message.value
        };

        try {
            await api.post('/contact', data);
            setStatus({ type: 'success', text: 'Message sent successfully! We will get back to you soon.' });
            e.target.reset();
        } catch (error) {
            setStatus({ type: 'error', text: 'Failed to send message. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen overflow-x-hidden transition-colors duration-200">
            {/* ══════════════ HERO SECTION ══════════════ */}
            <section className="relative py-16 lg:py-24 overflow-hidden">
                <div className="absolute inset-0 hero-bg-mesh pointer-events-none" aria-hidden="true" />
                <div className="absolute inset-0 hero-grid-overlay pointer-events-none" aria-hidden="true" />

                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="hero-orb hero-orb-1" />
                    <div className="hero-orb hero-orb-2" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 mb-6 backdrop-blur-md animate-fade-in-up">
                        <span>📩</span> We'd Love To Hear From You
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
                        Contact Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">Team</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Have a question, feedback, or need assistance? Reach out to our dedicated support team. We're here to help 24/7.
                    </p>
                </div>
            </section>

            {/* ══════════════ MAIN CONTENT (FORM & INFO) ══════════════ */}
            <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* LEFT: Contact Information & Highlights (5 Cols) */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Contact Info Card */}
                        <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-xl space-y-6">
                            <h2 className="font-display text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                <span>📍</span> Contact Information
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Connect with us directly using any of the channels below.
                            </p>

                            <div className="space-y-5 pt-2">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl shrink-0">
                                        🏢
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Headquarters</h3>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">123 Lifeline Tower, Gulshan Ave, Dhaka 1212</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                                        ✉️
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Email Us</h3>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">support@lifeline.org / info@lifeline.org</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl shrink-0">
                                        📞
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Phone & Support</h3>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">+880 1700-000000 / Toll Free: 16212</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
                                        ⏰
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Office Hours</h3>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">Mon - Fri: 9:00 AM - 6:00 PM (GMT+6)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Why Contact Us */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
                                Why Contact Lifeline?
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 flex items-center gap-3">
                                    <span className="text-xl">💳</span>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">Donor Support</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Questions about donation receipts, tax benefits, or campaign tracking.</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 flex items-center gap-3">
                                    <span className="text-xl">🏛️</span>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">NGO Verification</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Inquire about partnership guidelines and institutional verification.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Modern Contact Form (7 Cols) */}
                    <div className="lg:col-span-7 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 p-8 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl space-y-6">
                        <div>
                            <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Send Us a Message</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">Fill in your details below and we will get back to you promptly.</p>
                        </div>

                        {/* Status Alert Banner */}
                        {status && (
                            <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-fade-in-up ${
                                status.type === 'success'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}>
                                <span className="text-lg">{status.type === 'success' ? '✅' : '⚠️'}</span>
                                <span>{status.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="form-label flex items-center gap-1.5">
                                    <span>👤</span> Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Your full name"
                                    className="form-input w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="form-label flex items-center gap-1.5">
                                    <span>✉️</span> Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    placeholder="you@example.com"
                                    className="form-input w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="form-label flex items-center gap-1.5">
                                    <span>💬</span> Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    placeholder="How can we help you today?"
                                    className="form-input w-full h-36 resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center py-4 text-base shadow-lg shadow-primary-500/25 cursor-pointer"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending Message...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <span>Send Message</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* ══════════════ EMBEDDED MAP ══════════════ */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200/80 dark:border-gray-800/80 h-96 relative">
                    <iframe
                        title="Lifeline Location Map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.082725455845!2d90.4124314!3d23.7806357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7715a40c60b%3A0x6b6c257936a718b5!2sGulshan%201%2C%20Dhaka%201212!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="filter grayscale contrast-125 dark:brightness-75 transition-all"
                    ></iframe>
                </div>
            </section>
        </div>
    );
};

export const Privacy = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight">Privacy Policy</h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-blue prose-lg max-w-none text-gray-700 dark:text-gray-200 leading-relaxed">
            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Introduction</h2>
                <p>
                    Welcome to the Lifeline Charity platform. We are committed to protecting your personal information and your right to privacy.
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Information We Collect</h2>
                <p className="mb-3">We collect personal information that you voluntarily provide to us when registering on the platform, making a donation, or participating in events. This may include:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Personal Details:</strong> Name, email address, phone number, and physical address.</li>
                    <li><strong>Financial Data:</strong> Payment details (processed securely via our third-party payment providers; we do not store full credit card numbers).</li>
                    <li><strong>Usage Data:</strong> Information about how you interact with our website, such as IP addresses and browser types.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">How We Use Your Information</h2>
                <p className="mb-3">We use the information we collect or receive for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>To facilitate account creation and the login process.</li>
                    <li>To process and manage your donations, applications, and event registrations.</li>
                    <li>To send administrative information to you regarding your account or our policies.</li>
                    <li>To improve our platform and optimize user experience.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Data Protection</h2>
                <p>
                    We implement a variety of security measures to maintain the safety of your personal information.
                    Your data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Information Sharing</h2>
                <p>
                    We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Cookies</h2>
                <p>
                    We use cookies and similar tracking technologies to track the activity on our platform and hold certain information.
                    Cookies are files with a small amount of data which may include an anonymous unique identifier.
                    You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">User Rights</h2>
                <p className="mb-3">Depending on your location, you may have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>The right to access, update, or delete the information we have on you.</li>
                    <li>The right of rectification if your information is inaccurate or incomplete.</li>
                    <li>The right to object to our processing of your personal data.</li>
                    <li>The right to withdraw consent at any time where we relied on your consent to process your personal information.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Changes to This Policy</h2>
                <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                    You are advised to review this Privacy Policy periodically for any changes.
                </p>
            </section>

            <section className="mb-10 bg-gray-50 dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
                <p className="mb-6">If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
                <ul className="list-none space-y-3 font-medium">
                    <li className="flex items-center text-primary-700 hover:text-primary-800 transition">
                        <span className="text-xl mr-3">📧</span>
                        <a href="mailto:privacy@lifelinecharity.org">ekraislam2023@gmail.com</a>
                    </li>
                    <li className="flex items-center text-primary-700">
                        <span className="text-xl mr-3">📞</span> +8801581828741
                    </li>
                    <li className="flex items-center text-primary-700">
                        <span className="text-xl mr-3">🏢</span>Purbachal American City, Kanchan, Rupganj, Narayanganj-1461, Dhaka, Bangladesh
                    </li>
                </ul>
            </section>
        </div>
    </div>
);

export const Terms = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight">Terms & Conditions</h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Effective Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-blue prose-lg max-w-none text-gray-700 dark:text-gray-200 leading-relaxed">
            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">1. Acceptance of Terms</h2>
                <p>
                    By accessing or using the Lifeline Charity platform ("Lifeline", "we", "us", or "our"), you agree to be bound by these Terms & Conditions. If you do not agree to all of the terms and conditions, you must not use our services.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">2. User Accounts</h2>
                <p className="mb-3">When you create an account on our platform (as a Donor, Volunteer, or NGO), you are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Maintaining the confidentiality of your account login information.</li>
                    <li>All activities that occur under your account.</li>
                    <li>Providing accurate, current, and complete information during registration.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">3. Donations & Payments</h2>
                <p className="mb-3">Lifeline facilitates donations to registered NGOs and campaigns.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>All donations are processed securely through authorized third-party payment processors.</li>
                    <li>Donations are generally non-refundable. Refunds are only issued in cases of technical errors or proven fraud.</li>
                    <li>Lifeline does not charge a platform fee to NGOs, but standard payment processing fees apply.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">4. Campaign Guidelines</h2>
                <p>
                    Campaigns can only be created by verified NGOs. All funds raised must be used strictly for the purpose stated in the campaign description. Lifeline reserves the right to suspend any campaign suspected of violating these terms or local laws.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">5. Beneficiary & NGO Responsibilities</h2>
                <p className="mb-3">Organizations partnering with Lifeline must adhere to strict transparency standards:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>NGOs must provide accurate documentation for verification.</li>
                    <li>NGOs must provide regular updates on campaign progress and fund utilization.</li>
                    <li>Beneficiary requests must be genuine and supported by necessary evidence.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">6. Volunteer Responsibilities</h2>
                <p>
                    Volunteers agree to conduct themselves professionally and respectfully during any Lifeline-affiliated events. Hours tracked on the platform must accurately reflect actual time spent volunteering.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">7. Privacy & Data Protection</h2>
                <p>
                    Your privacy is critically important to us. Please review our <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a> to understand how we collect, use, and share your personal information.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">8. Prohibited Activities</h2>
                <p className="mb-3">Users may not:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Use the platform for any illegal or unauthorized purpose.</li>
                    <li>Attempt to hack, destabilize, or adapt the website.</li>
                    <li>Submit false documentation or create fraudulent campaigns.</li>
                    <li>Harass, abuse, or harm another person through our platform.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">9. Limitation of Liability</h2>
                <p>
                    Lifeline serves solely as a platform to connect donors, NGOs, and volunteers. We do not guarantee the absolute accuracy of every campaign, though we vet NGOs rigorously. We shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of our platform.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">10. Account Suspension & Termination</h2>
                <p>
                    We reserve the right to suspend or terminate your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms & Conditions.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">11. Changes to Terms</h2>
                <p>
                    We reserve the right to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. Your continued use of the platform constitutes acceptance of the new terms.
                </p>
            </section>

            <section className="mb-10 bg-gray-50 dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                <p className="mb-6">If you have any questions about these Terms & Conditions, please contact us:</p>
                <ul className="list-none space-y-3 font-medium">
                    <li className="flex items-center text-primary-700 hover:text-primary-800 transition">
                        <span className="text-xl mr-3">📧</span>
                        <a href="mailto:terms@lifelinecharity.org">towfiq@gmail.com</a>
                    </li>
                    <li className="flex items-center text-primary-700">
                        <span className="text-xl mr-3">📞</span> +8801581828741
                    </li>
                    <li className="flex items-center text-primary-700">
                        <span className="text-xl mr-3">🏢</span> Purbachal American City, Kanchan, Rupganj, Narayanganj-1461, Dhaka, Bangladesh
                    </li>
                </ul>
            </section>
        </div>
    </div>
);

export const FAQ = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState(null);

    const faqData = [
        {
            category: "Donations",
            items: [
                { q: "How do I make a donation?", a: "You can donate by navigating to any active campaign and clicking the 'Donate Now' button. We accept major credit cards and other secure payment methods." },
                { q: "Is my donation tax-deductible?", a: "Depending on your location and the NGO's status, your donation may be tax-deductible. A receipt will be sent to your email after a successful transaction." },
            ]
        },
        {
            category: "Campaigns",
            items: [
                { q: "How are campaigns verified?", a: "All campaigns are created by registered NGOs and undergo a strict verification process by our admin team before they go live on the platform." },
                { q: "Can I share a campaign?", a: "Yes! Every campaign page has social sharing buttons so you can help spread the word and increase the impact." },
            ]
        },
        {
            category: "Beneficiary Applications",
            items: [
                { q: "Who can apply as a beneficiary?", a: "Individuals in need of urgent assistance can submit a help request. These requests are reviewed by registered NGOs who can adopt and fund them." },
                { q: "How long does it take for an application to be approved?", a: "The review process typically takes 3-5 business days depending on the volume of requests and the verification of documents." },
            ]
        },
        {
            category: "NGO Registration",
            items: [
                { q: "How can my NGO join Lifeline?", a: "You can sign up as an NGO from the registration page. You will need to provide official registration documents for verification." },
                { q: "Are there any fees for NGOs?", a: "Lifeline is completely free for registered NGOs. We only deduct standard payment gateway processing fees for donations." },
            ]
        },
        {
            category: "Volunteer Registration",
            items: [
                { q: "How do I become a volunteer?", a: "Create an account and select the 'Volunteer' role. Once registered, you can browse and apply for local events hosted by our NGO partners." },
                { q: "Do I get a certificate for volunteering?", a: "Yes! After completing your assigned tasks and logging your hours, you can download an official Certificate of Appreciation from your dashboard." },
            ]
        },
        {
            category: "Account & Login",
            items: [
                { q: "I forgot my password, what should I do?", a: "Click on the 'Forgot Password' link on the login page and enter your registered email address to receive a password reset link." },
                { q: "Can I change my account role?", a: "Once an account is created, the primary role (e.g., Donor, NGO) cannot be changed directly. Please contact support if you registered with the wrong role." },
            ]
        },
        {
            category: "Payment Security",
            items: [
                { q: "Is my payment information secure?", a: "Absolutely. We use industry-standard encryption and partner with secure payment gateways (like Stripe/PayPal). We never store your full card details on our servers." },
            ]
        },
        {
            category: "Contact & Support",
            items: [
                { q: "How can I contact customer support?", a: "You can reach out to us via the Contact Us page, or email us directly at support@lifelinecharity.org." },
            ]
        }
    ];

    const filteredFaqs = faqData.map(category => {
        const filteredItems = category.items.filter(item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...category, items: filteredItems };
    }).filter(category => category.items.length > 0);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight mb-4">How can we help?</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">Search our knowledge base or browse categories below to find answers to your questions.</p>

                <div className="max-w-xl mx-auto relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-xl">🔍</span>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-4 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-lg shadow-sm transition"
                        placeholder="Search for answers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-12">
                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((category, catIndex) => (
                        <div key={catIndex} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{category.category}</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {category.items.map((item, itemIndex) => {
                                    const globalIndex = `${catIndex}-${itemIndex}`;
                                    const isOpen = openIndex === globalIndex;
                                    return (
                                        <div key={globalIndex} className="bg-white dark:bg-gray-800">
                                            <button
                                                onClick={() => toggleAccordion(globalIndex)}
                                                className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none focus:bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:bg-gray-900 transition-colors"
                                            >
                                                <span className="font-medium text-gray-900 dark:text-white pr-4">{item.q}</span>
                                                <span className={`transform transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </span>
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-5 text-gray-600 dark:text-gray-300 animate-fadeIn">
                                                    <p className="leading-relaxed">{item.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100">
                        <span className="text-4xl mb-4 block">😕</span>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Try adjusting your search terms or browse the categories.</p>
                    </div>
                )}
            </div>

            <div className="mt-16 bg-primary-50 dark:bg-gray-800 rounded-2xl p-8 text-center border border-primary-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Still need help?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">If you couldn't find the answer to your question, our support team is ready to help.</p>
                <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm">
                    Contact Support
                </a>
            </div>
        </div>
    );
};

export const NotFound = () => (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Page not found.</p>
    </div>
);
