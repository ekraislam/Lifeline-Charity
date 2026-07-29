import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const CampaignDetail = () => {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampaignAndRecommendations = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch the specific campaign details
                const response = await api.get(`/campaigns/${id}`);
                const campaignData = response.data;
                setCampaign(campaignData);

                // Fetch recommendations of the same category
                const allRes = await api.get('/campaigns');
                const recommendedList = allRes.data
                    .filter(c => c.id !== campaignData.id && c.category_id === campaignData.category_id)
                    .slice(0, 3);
                setRecommendations(recommendedList);
            } catch (err) {
                console.error("Error fetching campaign details", err);
                setError(err.response?.data?.message || "Error fetching campaign details.");
            } finally {
                setLoading(false);
            }
        };
        fetchCampaignAndRecommendations();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="animate-pulse h-96 bg-gray-200 rounded-md mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="animate-pulse h-48 bg-gray-200 rounded-md"></div>
                    <div className="animate-pulse h-48 bg-gray-200 rounded-md"></div>
                    <div className="animate-pulse h-48 bg-gray-200 rounded-md"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500 font-medium">{error}</div>;
    }

    if (!campaign) {
        return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Campaign not found.</div>;
    }

    const progress = Math.min(100, (parseFloat(campaign.raised_amount || 0) / parseFloat(campaign.goal_amount || 1)) * 100);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 mb-16">
                {/* Image Gallery */}
                <div>
                    <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                        {campaign.gallery && campaign.gallery[0] ? (
                            <img src={`http://localhost:5000${campaign.gallery[0]}`} alt={campaign.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
                        )}
                    </div>
                    {campaign.gallery && campaign.gallery.length > 1 && (
                        <div className="mt-4 grid grid-cols-4 gap-2">
                            {campaign.gallery.slice(1).map((img, idx) => (
                                <img key={idx} src={`http://localhost:5000${img}`} className="h-20 w-full object-cover rounded-md" alt={`Gallery ${idx}`} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="mt-8 lg:mt-0">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{campaign.title}</h1>
                    <div className="mt-4 border-t border-b border-gray-200 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold text-primary-600">${parseFloat(campaign.raised_amount || 0).toLocaleString()}</p>
                                <p className="text-sm text-gray-500">raised of ${parseFloat(campaign.goal_amount || 0).toLocaleString()} goal</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 capitalize">{campaign.status}</p>
                                <p className="text-sm text-gray-500">Status</p>
                            </div>
                        </div>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-primary-600 h-3 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900">About this campaign</h3>
                        <div className="mt-2 prose prose-sm text-gray-500">
                            <p>{campaign.description}</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        {campaign.status === 'approved' ? (
                            <Link to={`/campaigns/${campaign.id}/donate`} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                Donate Now
                            </Link>
                        ) : (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-center font-medium">
                                This campaign is currently {campaign.status}. Donations are disabled.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="border-t border-gray-200 pt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Campaigns</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {recommendations.map(item => (
                            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform hover:-translate-y-1 border border-gray-100">
                                <div className="h-48 bg-gray-200">
                                    {item.gallery && item.gallery[0] ? (
                                        <img src={`http://localhost:5000${item.gallery[0]}`} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={item.title}>{item.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                                    
                                    <div className="mt-auto">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-primary-600">${parseFloat(item.raised_amount || 0).toLocaleString()} raised</span>
                                            <span className="text-gray-500">Goal: ${parseFloat(item.goal_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                                            <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (parseFloat(item.raised_amount || 0) / parseFloat(item.goal_amount || 1)) * 100)}%` }}></div>
                                        </div>
                                        <Link to={`/campaigns/${item.id}`} className="block w-full text-center bg-primary-50 border border-primary-500 text-primary-700 hover:bg-primary-100 font-medium py-1.5 rounded-md text-sm transition-colors">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignDetail;
