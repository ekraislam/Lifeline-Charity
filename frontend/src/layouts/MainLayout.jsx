import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getMediaUrl } from '../api/axios?v=1';
import logo from '../assets/fogo.png';
import NotificationBell from '../components/common/NotificationBell';

const MainLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { t, language, switchLanguage } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const profileRef = useRef(null);
    const langRef = useRef(null);

    /* Scroll effect for glassmorphism intensification */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* Close dropdowns on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdownOpen(false);
            if (langRef.current && !langRef.current.contains(e.target)) setLangMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* Close mobile menu on route change */
    useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navigation = [
        { name: t('nav.home'),     href: '/',          current: location.pathname === '/' },
        { name: t('nav.campaigns'),href: '/campaigns', current: location.pathname.startsWith('/campaigns') },
        { name: t('nav.events'),   href: '/events',    current: location.pathname.startsWith('/events') },
        { name: t('nav.about'),    href: '/about',     current: location.pathname === '/about' },
        { name: t('nav.contact'),  href: '/contact',   current: location.pathname === '/contact' },
    ];

    /* Role-color badge */
    const roleColors = {
        admin:       'from-rose-500 to-pink-600',
        ngo:         'from-emerald-500 to-teal-600',
        donor:       'from-sky-500 to-blue-600',
        volunteer:   'from-violet-500 to-purple-600',
        beneficiary: 'from-amber-500 to-orange-600',
    };
    const roleGrad = roleColors[user?.role] || 'from-primary-500 to-indigo-600';

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-200">

            {/* ══════════════ PREMIUM NAVBAR ══════════════ */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.08)] border-b border-gray-200/60 dark:border-gray-800/80'
                    : 'bg-white/75 dark:bg-gray-950/75 backdrop-blur-md border-b border-gray-100/80 dark:border-gray-800/60'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-[68px]">

                        {/* ── LEFT: Logo + Nav ── */}
                        <div className="flex items-center gap-6 lg:gap-8">

                            {/* Logo */}
                            <Link to="/" className="navbar-logo-link group" aria-label="Lifeline Home">
                                <div className={`navbar-logo-icon-wrap transition-all duration-300 ${scrolled ? 'scale-95' : 'scale-100'}`}>
                                    <img src={logo} alt="Lifeline Logo" className="h-8 w-auto filter brightness-110" />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="font-display text-[1.35rem] font-black tracking-tight text-gray-900 dark:text-white leading-none">
                                        Life<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">line</span>
                                    </span>
                                    <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-gray-400 dark:text-gray-500 mt-0.5">
                                        Charity System
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Nav Pill Bar */}
                            <nav className="hidden lg:flex items-center gap-0.5 navbar-nav-pill" aria-label="Main navigation">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={`navbar-nav-item ${item.current ? 'navbar-nav-item--active' : 'navbar-nav-item--idle'}`}
                                        aria-current={item.current ? 'page' : undefined}
                                    >
                                        {item.name}
                                        {item.current && <span className="navbar-active-dot" aria-hidden="true" />}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* ── RIGHT: Controls ── */}
                        <div className="hidden sm:flex items-center gap-2">

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="navbar-icon-btn group"
                                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                                aria-label="Toggle Light/Dark Theme"
                            >
                                <span className="navbar-icon-btn-inner">
                                    {theme === 'dark' ? (
                                        /* Sun icon */
                                        <svg className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                                        </svg>
                                    ) : (
                                        /* Moon icon */
                                        <svg className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                                            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </span>
                            </button>

                            {/* Language Switcher */}
                            <div className="relative" ref={langRef}>
                                <button
                                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                                    className="navbar-icon-btn group"
                                    aria-label="Change Language"
                                    id="lang-switcher-btn"
                                >
                                    <span className="navbar-icon-btn-inner">
                                        <span className="text-sm leading-none">🌐</span>
                                        <span className="text-[11px] font-extrabold tracking-wide text-gray-700 dark:text-gray-200">
                                            {language === 'en' ? 'EN' : 'বাং'}
                                        </span>
                                        <svg className={`w-2.5 h-2.5 text-gray-400 transition-transform duration-200 ${langMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </button>

                                {/* Language Dropdown */}
                                {langMenuOpen && (
                                    <div className="navbar-dropdown w-44 right-0 mt-2">
                                        <button
                                            onClick={() => { switchLanguage('en'); setLangMenuOpen(false); }}
                                            className={`navbar-dropdown-item ${language === 'en' ? 'navbar-dropdown-item--active' : ''}`}
                                            id="lang-en-btn"
                                        >
                                            <span className="text-base leading-none">🇬🇧</span>
                                            <span className="font-bold">English</span>
                                            {language === 'en' && (
                                                <svg className="ml-auto w-3.5 h-3.5 text-primary-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => { switchLanguage('bn'); setLangMenuOpen(false); }}
                                            className={`navbar-dropdown-item ${language === 'bn' ? 'navbar-dropdown-item--active' : ''}`}
                                            id="lang-bn-btn"
                                        >
                                            <span className="text-base leading-none">🇧🇩</span>
                                            <span className="font-bold">বাংলা</span>
                                            {language === 'bn' && (
                                                <svg className="ml-auto w-3.5 h-3.5 text-primary-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {user ? (
                                <div className="flex items-center gap-2 ml-1">

                                    {/* Dashboard Button */}
                                    <Link
                                        to="/dashboard"
                                        className="navbar-dashboard-btn group"
                                        id="nav-dashboard-btn"
                                    >
                                        <span className="navbar-dashboard-shine" aria-hidden="true" />
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        {t('nav.dashboard')}
                                    </Link>

                                    {/* Notification Bell */}
                                    <NotificationBell />

                                    {/* Profile Avatar + Dropdown */}
                                    <div className="relative" ref={profileRef}>
                                        <button
                                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                            className="navbar-avatar-btn group"
                                            title={user.name}
                                            id="nav-profile-btn"
                                            aria-expanded={profileDropdownOpen}
                                        >
                                            {user.avatar || user.profile_picture ? (
                                                <img
                                                    src={getMediaUrl(user.avatar || user.profile_picture)}
                                                    alt={user.name}
                                                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 ring-offset-1 ring-offset-transparent"
                                                />
                                            ) : (
                                                <div className={`h-9 w-9 rounded-full bg-gradient-to-tr ${roleGrad} text-white font-black flex items-center justify-center text-sm ring-2 ring-white dark:ring-gray-800 ring-offset-1`}>
                                                    {(user.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {/* Online indicator */}
                                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-950" aria-hidden="true" />
                                        </button>

                                        {/* Profile Dropdown */}
                                        {profileDropdownOpen && (
                                            <div className="navbar-dropdown w-64 right-0 mt-3 navbar-profile-dropdown">

                                                {/* Profile header */}
                                                <div className={`navbar-profile-header bg-gradient-to-br ${roleGrad}`}>
                                                    <div className="flex items-center gap-3">
                                                        {user.avatar || user.profile_picture ? (
                                                            <img src={getMediaUrl(user.avatar || user.profile_picture)} alt={user.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white/40" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-white/20 text-white font-black flex items-center justify-center text-base ring-2 ring-white/30">
                                                                {(user.name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-black text-white truncate">{user.name}</p>
                                                            <p className="text-[10px] text-white/70 truncate">{user.email}</p>
                                                        </div>
                                                        <span className="navbar-role-badge shrink-0">{user.role}</span>
                                                    </div>
                                                </div>

                                                {/* Dropdown links */}
                                                <div className="p-1.5 space-y-0.5">
                                                    <Link
                                                        to="/donations/history"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                        className="navbar-dropdown-item"
                                                    >
                                                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        {t('nav.givingHistory')}
                                                    </Link>
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                        className="navbar-dropdown-item"
                                                    >
                                                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {t('nav.accountSettings')}
                                                    </Link>

                                                    <div className="navbar-dropdown-divider" />

                                                    <button
                                                        onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                                                        className="navbar-dropdown-item navbar-dropdown-item--danger w-full"
                                                    >
                                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        {t('nav.signOut')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 ml-1">
                                    <Link
                                        to="/login"
                                        className="navbar-ghost-btn"
                                        id="nav-login-btn"
                                    >
                                        {t('nav.login')}
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="navbar-dashboard-btn group"
                                        id="nav-register-btn"
                                    >
                                        <span className="navbar-dashboard-shine" aria-hidden="true" />
                                        {t('nav.signup')}
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* ── MOBILE: Compact controls ── */}
                        <div className="flex items-center sm:hidden gap-1.5">
                            <button
                                onClick={toggleTheme}
                                className="navbar-icon-btn"
                                aria-label="Toggle Dark Mode"
                            >
                                <span className="navbar-icon-btn-inner">
                                    {theme === 'dark' ? '☀️' : '🌙'}
                                </span>
                            </button>
                            <button
                                onClick={() => switchLanguage(language === 'en' ? 'bn' : 'en')}
                                className="navbar-icon-btn"
                                aria-label="Toggle Language"
                            >
                                <span className="navbar-icon-btn-inner text-[11px] font-extrabold text-gray-700 dark:text-gray-200">
                                    {language === 'en' ? 'বাং' : 'EN'}
                                </span>
                            </button>
                            {user && <NotificationBell />}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="navbar-icon-btn"
                                aria-label="Toggle Menu"
                            >
                                <span className="navbar-icon-btn-inner">
                                    {mobileMenuOpen ? (
                                        <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── MOBILE DRAWER ── */}
                {mobileMenuOpen && (
                    <div className="sm:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-1 animate-fade-in-up">
                        {/* Nav Links */}
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                                    item.current
                                        ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                                }`}
                            >
                                {item.current && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />}
                                {item.name}
                            </Link>
                        ))}

                        {/* Auth Controls */}
                        {user ? (
                            <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                {/* Mini profile */}
                                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60">
                                    {user.avatar || user.profile_picture ? (
                                        <img src={getMediaUrl(user.avatar || user.profile_picture)} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                                    ) : (
                                        <div className={`h-9 w-9 rounded-full bg-gradient-to-tr ${roleGrad} text-white font-black flex items-center justify-center text-sm`}>
                                            {(user.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user.name}</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
                                    </div>
                                </div>
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="navbar-dashboard-btn group w-full justify-center">
                                    <span className="navbar-dashboard-shine" aria-hidden="true" />
                                    {t('nav.dashboard')}
                                </Link>
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all duration-200 cursor-pointer">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    {t('nav.signOut')}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2.5 pt-3 mt-2 border-t border-gray-100 dark:border-gray-800">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="navbar-ghost-btn justify-center text-center">
                                    {t('nav.login')}
                                </Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="navbar-dashboard-btn group justify-center">
                                    <span className="navbar-dashboard-shine" aria-hidden="true" />
                                    {t('nav.signup')}
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </header>



            {/* Main Application Page Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-20">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="Lifeline Logo" className="h-8 w-auto" />
                                <span className="font-display text-2xl font-black text-gray-900 dark:text-white">Life<span className="text-primary-600 dark:text-primary-400">line</span></span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                                {t('footer.tagline')}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-display text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">{t('footer.quickLinks')}</h4>
                            <ul className="space-y-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                <li><Link to="/campaigns" className="hover:text-primary-600 dark:hover:text-primary-400">{t('footer.exploreCampaigns')}</Link></li>
                                <li><Link to="/events" className="hover:text-primary-600 dark:hover:text-primary-400">{t('footer.communityEvents')}</Link></li>
                                <li><Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400">{t('footer.aboutLifeline')}</Link></li>
                                <li><Link to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400">{t('footer.contactSupport')}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-display text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">{t('footer.legalSupport')}</h4>
                            <ul className="space-y-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                <li><Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400">{t('footer.privacyPolicy')}</Link></li>
                                <li><Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400">{t('footer.termsOfService')}</Link></li>
                                <li><Link to="/faq" className="hover:text-primary-600 dark:hover:text-primary-400">{t('footer.faq')}</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
                        <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
                        <p className="mt-2 sm:mt-0 font-semibold">{t('footer.slogan')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
