import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const DashboardRouter = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    switch (user.role) {
        case 'admin':
            return <Navigate to="/admin/dashboard" replace />;
        case 'ngo':
            return <Navigate to="/ngo/dashboard" replace />;
        case 'volunteer':
            return <Navigate to="/volunteer/dashboard" replace />;
        case 'beneficiary':
            return <Navigate to="/beneficiary/dashboard" replace />;
        case 'donor':
            return <Navigate to="/donor/dashboard" replace />;
        default:
            return <Navigate to="/unauthorized" replace />;
    }
};

export default DashboardRouter;
