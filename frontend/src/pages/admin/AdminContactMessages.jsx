import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await api.get('/contact');
                setMessages(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch contact messages.');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading messages...</div>;
    if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Contact Messages</h1>
            
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                {messages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">No messages found.</div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {messages.map((msg) => (
                            <li key={msg.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-primary-600 truncate">{msg.name}</p>
                                        <div className="ml-2 shrink-0 flex">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                                                {new Date(msg.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex flex-col">
                                            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                ✉️ {msg.email}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminContactMessages;
