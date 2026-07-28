import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts (will be implemented later)
const MainLayout = ({ children }) => <div className="min-h-screen flex flex-col"><main className="flex-grow">{children}</main></div>;

// Placeholder Pages (will be implemented in later steps)
const Home = () => <div className="p-8">Home Page</div>;
const Login = () => <div className="p-8">Login Page</div>;
const Register = () => <div className="p-8">Register Page</div>;
const Dashboard = () => <div className="p-8">Dashboard</div>;
const Unauthorized = () => <div className="p-8 text-red-500">Unauthorized</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
