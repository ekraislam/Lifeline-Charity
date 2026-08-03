import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api/axios';

let socketInstance = null;

const getSocket = () => {
    if (!socketInstance) {
        try {
            socketInstance = io(API_BASE_URL, {
                transports: ['websocket', 'polling'],
                withCredentials: true,
                autoConnect: true
            });
        } catch (e) {
            console.warn("Socket.io client initialization warning:", e);
        }
    }
    return socketInstance;
};


export const broadcastLocalCampaignUpdate = (detailData) => {
    try {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lifeline_campaign_updated', { detail: detailData }));
        }
    } catch (e) {
        console.warn("Local broadcast warning:", e);
    }
};

export const useCampaignRealtime = (onUpdate) => {
    const onUpdateRef = useRef(onUpdate);

    useEffect(() => {
        onUpdateRef.current = onUpdate;
    });

    useEffect(() => {
        const handleCampaignUpdated = (data) => {
            try {
                if (typeof onUpdateRef.current === 'function') {
                    onUpdateRef.current({ type: 'campaign_updated', ...data });
                }
            } catch (e) {}
        };

        const handleDonationSuccess = (data) => {
            try {
                if (typeof onUpdateRef.current === 'function') {
                    onUpdateRef.current({ type: 'donation_success', ...data });
                }
            } catch (e) {}
        };

        const handleLocalCustomEvent = (event) => {
            try {
                if (typeof onUpdateRef.current === 'function') {
                    onUpdateRef.current({ type: 'local_custom_event', ...(event?.detail || {}) });
                }
            } catch (e) {}
        };

        // Attach socket listeners safely
        try {
            const socket = getSocket();
            if (socket) {
                socket.on('campaign_updated', handleCampaignUpdated);
                socket.on('donation_success', handleDonationSuccess);
            }
        } catch (err) {
            console.warn("Socket event binding warning:", err);
        }

        // Attach local window listener
        if (typeof window !== 'undefined') {
            window.addEventListener('lifeline_campaign_updated', handleLocalCustomEvent);
        }

        return () => {
            try {
                const socket = getSocket();
                if (socket) {
                    socket.off('campaign_updated', handleCampaignUpdated);
                    socket.off('donation_success', handleDonationSuccess);
                }
            } catch (e) {}
            if (typeof window !== 'undefined') {
                window.removeEventListener('lifeline_campaign_updated', handleLocalCustomEvent);
            }
        };
    }, []);
};

export default useCampaignRealtime;
