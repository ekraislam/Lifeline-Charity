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
        { name: 'About', href: '/about', current: location.pathname === '/about' },
        { name: 'Contact', href: '/contact', current: location.pathname === '/contact' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="flex items-center gap-3">
                                    <img src={logo} alt="Lifeline Logo" className="h-12 w-auto drop-shadow-md" />
                                    <span className="text-3xl font-extrabold text-primary-600 tracking-tight">Lifeline</span>
                                </Link>
                            </div>
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-2 items-center">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`${item.current
                                                ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 hover:text-gray-900 dark:text-white'
                                            } px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                                )}
                            </button>
                            {user ? (
                                <div className="flex items-center space-x-6">
                                    <Link to="/dashboard" className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-md transition-all duration-200 transform hover:-translate-y-0.5">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                        Dashboard
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <button
                                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                                className="flex text-sm border-2 border-primary-200 rounded-full focus:outline-none focus:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                                title={user.name}
                                            >
                                                {user.avatar || user.profile_picture ? (
                                                    <img src={getMediaUrl(user.avatar || user.profile_picture)} alt={user.name} className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-gray-800" />
                                                ) : (
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold border-2 border-white dark:border-gray-800">
                                                        {(user.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </button>

                                            {/* Dropdown menu */}
                                            {profileDropdownOpen && (
                                                <div className="origin-top-right absolute right-0 mt-3 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transition-all transform opacity-100 scale-100">
                                                    <div className="py-3 px-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-100">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[130px]" title={user.name}>{user.name}</span>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800 uppercase tracking-wide">
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1" title={user.email}>{user.email}</p>
                                                    </div>
                                                    <div className="py-2">
                                                        <Link
                                                            to="/donations/history"
                                                            onClick={() => setProfileDropdownOpen(false)}
                                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                                        >
                                                            <svg className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            My Donations
                                                        </Link>
                                                        <Link
                                                            to="/profile"
                                                            onClick={() => setProfileDropdownOpen(false)}
                                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                                        >
                                                            <svg className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            Update Profile
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                setProfileDropdownOpen(false);
                                                                handleLogout();
                                                            }}
                                                            className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <svg className="mr-3 h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                            </svg>
                                                            Logout
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex space-x-3 items-center">
                                    <Link to="/login" className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${location.pathname === '/login' ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md transform hover:-translate-y-0.5' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-900 hover:text-primary-600 hover:border-primary-300'}`}>
                                        Log in
                                    </Link>
                                    <Link to="/register" className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${location.pathname === '/register' ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md transform hover:-translate-y-0.5' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-900 hover:text-primary-600 hover:border-primary-300'}`}>
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={toggleTheme}
                                className="p-2 mr-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors focus:outline-none"
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                                )}
                            </button>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                            >
                                <span className="sr-only">Open main menu</span>
                                {/* Icon when menu is closed. */}
                                <svg className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                {/* Icon when menu is open. */}
                                <svg className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-inner`}>
                    <div className="pt-2 pb-3 space-y-1 px-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`${item.current
                                        ? 'bg-primary-50 text-primary-700 font-semibold'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 hover:text-gray-900 dark:text-white'
                                    } block px-3 py-2.5 rounded-lg text-base font-medium transition-colors`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700 px-4">
                        {user ? (
                            <div className="space-y-3">
                                <div className="flex items-center px-2 py-2 mb-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex-shrink-0">
                                        {user.avatar || user.profile_picture ? (
                                            <img src={getMediaUrl(user.avatar || user.profile_picture)} alt={user.name} className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold border-2 border-white dark:border-gray-800 shadow-sm">
                                                {(user.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800 dark:text-gray-100">{user.name}</div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                </div>
                                <Link to="/dashboard" className="flex items-center justify-center w-full px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="flex items-center justify-center w-full px-4 py-2.5 border border-red-200 rounded-lg shadow-sm text-base font-medium text-red-600 bg-white dark:bg-gray-800 hover:bg-red-50 transition-colors">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/login" className={`flex items-center justify-center px-4 py-2.5 rounded-lg text-base font-medium transition-all shadow-sm ${location.pathname === '/login' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}>Log in</Link>
                                <Link to="/register" className={`flex items-center justify-center px-4 py-2.5 rounded-lg text-base font-medium transition-all shadow-sm ${location.pathname === '/register' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}>Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex justify-center space-x-6 md:order-2">
                            <Link to="/privacy" className="text-gray-400 hover:text-gray-500 dark:text-gray-400 text-sm">Privacy Policy</Link>
                            <Link to="/terms" className="text-gray-400 hover:text-gray-500 dark:text-gray-400 text-sm">Terms & Conditions</Link>
                            <Link to="/faq" className="text-gray-400 hover:text-gray-500 dark:text-gray-400 text-sm">FAQ</Link>
                        </div>
                        <div className="mt-8 md:mt-0 md:order-1">
                            <p className="text-center text-base text-gray-400">&copy; {new Date().getFullYear()} Lifeline Foundation. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
