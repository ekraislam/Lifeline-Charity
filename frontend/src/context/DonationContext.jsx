import React, { createContext, useState, useContext } from 'react';
import DonateModal from '../components/donation/DonateModal';

const DonationContext = createContext(null);

export const DonationProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const openDonationModal = (campaign) => {
        setSelectedCampaign(campaign);
        setIsOpen(true);
    };

    const closeDonationModal = () => {
        setIsOpen(false);
        setSelectedCampaign(null);
    };

    return (
        <DonationContext.Provider value={{ openDonationModal, closeDonationModal, isOpen, selectedCampaign }}>
            {children}
            {isOpen && (
                <DonateModal
                    isOpen={isOpen}
                    onClose={closeDonationModal}
                    campaignProp={selectedCampaign}
                />
            )}
        </DonationContext.Provider>
    );
};

export const useDonation = () => {
    const context = useContext(DonationContext);
    if (!context) {
        throw new Error('useDonation must be used within a DonationProvider');
    }
    return context;
};

export default DonationContext;
