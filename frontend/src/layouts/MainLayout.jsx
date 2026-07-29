import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/fogo.png';

const MainLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
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
        <div className="min-h-screen flex flex-col bg-gray-50">
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="flex items-center gap-3">
                                    <img src={logo} alt="Lifeline Logo" className="h-12 w-auto drop-shadow-md" />
                                    <span className="text-3xl font-extrabold text-primary-600 tracking-tight">Lifeline</span>
                                </Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`${
                                            item.current
                                                ? 'border-primary-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                                        Dashboard
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <button 
                                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                                className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition"
                                                title={user.name}
                                            >
                                                {user.avatar || user.profile_picture ? (
                                                    <img src={`http://localhost:5000${user.avatar || user.profile_picture}`} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                        {(user.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </button>
                                            
                                            {/* Dropdown menu */}
                                            {profileDropdownOpen && (
                                                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                                    <div className="py-2 px-4 border-b border-gray-100">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900 truncate max-w-[130px]" title={user.name}>{user.name}</span>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 truncate mt-1" title={user.email}>{user.email}</p>
                                                    </div>
                                                    <div className="py-1">
                                                        <Link 
                                                            to="/profile" 
                                                            onClick={() => setProfileDropdownOpen(false)}
                                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            Update Profile
                                                        </Link>
                                                        <button 
                                                            onClick={() => {
                                                                setProfileDropdownOpen(false);
                                                                handleLogout();
                                                            }} 
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            Logout
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Logout</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex space-x-4">
                                    <Link to="/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm">
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
                <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden bg-white border-t border-gray-200`}>
                    <div className="pt-2 pb-3 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`${
                                    item.current
                                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {user ? (
                            <div className="space-y-1">
                                <Link to="/dashboard" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700">Dashboard</Link>
                                <button onClick={handleLogout} className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700">Logout</button>
                            </div>
                        ) : (
                            <div className="space-y-1 flex flex-col px-4 gap-2">
                                <Link to="/login" className="w-full text-center bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-2 rounded-md text-base font-medium">Log in</Link>
                                <Link to="/register" className="w-full text-center bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-base font-medium">Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex justify-center space-x-6 md:order-2">
                            <Link to="/privacy" className="text-gray-400 hover:text-gray-500 text-sm">Privacy Policy</Link>
                            <Link to="/terms" className="text-gray-400 hover:text-gray-500 text-sm">Terms & Conditions</Link>
                            <Link to="/faq" className="text-gray-400 hover:text-gray-500 text-sm">FAQ</Link>
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
