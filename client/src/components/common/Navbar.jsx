import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

/**
 * Navbar — Role-aware top navigation.
 * Shows different links based on the user's role.
 * Collapses to a hamburger menu on mobile.
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'officer') return '/officer/dashboard';
    return '/dashboard';
  };

  const roleBadgeColors = {
    owner:   'bg-indigo-100 text-indigo-700',
    finder:  'bg-emerald-100 text-emerald-700',
    officer: 'bg-amber-100 text-amber-800',
    admin:   'bg-rose-100 text-rose-700',
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TT</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">TagTrack</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink
              to="/scan"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              🔍 Find Item
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to={getDashboardLink()}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  Dashboard
                </NavLink>

                {/* Role Badge + User name */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                    roleBadgeColors[user.role] || 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                  <span className="text-sm text-gray-700 font-medium">{user.name?.split(' ')[0]}</span>
                </div>

                <button onClick={handleLogout} className="btn-secondary text-xs py-1.5">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          <Link
            to="/scan"
            className="block py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
            onClick={() => setMobileOpen(false)}
          >
            🔍 Find Item
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                className="block py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <div className="py-2 flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                  roleBadgeColors[user.role] || 'bg-gray-100'
                }`}>
                  {user.role}
                </span>
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="w-full btn-secondary text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full text-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
