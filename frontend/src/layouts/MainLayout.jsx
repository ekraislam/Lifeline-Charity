import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { getMediaUrl } from '../api/axios?v=1';
import logo from '../assets/fogo.png';

const MainLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navigation = [
        { name: 'Home', href: '/', current: location.pathname === '/' },
        { name: 'Campaigns', href: '/campaigns', current: location.pathname.startsWith('/campaigns') },
        { name: 'Events', href: '/events', current: location.pathname.startsWith('/events') },
        { name: 'About Us', href: '/about', current: location.pathname === '/about' },
        { name: 'Contact', href: '/contact', current: location.pathname === '/contact' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            {/* Top Glassmorphic Navigation Bar */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-gray-900/85 border-b border-gray-100 dark:border-gray-800 shadow-xs transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Left Branding */}
                        <div className="flex items-center gap-8">
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="p-1 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 shadow-sm group-hover:scale-105 transition-transform duration-200">
                                    <img src={logo} alt="Lifeline Logo" className="h-9 w-auto filter brightness-110" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-display text-2xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                                        Life<span className="text-primary-600 dark:text-primary-400">line</span>
                                    </span>
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">Charity System</span>
                                </div>
                            </Link>

                            {/* Desktop Nav Items */}
                            <nav className="hidden lg:flex items-center gap-1 bg-gray-100/70 dark:bg-gray-800/60 p-1.5 rounded-full border border-gray-200/50 dark:border-gray-700/50">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`${item.current
                                                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 font-extrabold shadow-sm'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-900/50'
                                            } px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all duration-200`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Right Action Menu */}
                        <div className="hidden sm:flex items-center gap-4">
                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-2xs cursor-pointer"
                                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                                aria-label="Toggle Light/Dark Theme"
                            >
                                <span className="text-xs font-extrabold tracking-wider uppercase">
                                    {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                                </span>
                            </button>

                            {user ? (
                                <div className="flex items-center gap-3">
                                    <Link to="/dashboard" className="btn-primary py-2.5 px-5 text-xs tracking-wider uppercase">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        Dashboard
                                    </Link>

                                    {/* User Avatar Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                            className="flex text-sm border-2 border-primary-500/40 rounded-full focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-200 shadow-sm hover:scale-105 cursor-pointer"
                                            title={user.name}
                                        >
                                            {user.avatar || user.profile_picture ? (
                                                <img src={getMediaUrl(user.avatar || user.profile_picture)} alt={user.name} className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-800" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-inner border-2 border-white dark:border-gray-800">
                                                    {(user.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </button>

                                        {/* Dropdown Card */}
                                        {profileDropdownOpen && (
                                            <div className="origin-top-right absolute right-0 mt-3 w-64 rounded-3xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 z-50 overflow-hidden transition-all animate-fade-in-up">
                                                <div className="py-4 px-5 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm font-black text-gray-900 dark:text-white truncate" title={user.name}>{user.name}</span>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 border border-primary-200 dark:border-primary-800 uppercase tracking-wider">
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{user.email}</p>
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    <Link
                                                        to="/donations/history"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                        className="flex items-center px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                        💳 My Giving History & Receipts
                                                    </Link>
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                        className="flex items-center px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                        ⚙️ Account Settings
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setProfileDropdownOpen(false);
                                                            handleLogout();
                                                        }}
                                                        className="flex items-center w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                                                    >
                                                        🚪 Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="btn-primary py-2.5 px-5 text-xs uppercase tracking-wider">
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger Toggle */}
                        <div className="flex items-center sm:hidden gap-2">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800"
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? '🌙' : '☀️'}
                            </button>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-2xl text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800"
                            >
                                {mobileMenuOpen ? '✕' : '☰'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu drawer */}
                {mobileMenuOpen && (
                    <div className="sm:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 pt-3 pb-6 space-y-3">
                        <div className="space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`${item.current
                                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-extrabold'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        } block px-4 py-3 rounded-2xl text-sm font-bold transition-colors`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        {user ? (
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-xs uppercase tracking-wider">
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="btn-danger w-full text-xs uppercase tracking-wider">
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary text-center text-xs uppercase tracking-wider">Log in</Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary text-center text-xs uppercase tracking-wider">Sign up</Link>
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
                                Connecting verified beneficiaries, approved NGOs, generous donors, and passionate volunteers to create transparent, high-impact charitable campaigns worldwide.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-display text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                <li><Link to="/campaigns" className="hover:text-primary-600 dark:hover:text-primary-400">Explore Campaigns</Link></li>
                                <li><Link to="/events" className="hover:text-primary-600 dark:hover:text-primary-400">Community Events</Link></li>
                                <li><Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400">About Lifeline</Link></li>
                                <li><Link to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400">Contact Support</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-display text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">Legal & Support</h4>
                            <ul className="space-y-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                <li><Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400">Terms of Service</Link></li>
                                <li><Link to="/faq" className="hover:text-primary-600 dark:hover:text-primary-400">Frequently Asked Questions</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Lifeline Charity System. All rights reserved.</p>
                        <p className="mt-2 sm:mt-0 font-semibold">Transparent • Verified • Direct Impact</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
