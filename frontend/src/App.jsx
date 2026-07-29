import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/profile/Profile';
import Home from './pages/public/Home';
import CampaignList from './pages/public/CampaignList';
import CampaignDetail from './pages/public/CampaignDetail';
import { About, Contact, Privacy, Terms, FAQ, NotFound } from './pages/public/StaticPages';
import CreateCampaign from './pages/campaign/CreateCampaign';
import Donate from './pages/donation/Donate';
import DonationHistory from './pages/donation/DonationHistory';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import HelpRequest from './pages/beneficiary/HelpRequest';
import BeneficiaryDashboard from './pages/beneficiary/BeneficiaryDashboard';
import EventList from './pages/event/EventList';
import EventDetail from './pages/event/EventDetail';
import NGODashboard from './pages/ngo/NGODashboard';
import NGOBeneficiaryRequests from './pages/ngo/NGOBeneficiaryRequests';
import DashboardRouter from './pages/dashboard/DashboardRouter';
import DonorDashboard from './pages/donor/DonorDashboard';
import MainLayout from './layouts/MainLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManageCampaigns from './pages/admin/AdminManageCampaigns';
import AdminManageUsers from './pages/admin/AdminManageUsers';
import AdminManageNGOs from './pages/admin/AdminManageNGOs';
import AdminVerifyBeneficiary from './pages/admin/AdminVerifyBeneficiary';
import AdminExportReports from './pages/admin/AdminExportReports';
import AdminSystemSettings from './pages/admin/AdminSystemSettings';

const Unauthorized = () => <div className="p-8 text-red-500 text-center">Unauthorized — You do not have permission to view this page.</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/campaigns/create" element={<CreateCampaign />} />
              <Route path="/campaigns/:id/donate" element={<Donate />} />
              <Route path="/donations/history" element={<DonationHistory />} />
              <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
              <Route path="/beneficiary/request" element={<HelpRequest />} />
              <Route path="/beneficiary/dashboard" element={<BeneficiaryDashboard />} />
              <Route path="/ngo/dashboard" element={<NGODashboard />} />
              <Route path="/ngo/beneficiary-requests" element={<NGOBeneficiaryRequests />} />
              <Route path="/donor/dashboard" element={<DonorDashboard />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/campaigns" element={<AdminManageCampaigns />} />
              <Route path="/admin/users" element={<AdminManageUsers />} />
              <Route path="/admin/ngos" element={<AdminManageNGOs />} />
              <Route path="/admin/beneficiaries" element={<AdminVerifyBeneficiary />} />
              <Route path="/admin/reports" element={<AdminExportReports />} />
              <Route path="/admin/settings" element={<AdminSystemSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
