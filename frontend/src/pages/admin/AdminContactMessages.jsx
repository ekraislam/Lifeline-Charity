import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const AdminContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/contact/${id}`);
            setMessages(messages.filter((msg) => msg.id !== id));
        } catch (err) {
            console.error('Delete message error:', err);
            alert('Failed to delete the message.');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading messages...</div>;
    if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Messages</h1>
                <span className="text-sm font-semibold px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 rounded-full">
                    {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
                </span>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {messages.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">No messages found.</div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {messages.map((msg) => (
                            <li key={msg.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-base font-bold text-gray-900 dark:text-white">{msg.name}</p>
                                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                                                {new Date(msg.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center gap-1.5 mb-2">
                                            <span>✉️</span>
                                            <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                            {msg.message}
                                        </p>
                                    </div>
                                    <div className="shrink-0 self-start sm:self-center">
                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            disabled={deletingId === msg.id}
                                            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span>{deletingId === msg.id ? 'Deleting...' : 'Delete'}</span>
                                        </button>
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
