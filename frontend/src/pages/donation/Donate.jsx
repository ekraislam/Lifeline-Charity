import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios?v=1';
import DonateModal from '../../components/donation/DonateModal';
import { useLanguage } from '../../context/LanguageContext';

const Donate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await api.get(`/campaigns/${id}`);
                setCampaign(response.data);
            } catch (error) {
                console.error("Error fetching campaign details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id]);

    if (loading) {
        return <div className="p-12 text-center text-gray-500 font-medium">Loading campaign details...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
            <DonateModal
                isOpen={true}
                onClose={() => navigate(`/campaigns/${id}`)}
                campaignProp={campaign}
            />
        </div>
    );
};

export default Donate;
