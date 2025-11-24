import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, LogOut, User, Crown, LayoutDashboard, History, ScanLine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const getPlanBadge = () => {
    if (user?.role === 'system_admin' || user?.role === 'tenant_admin') {
      return { label: 'Admin', color: 'text-accent', icon: Crown };
    }
    return { label: 'Basic', color: 'text-text-muted', icon: User };
  };

  const plan = getPlanBadge();
  const PlanIcon = plan.icon;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <Shield className="h-8 w-8 text-accent group-hover:scale-110 transition-transform duration-200" />
              <span className="text-xl font-bold text-primary tracking-tight">VeriScan</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-1">
                    <Link
                      to="/dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard') || isActive('/quick-scan') ? 'text-accent bg-blue-50' : 'text-text-muted hover:text-primary hover:bg-gray-50'}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/history"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/history') ? 'text-accent bg-blue-50' : 'text-text-muted hover:text-primary hover:bg-gray-50'}`}
                    >
                      History
                    </Link>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <Crown size={16} />
                      Admin Panel
                    </Link>
                  )}

                  {/* User Profile Dropdown Trigger (Simplified as direct info for now) */}
                  <div className="flex items-center gap-4 pl-6 border-l border-border">
                    <div className="text-right hidden lg:block">
                      <div className="text-sm font-semibold text-primary">{user?.fullName || 'User'}</div>
                      <div className={`text-xs flex items-center justify-end gap-1 ${plan.color}`}>
                        <PlanIcon size={12} />
                        {plan.label}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-full text-text-muted hover:text-danger hover:bg-red-50 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary py-2 px-4 text-sm">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-text-muted hover:text-primary hover:bg-gray-100 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-surface border-b border-border animate-fade-in">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-background rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold text-lg">
                      {user?.fullName?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-primary">{user?.fullName}</div>
                      <div className={`text-xs flex items-center gap-1 ${plan.color}`}>
                        <PlanIcon size={12} />
                        {plan.label}
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-text-main hover:bg-gray-50 hover:text-accent"
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-text-main hover:bg-gray-50 hover:text-accent"
                  >
                    <History size={20} />
                    Scan History
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-white bg-gradient-to-r from-blue-500 to-emerald-500 shadow-md my-2"
                    >
                      <Crown size={20} />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-danger hover:bg-red-50 transition-colors mt-2"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-lg border border-border text-text-main font-medium hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-light shadow-lg shadow-blue-500/20"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} VeriScan. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
