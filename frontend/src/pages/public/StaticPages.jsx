import React, { useState } from 'react';
import api from '../../api/axios';

export const About = () => (
    <div className="bg-white">
        {/* Hero Section */}
        <div className="bg-primary-50 py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight mb-6">Our Story</h1>
                <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
                    Lifeline was founded on a simple yet profound belief: that everyone has the power to make a difference.
                    What started as a small community initiative has grown into a global platform bridging the gap between those who want to help and those who need it most.
                    We are dedicated to building a transparent, efficient, and compassionate ecosystem for philanthropy.
                </p>
            </div>
        </div>

        {/* Mission & Vision */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="text-primary-600 text-4xl mb-4">🎯</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                    <p className="text-gray-600 leading-relaxed">
                        To empower individuals, NGOs, and volunteers by providing a seamless, transparent platform that maximizes the impact of charitable giving. We strive to connect resources with real-world needs, ensuring that every act of kindness reaches its intended destination.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="text-primary-600 text-4xl mb-4">👁️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                    <p className="text-gray-600 leading-relaxed">
                        To create a world where geographical boundaries and logistical hurdles no longer stand in the way of human compassion. We envision a future where technology amplifies empathy, creating resilient communities and a fairer world for everyone.
                    </p>
                </div>
            </div>
        </div>

        {/* What We Do */}
        <div className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900">What We Do</h2>
                    <p className="mt-4 text-lg text-gray-500">A holistic approach to making a difference.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-6">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl mb-6">💝</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Transparent Crowdfunding</h3>
                        <p className="text-gray-600">We host vetted campaigns, allowing donors to fund causes with complete confidence and real-time tracking.</p>
                    </div>
                    <div className="text-center p-6">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl mb-6">🤝</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">NGO Partnerships</h3>
                        <p className="text-gray-600">We provide non-profits with the digital tools they need to manage events, volunteers, and beneficiary requests efficiently.</p>
                    </div>
                    <div className="text-center p-6">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl mb-6">🙋</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Volunteer Mobilization</h3>
                        <p className="text-gray-600">We connect passionate individuals with local community service events, tracking hours and awarding certificates.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Core Values & Why Choose Us */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Our Core Values</h2>
                    <div className="space-y-6">
                        <div className="flex">
                            <div className="flex-shrink-0"><span className="text-green-500 text-xl">✓</span></div>
                            <div className="ml-4">
                                <h4 className="text-lg font-bold text-gray-900">Transparency</h4>
                                <p className="mt-1 text-gray-600">Every donation is tracked, and every NGO is heavily vetted to ensure your contributions make a real impact.</p>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="flex-shrink-0"><span className="text-green-500 text-xl">✓</span></div>
                            <div className="ml-4">
                                <h4 className="text-lg font-bold text-gray-900">Compassion</h4>
                                <p className="mt-1 text-gray-600">Empathy drives everything we do. We put the needs of our beneficiaries first.</p>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="flex-shrink-0"><span className="text-green-500 text-xl">✓</span></div>
                            <div className="ml-4">
                                <h4 className="text-lg font-bold text-gray-900">Innovation</h4>
                                <p className="mt-1 text-gray-600">We leverage modern technology to reduce overhead and maximize the efficiency of charitable work.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Why Choose Lifeline?</h2>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        Unlike traditional charities, Lifeline is an end-to-end ecosystem. We don't just collect donations; we actively manage the lifecycle of philanthropy. From the moment a beneficiary requests help, to an NGO adopting their case, to a volunteer dedicating their time, and a donor funding the initiative—everything happens in one unified, secure platform.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        We believe that when good intentions are backed by great technology, there is no limit to what we can achieve together.
                    </p>
                </div>
            </div>
        </div>

        {/* Our Impact */}
        <div className="bg-primary-600 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold text-white mb-12">Our Impact So Far</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <div className="text-4xl font-extrabold text-white mb-2">500+</div>
                        <div className="text-primary-100 font-medium">Verified NGOs</div>
                    </div>
                    <div>
                        <div className="text-4xl font-extrabold text-white mb-2">$2M+</div>
                        <div className="text-primary-100 font-medium">Donations Raised</div>
                    </div>
                    <div>
                        <div className="text-4xl font-extrabold text-white mb-2">10k+</div>
                        <div className="text-primary-100 font-medium">Active Volunteers</div>
                    </div>
                    <div>
                        <div className="text-4xl font-extrabold text-white mb-2">50k+</div>
                        <div className="text-primary-100 font-medium">Lives Impacted</div>
                    </div>
                </div>
            </div>
        </div>

        {/* CTA */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Ready to make a difference?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of others who are already making a positive impact on the world.
                Whether you want to donate, volunteer, or partner with us, there is a place for you here.
            </p>
            <div className="flex justify-center gap-4">
                <a href="/register" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition shadow-sm">
                    Join Lifeline
                </a>
                <a href="/contact" className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm">
                    Contact Us
                </a>
            </div>
        </div>
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
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Contact Us</h1>
                    <p className="mt-2 text-sm text-gray-600">We'd love to hear from you. Send us a message!</p>
                </div>
                {status && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {status.text}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" id="name" name="name" required placeholder="Your name" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="email" name="email" required placeholder="you@example.com" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow" />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea id="message" name="message" required placeholder="How can we help?" className="w-full border border-gray-300 p-3 rounded-lg h-32 resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"></textarea>
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors">
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const Privacy = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">Privacy Policy</h1>
            <p className="mt-4 text-lg text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-blue prose-lg max-w-none text-gray-700 leading-relaxed">
            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Introduction</h2>
                <p>
                    Welcome to the Lifeline Charity platform. We are committed to protecting your personal information and your right to privacy.
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Information We Collect</h2>
                <p className="mb-3">We collect personal information that you voluntarily provide to us when registering on the platform, making a donation, or participating in events. This may include:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Personal Details:</strong> Name, email address, phone number, and physical address.</li>
                    <li><strong>Financial Data:</strong> Payment details (processed securely via our third-party payment providers; we do not store full credit card numbers).</li>
                    <li><strong>Usage Data:</strong> Information about how you interact with our website, such as IP addresses and browser types.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">How We Use Your Information</h2>
                <p className="mb-3">We use the information we collect or receive for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>To facilitate account creation and the login process.</li>
                    <li>To process and manage your donations, applications, and event registrations.</li>
                    <li>To send administrative information to you regarding your account or our policies.</li>
                    <li>To improve our platform and optimize user experience.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Data Protection</h2>
                <p>
                    We implement a variety of security measures to maintain the safety of your personal information.
                    Your data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Information Sharing</h2>
                <p>
                    We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Cookies</h2>
                <p>
                    We use cookies and similar tracking technologies to track the activity on our platform and hold certain information.
                    Cookies are files with a small amount of data which may include an anonymous unique identifier.
                    You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">User Rights</h2>
                <p className="mb-3">Depending on your location, you may have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>The right to access, update, or delete the information we have on you.</li>
                    <li>The right of rectification if your information is inaccurate or incomplete.</li>
                    <li>The right to object to our processing of your personal data.</li>
                    <li>The right to withdraw consent at any time where we relied on your consent to process your personal information.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Changes to This Policy</h2>
                <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                    You are advised to review this Privacy Policy periodically for any changes.
                </p>
            </section>

            <section className="mb-10 bg-gray-50 p-8 rounded-xl border border-gray-200 shadow-sm mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="mb-6">If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
                <ul className="list-none space-y-3 font-medium">
                    <li className="flex items-center text-primary-700 hover:text-primary-800 transition">
                        <span className="text-xl mr-3">📧</span>
                        <a href="mailto:privacy@lifelinecharity.org">ekraislam2023@gmail.com</a>
                    </li>
                    <li className="flex items-center text-primary-700">
                        <span className="text-xl mr-3">📞</span> +8801581828741
                    </li>
                    <li className="flex items-center text-primary-700">
                        <span className="text-xl mr-3">🏢</span>Purbachal American City, Kanchan, Rupganj, Narayanganj-1461, Dhaka, Bangladesh
                    </li>
                </ul>
            </section>
        </div>
    </div>
);

export const Terms = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">Terms & Conditions</h1>
            <p className="mt-4 text-lg text-gray-500">Effective Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-blue prose-lg max-w-none text-gray-700 leading-relaxed">
            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">1. Acceptance of Terms</h2>
                <p>
                    By accessing or using the Lifeline Charity platform ("Lifeline", "we", "us", or "our"), you agree to be bound by these Terms & Conditions. If you do not agree to all of the terms and conditions, you must not use our services.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">2. User Accounts</h2>
                <p className="mb-3">When you create an account on our platform (as a Donor, Volunteer, or NGO), you are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Maintaining the confidentiality of your account login information.</li>
                    <li>All activities that occur under your account.</li>
                    <li>Providing accurate, current, and complete information during registration.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">3. Donations & Payments</h2>
                <p className="mb-3">Lifeline facilitates donations to registered NGOs and campaigns.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>All donations are processed securely through authorized third-party payment processors.</li>
                    <li>Donations are generally non-refundable. Refunds are only issued in cases of technical errors or proven fraud.</li>
                    <li>Lifeline does not charge a platform fee to NGOs, but standard payment processing fees apply.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">4. Campaign Guidelines</h2>
                <p>
                    Campaigns can only be created by verified NGOs. All funds raised must be used strictly for the purpose stated in the campaign description. Lifeline reserves the right to suspend any campaign suspected of violating these terms or local laws.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">5. Beneficiary & NGO Responsibilities</h2>
                <p className="mb-3">Organizations partnering with Lifeline must adhere to strict transparency standards:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>NGOs must provide accurate documentation for verification.</li>
                    <li>NGOs must provide regular updates on campaign progress and fund utilization.</li>
                    <li>Beneficiary requests must be genuine and supported by necessary evidence.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">6. Volunteer Responsibilities</h2>
                <p>
                    Volunteers agree to conduct themselves professionally and respectfully during any Lifeline-affiliated events. Hours tracked on the platform must accurately reflect actual time spent volunteering.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">7. Privacy & Data Protection</h2>
                <p>
                    Your privacy is critically important to us. Please review our <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a> to understand how we collect, use, and share your personal information.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">8. Prohibited Activities</h2>
                <p className="mb-3">Users may not:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Use the platform for any illegal or unauthorized purpose.</li>
                    <li>Attempt to hack, destabilize, or adapt the website.</li>
                    <li>Submit false documentation or create fraudulent campaigns.</li>
                    <li>Harass, abuse, or harm another person through our platform.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">9. Limitation of Liability</h2>
                <p>
                    Lifeline serves solely as a platform to connect donors, NGOs, and volunteers. We do not guarantee the absolute accuracy of every campaign, though we vet NGOs rigorously. We shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of our platform.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">10. Account Suspension & Termination</h2>
                <p>
                    We reserve the right to suspend or terminate your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms & Conditions.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">11. Changes to Terms</h2>
                <p>
                    We reserve the right to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. Your continued use of the platform constitutes acceptance of the new terms.
                </p>
            </section>

            <section className="mb-10 bg-gray-50 p-8 rounded-xl border border-gray-200 shadow-sm mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <p className="mb-6">If you have any questions about these Terms & Conditions, please contact us:</p>
                <ul className="list-none space-y-3 font-medium">
                    <li className="flex items-center text-primary-700 hover:text-primary-800 transition">
                        <span className="text-xl mr-3">📧</span>
                        <a href="mailto:terms@lifelinecharity.org">towfiq@gmail.com</a>
                    </li>
                    <li className="flex items-center text-primary-700">
                        <span className="text-xl mr-3">📞</span> +8801581828741
                    </li>
                    <li className="flex items-center text-primary-700">
                        <span className="text-xl mr-3">🏢</span> Purbachal American City, Kanchan, Rupganj, Narayanganj-1461, Dhaka, Bangladesh
                    </li>
                </ul>
            </section>
        </div>
    </div>
);

export const FAQ = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState(null);

    const faqData = [
        {
            category: "Donations",
            items: [
                { q: "How do I make a donation?", a: "You can donate by navigating to any active campaign and clicking the 'Donate Now' button. We accept major credit cards and other secure payment methods." },
                { q: "Is my donation tax-deductible?", a: "Depending on your location and the NGO's status, your donation may be tax-deductible. A receipt will be sent to your email after a successful transaction." },
            ]
        },
        {
            category: "Campaigns",
            items: [
                { q: "How are campaigns verified?", a: "All campaigns are created by registered NGOs and undergo a strict verification process by our admin team before they go live on the platform." },
                { q: "Can I share a campaign?", a: "Yes! Every campaign page has social sharing buttons so you can help spread the word and increase the impact." },
            ]
        },
        {
            category: "Beneficiary Applications",
            items: [
                { q: "Who can apply as a beneficiary?", a: "Individuals in need of urgent assistance can submit a help request. These requests are reviewed by registered NGOs who can adopt and fund them." },
                { q: "How long does it take for an application to be approved?", a: "The review process typically takes 3-5 business days depending on the volume of requests and the verification of documents." },
            ]
        },
        {
            category: "NGO Registration",
            items: [
                { q: "How can my NGO join Lifeline?", a: "You can sign up as an NGO from the registration page. You will need to provide official registration documents for verification." },
                { q: "Are there any fees for NGOs?", a: "Lifeline is completely free for registered NGOs. We only deduct standard payment gateway processing fees for donations." },
            ]
        },
        {
            category: "Volunteer Registration",
            items: [
                { q: "How do I become a volunteer?", a: "Create an account and select the 'Volunteer' role. Once registered, you can browse and apply for local events hosted by our NGO partners." },
                { q: "Do I get a certificate for volunteering?", a: "Yes! After completing your assigned tasks and logging your hours, you can download an official Certificate of Appreciation from your dashboard." },
            ]
        },
        {
            category: "Account & Login",
            items: [
                { q: "I forgot my password, what should I do?", a: "Click on the 'Forgot Password' link on the login page and enter your registered email address to receive a password reset link." },
                { q: "Can I change my account role?", a: "Once an account is created, the primary role (e.g., Donor, NGO) cannot be changed directly. Please contact support if you registered with the wrong role." },
            ]
        },
        {
            category: "Payment Security",
            items: [
                { q: "Is my payment information secure?", a: "Absolutely. We use industry-standard encryption and partner with secure payment gateways (like Stripe/PayPal). We never store your full card details on our servers." },
            ]
        },
        {
            category: "Contact & Support",
            items: [
                { q: "How can I contact customer support?", a: "You can reach out to us via the Contact Us page, or email us directly at support@lifelinecharity.org." },
            ]
        }
    ];

    const filteredFaqs = faqData.map(category => {
        const filteredItems = category.items.filter(item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...category, items: filteredItems };
    }).filter(category => category.items.length > 0);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight mb-4">How can we help?</h1>
                <p className="text-lg text-gray-500 mb-8">Search our knowledge base or browse categories below to find answers to your questions.</p>

                <div className="max-w-xl mx-auto relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-xl">🔍</span>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-lg shadow-sm transition"
                        placeholder="Search for answers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-12">
                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((category, catIndex) => (
                        <div key={catIndex} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">{category.category}</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {category.items.map((item, itemIndex) => {
                                    const globalIndex = `${catIndex}-${itemIndex}`;
                                    const isOpen = openIndex === globalIndex;
                                    return (
                                        <div key={globalIndex} className="bg-white">
                                            <button
                                                onClick={() => toggleAccordion(globalIndex)}
                                                className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none focus:bg-gray-50 hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-medium text-gray-900 pr-4">{item.q}</span>
                                                <span className={`transform transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </span>
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-5 text-gray-600 animate-fadeIn">
                                                    <p className="leading-relaxed">{item.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <span className="text-4xl mb-4 block">😕</span>
                        <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                        <p className="mt-1 text-gray-500">Try adjusting your search terms or browse the categories.</p>
                    </div>
                )}
            </div>

            <div className="mt-16 bg-primary-50 rounded-2xl p-8 text-center border border-primary-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h3>
                <p className="text-gray-600 mb-6">If you couldn't find the answer to your question, our support team is ready to help.</p>
                <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm">
                    Contact Support
                </a>
            </div>
        </div>
    );
};

export const NotFound = () => (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600">Page not found.</p>
    </div>
);
