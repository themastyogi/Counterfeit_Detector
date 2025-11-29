import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import QuickScan from './pages/QuickScan';
import ScanResult from './pages/ScanResult';
import ScanHistory from './pages/ScanHistory';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import ReferenceManagement from './pages/ReferenceManagement';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import UserProfile from './pages/UserProfile';
import FixRole from './pages/FixRole';
import TestRulesManagement from './pages/TestRulesManagement';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* Public Pages */}
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="fix-role" element={<FixRole />} />

          {/* Protected Routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <QuickScan />
              </ProtectedRoute>
            }
          />
          <Route
            path="quick-scan"
            element={
              <ProtectedRoute>
                <QuickScan />
              </ProtectedRoute>
            }
          />
          <Route
            path="scan-result"
            element={
              <ProtectedRoute>
                <ScanResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="history"
            element={
              <ProtectedRoute>
                <ScanHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="references"
            element={
              <ProtectedRoute>
                <ReferenceManagement />
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="test-rules"
            element={
              <ProtectedRoute adminOnly>
                <TestRulesManagement />
              </ProtectedRoute>
            }
          />

        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
