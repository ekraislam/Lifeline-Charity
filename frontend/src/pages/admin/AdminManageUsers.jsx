import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const AdminManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data || []);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        setActionLoading(id);
        const newStatus = currentStatus === 1 ? 0 : 1;
        try {
            await api.put(`/admin/users/${id}/status`, { isActive: newStatus });
            // Update local state
            setUsers(users.map(u => u.id === id ? { ...u, is_active: newStatus } : u));
        } catch (error) {
            console.error(`Error updating user status`, error);
            alert(`Failed to update user status`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading users...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manage Users</h1>

            {users.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
                    No users found.
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <li key={user.id}>
                                <div className="px-4 py-4 flex items-center sm:px-6 justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex text-sm">
                                            <p className="font-medium text-primary-600 truncate">{user.name}</p>
                                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500 dark:text-gray-400">
                                                - {user.email}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                                                <span className="capitalize bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                                                    {user.role}
                                                </span>
                                                <span className={`${user.is_active ? 'text-green-600' : 'text-red-600'} font-medium`}>
                                                    {user.is_active ? 'Active' : 'Blocked'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 flex">
                                        <button
                                            onClick={() => handleToggleStatus(user.id, user.is_active)}
                                            disabled={actionLoading === user.id}
                                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${user.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} focus:outline-none`}
                                        >
                                            {actionLoading === user.id ? 'Processing...' : user.is_active ? 'Block User' : 'Unblock User'}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdminManageUsers;
