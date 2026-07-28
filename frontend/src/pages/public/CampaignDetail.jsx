import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const CampaignDetail = () => {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await api.get(`/campaigns/${id}`);
                setCampaign(response.data);
            } catch (error) {
                console.error("Error fetching campaign details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id]);

    if (loading) {
        return <div className="max-w-7xl mx-auto px-4 py-12"><div className="animate-pulse h-64 bg-gray-200 rounded-md"></div></div>;
    }

    if (!campaign) {
        return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Campaign not found.</div>;
    }

    const progress = Math.min(100, (campaign.current_amount / campaign.target_amount) * 100);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
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
                                <p className="text-3xl font-bold text-primary-600">${campaign.current_amount}</p>
                                <p className="text-sm text-gray-500">raised of ${campaign.target_amount} goal</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{campaign.status}</p>
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
                        <Link to={`/campaigns/${campaign.id}/donate`} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Donate Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
