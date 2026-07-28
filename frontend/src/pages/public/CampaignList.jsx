import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                // Normally you might use the global search endpoint or a specific campaigns list endpoint.
                // Assuming /campaigns returns all approved campaigns for public view.
                const response = await api.get('/campaigns');
                setCampaigns(response.data);
            } catch (error) {
                console.error("Error fetching campaigns", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter(c => c.title.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Explore Campaigns</h2>
                <p className="mt-4 text-xl text-gray-500">Find a cause you care about and make a difference.</p>
            </div>

            <div className="mb-8 flex justify-center">
                <input
                    type="text"
                    placeholder="Search campaigns..."
                    className="w-full max-w-lg px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center"><div className="animate-pulse h-32 w-full bg-gray-200 rounded-md"></div></div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No campaigns found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCampaigns.map(campaign => (
                        <div key={campaign.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
                            {/* Assuming gallery returns first image or there's a placeholder */}
                            <div className="h-48 bg-gray-200">
                                {campaign.gallery && campaign.gallery[0] ? (
                                    <img src={`http://localhost:5000${campaign.gallery[0]}`} alt={campaign.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{campaign.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{campaign.description}</p>
                                
                                <div className="mt-auto">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold text-primary-600">${campaign.current_amount} raised</span>
                                        <span className="text-gray-500">Goal: ${campaign.target_amount}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min(100, (campaign.current_amount / campaign.target_amount) * 100)}%` }}></div>
                                    </div>
                                    <Link to={`/campaigns/${campaign.id}`} className="block w-full text-center bg-primary-50 border border-primary-500 text-primary-700 hover:bg-primary-100 font-medium py-2 rounded-md transition-colors">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampaignList;
