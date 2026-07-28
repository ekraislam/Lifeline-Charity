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
import AdminCampaignApproval from './pages/campaign/AdminCampaignApproval';
import Donate from './pages/donation/Donate';
import DonationHistory from './pages/donation/DonationHistory';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';

// Layouts (will be implemented later)
const MainLayout = ({ children }) => <div className="min-h-screen flex flex-col"><main className="flex-grow">{children}</main></div>;

// Placeholder Pages (will be implemented in later steps)
const Dashboard = () => <div className="p-8">Dashboard</div>;
const Unauthorized = () => <div className="p-8 text-red-500">Unauthorized</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/campaigns/create" element={<CreateCampaign />} />
              <Route path="/admin/campaigns" element={<AdminCampaignApproval />} />
              <Route path="/campaigns/:id/donate" element={<Donate />} />
              <Route path="/donations/history" element={<DonationHistory />} />
              <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
