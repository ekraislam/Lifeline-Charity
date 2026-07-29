import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const DonorDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome, {user?.name}!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary-500">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Explore Campaigns</h2>
                    <p className="text-gray-600 mb-4">Find new causes to support and make an impact today.</p>
                    <Link to="/campaigns" className="text-primary-600 font-medium hover:text-primary-700">Browse Campaigns &rarr;</Link>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">My Donations</h2>
                    <p className="text-gray-600 mb-4">View your donation history and download tax receipts.</p>
                    <Link to="/donations/history" className="text-green-600 font-medium hover:text-green-700">View History &rarr;</Link>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">My Profile</h2>
                    <p className="text-gray-600 mb-4">Update your personal information and preferences.</p>
                    <Link to="/profile" className="text-yellow-600 font-medium hover:text-yellow-700">Edit Profile &rarr;</Link>
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;
