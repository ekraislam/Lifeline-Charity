import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="bg-white dark:bg-gray-900 overflow-x-hidden">
            {/* Hero Section */}
            <div className="relative min-h-[85vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-primary-400/20 blur-3xl animate-blob"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-blue-400/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-teal-400/20 blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
                    <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-[1px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-400 font-medium text-sm mb-8 shadow-sm border border-primary-100 dark:border-gray-700 animate-fade-in-up">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-primary-600 mr-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        </span>
                        Join the movement for change
                    </div>
                    
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 dark:text-white tracking-tighter mb-6 leading-[1.1] max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Empower lives through <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500 pb-2 inline-block">charitable giving</span>
                    </h1>
                    
                    <p className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Lifeline connects donors, volunteers, and NGOs to make a real difference in the world. Join our community today and start changing lives.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link to="/campaigns" className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group">
                            Donate Now
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center">
                            Join Us
                        </Link>
                    </div>

                    <div className="mt-20 pt-10 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <div className="text-center group">
                            <h4 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">500+</h4>
                            <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Verified NGOs</p>
                        </div>
                        <div className="text-center group">
                            <h4 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">$2M+</h4>
                            <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Funds Raised</p>
                        </div>
                        <div className="text-center group">
                            <h4 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">10k+</h4>
                            <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Volunteers</p>
                        </div>
                        <div className="text-center group">
                            <h4 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">100%</h4>
                            <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Transparent</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Impact Feature Section */}
            <div className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-3">Our Impact</h2>
                    <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                        A better way to give
                    </h3>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        We ensure your contributions go directly to those in need, maximizing efficiency and impact through modern technology, transparency, and a global network of volunteers.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
