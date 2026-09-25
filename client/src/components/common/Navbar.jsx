import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

/**
 * Navbar — Clean, Modern, Light & Colorful Theme
 * - Crisp white surface with subtle lavender border & soft shadow
 * - Violet/Pink gradient branding & CTA
 * - Smooth role-aware navigation
 * - Mobile responsive drawer with entrance transition
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMobileOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'officer') return '/officer/dashboard';
    return '/dashboard';
  };

  const roleBadgeStyles = {
    owner:   'bg-[#EEE7FF] text-[#8B5CF6] border-[#DDD3F5]',
    finder:  'bg-[#FFF4E8] text-[#F97316] border-[#FED7AA]',
    officer: 'bg-[#FFF4E8] text-[#F59E0B] border-[#FED7AA]',
    admin:   'bg-[#FFF0F7] text-[#EC4899] border-[#FBCFE8]',
  };

  const scrollToSection = (id) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E9DFFF] shadow-soft-sm'
          : 'bg-white border-b border-[#E9DFFF]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* ── Brand Logo ─────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 group select-none">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#A855F7] to-[#EC4899] p-[1.5px] shadow-[0_4px_14px_rgba(139,92,246,0.3)] group-hover:shadow-[0_6px_20px_rgba(236,72,153,0.45)] group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-base tracking-wider">
                    TT
                  </span>
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC4899] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EC4899]"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#18151F]">
                Tag<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#EC4899]">Track</span>
              </span>
              <span className="text-[10px] tracking-widest text-[#777080] uppercase font-semibold">
                Smart Recovery
              </span>
            </div>
          </Link>

          {/* ── Desktop Navigation Links ───────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="nav-link"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="nav-link"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="nav-link"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('smart-tag')}
              className="nav-link"
            >
              Smart Tag
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="nav-link"
            >
              About
            </button>

            <NavLink
              to="/scan"
              className={({ isActive }) =>
                `text-sm font-semibold px-4 py-2 rounded-xl border transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#F3EEFF] text-[#8B5CF6] border-[#8B5CF6] shadow-soft-sm'
                    : 'bg-white text-[#5B5568] border-[#DDD3F5] hover:border-[#8B5CF6] hover:text-[#8B5CF6] hover:bg-[#F8F7FF]'
                }`
              }
            >
              🔍 Find Item
            </NavLink>
          </div>

          {/* ── Right Side: Authentication & Dashboard ───────────────────────── */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NavLink
                  to={getDashboardLink()}
                  className={({ isActive }) =>
                    `btn-secondary py-2.5 px-4 text-xs font-semibold ${
                      isActive ? 'border-[#8B5CF6] text-[#8B5CF6] bg-[#F3EEFF]' : ''
                    }`
                  }
                >
                  ⚡ Dashboard
                </NavLink>

                {/* Role Badge + Name */}
                <div className="flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-full bg-[#F8F7FF] border border-[#DDD3F5]">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                      roleBadgeStyles[user.role] || 'bg-[#EEE7FF] text-[#8B5CF6] border-[#DDD3F5]'
                    }`}
                  >
                    {user.role}
                  </span>
                  <span className="text-xs text-[#18151F] font-semibold truncate max-w-[100px]">
                    {user.name?.split(' ')[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium text-[#777080] hover:text-[#F43F5E] hover:bg-[#FFF0F7] rounded-lg border border-transparent hover:border-[#FBCFE8] transition-all duration-200 active:scale-95"
                  title="Log out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-[#5B5568] hover:text-[#18151F] px-4 py-2 rounded-xl hover:bg-[#F3EEFF] transition-all duration-200 active:scale-95"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs py-2.5 px-5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger Button ─────────────────────────────────────── */}
          <button
            className="lg:hidden p-2.5 rounded-xl bg-[#F8F7FF] border border-[#DDD3F5] text-[#5B5568] hover:text-[#18151F] hover:border-[#8B5CF6] transition-all duration-200 active:scale-95"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu ───────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E9DFFF] bg-white px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200 shadow-soft-lg">
          <div className="space-y-2">
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left py-2 text-sm font-semibold text-[#5B5568] hover:text-[#8B5CF6] transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-2 text-sm font-semibold text-[#5B5568] hover:text-[#8B5CF6] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-sm font-semibold text-[#5B5568] hover:text-[#8B5CF6] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('smart-tag')}
              className="block w-full text-left py-2 text-sm font-semibold text-[#5B5568] hover:text-[#8B5CF6] transition-colors"
            >
              Smart QR Tag
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left py-2 text-sm font-semibold text-[#5B5568] hover:text-[#8B5CF6] transition-colors"
            >
              About
            </button>
            <Link
              to="/scan"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-semibold text-[#8B5CF6] hover:text-[#EC4899] transition-colors"
            >
              🔍 Find a Lost Item
            </Link>
          </div>

          <div className="pt-4 border-t border-[#E9DFFF]">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7FF] border border-[#DDD3F5]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${
                        roleBadgeStyles[user.role] || 'bg-[#EEE7FF] text-[#8B5CF6] border-[#DDD3F5]'
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-sm font-bold text-[#18151F]">{user.name}</span>
                  </div>
                </div>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full text-center text-sm py-2.5"
                >
                  ⚡ Open Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-danger w-full text-center text-sm py-2.5"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary text-center text-sm py-2.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-center text-sm py-2.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
