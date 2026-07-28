import React from 'react';

export const About = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">About Lifeline</h1>
        <p className="text-lg text-gray-700">Lifeline is a comprehensive platform connecting donors, NGOs, and volunteers to make a meaningful impact in communities worldwide.</p>
    </div>
);

export const Contact = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <form className="max-w-lg space-y-4">
            <input type="text" placeholder="Name" className="w-full border border-gray-300 p-2 rounded" />
            <input type="email" placeholder="Email" className="w-full border border-gray-300 p-2 rounded" />
            <textarea placeholder="Message" className="w-full border border-gray-300 p-2 rounded h-32"></textarea>
            <button className="bg-primary-600 text-white px-4 py-2 rounded">Send Message</button>
        </form>
    </div>
);

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
