import React, { useState } from 'react';
import api from '../../api/axios';

export const About = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">About Lifeline</h1>
        <p className="text-lg text-gray-700">Lifeline is a comprehensive platform connecting donors, NGOs, and volunteers to make a meaningful impact in communities worldwide.</p>
    </div>
);

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
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
            {status && (
                <div className={`mb-4 p-3 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status.text}
                </div>
            )}
            <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
                <input type="text" name="name" required placeholder="Name" className="w-full border border-gray-300 p-2 rounded focus:ring-primary-500 focus:border-primary-500 outline-none" />
                <input type="email" name="email" required placeholder="Email" className="w-full border border-gray-300 p-2 rounded focus:ring-primary-500 focus:border-primary-500 outline-none" />
                <textarea name="message" required placeholder="Message" className="w-full border border-gray-300 p-2 rounded h-32 focus:ring-primary-500 focus:border-primary-500 outline-none"></textarea>
                <button type="submit" disabled={loading} className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-primary-700 transition">
                    {loading ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    );
};

export const Privacy = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-700">Your privacy is important to us. This policy outlines how we handle your data...</p>
    </div>
);

export const Terms = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
        <p className="text-gray-700">By using Lifeline, you agree to the following terms and conditions...</p>
    </div>
);

export const FAQ = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
        <div className="space-y-4">
            <div>
                <h3 className="font-bold">How do I donate?</h3>
                <p className="text-gray-700">Navigate to a campaign and click 'Donate Now'.</p>
            </div>
            <div>
                <h3 className="font-bold">Is my donation tax deductible?</h3>
                <p className="text-gray-700">Depending on the NGO, you may receive a tax-deductible receipt.</p>
            </div>
        </div>
    </div>
);

export const NotFound = () => (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600">Page not found.</p>
    </div>
);
