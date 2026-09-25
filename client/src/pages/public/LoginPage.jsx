import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { loginUser } from '../../api/authApi';

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect already-logged-in users
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardRoutes = {
        admin: '/admin/dashboard',
        officer: '/officer/dashboard',
        owner: '/dashboard',
        finder: '/dashboard',
      };
      navigate(dashboardRoutes[user.role] || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email.trim()))
      newErrors.email = 'Please enter a valid email';
    if (!form.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const data = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });
      login(data.data.token, data.data.user);
      toast.success(`Welcome back, ${data.data.user.name?.split(' ')[0]}!`);

      // Redirect to the page they were trying to access, or role dashboard
      const from = location.state?.from?.pathname;
      const dashboardRoutes = {
        admin: '/admin/dashboard',
        officer: '/officer/dashboard',
        owner: '/dashboard',
        finder: '/dashboard',
      };
      navigate(from || dashboardRoutes[data.data.user.role] || '/dashboard', { replace: true });
    } catch (error) {
      if (!error.response) {
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          toast.error('Unable to connect to server. Please verify backend is running on port 5000.');
        } else {
          toast.error(error.message || 'Network error occurred. Please try again.');
        }
        return;
      }

      const status = error.response.status;
      const data = error.response.data;

      // Extract specific backend error message
      let msg = 'Login failed. Please try again.';
      if (typeof data === 'string') {
        msg = data.includes('ECONNREFUSED')
          ? 'Backend server is unreachable. Please ensure server is running.'
          : 'Server returned an error. Please try again.';
      } else if (data?.message) {
        msg = data.message;
      } else if (status === 401) {
        msg = 'Invalid email or password.';
      } else if (status === 429) {
        msg = 'Too many attempts. Please wait a moment before trying again.';
      }

      const fieldErrors = data?.errors || [];
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        const mapped = {};
        fieldErrors.forEach((e) => {
          if (e.field) mapped[e.field] = e.message;
        });
        setErrors(mapped);
        toast.error(fieldErrors[0]?.message || msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] bg-[#F8F7FF] text-[#18151F] flex items-center justify-center px-4 py-12 page-transition">

      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#EC4899]/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-md animate-slide-up">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#A855F7] to-[#EC4899] p-[1.5px] shadow-[0_4px_14px_rgba(139,92,246,0.3)] group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-sm">
                  TT
                </span>
              </div>
            </div>
            <span className="font-extrabold text-xl text-[#18151F]">
              Tag<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]">Track</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18151F] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-[#5B5568] text-sm mt-1 font-normal">
            Sign in to access your digital tags and recovery dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-[24px] p-8 sm:p-10 bg-white border border-[#E9DFFF] shadow-soft-lg transition-all duration-300">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#5B5568] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#F43F5E] flex items-center gap-1 font-medium">
                  <span>⚠️</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#5B5568] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B5CF6] hover:text-[#EC4899] transition-colors p-1 text-sm focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-[#F43F5E] flex items-center gap-1 font-medium">
                  <span>⚠️</span> {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-sm font-bold mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In to Account →'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E9DFFF] text-center text-xs text-[#5B5568]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#8B5CF6] hover:text-[#EC4899] transition-colors">
              Create one for free
            </Link>
          </div>
        </div>

        {/* Public Finder Quick Action */}
        <div className="mt-6 text-center">
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B5568] hover:text-[#8B5CF6] transition-colors py-1.5 px-3 rounded-lg hover:bg-white"
          >
            <span>🔍 Found someone's item?</span>
            <span className="text-[#8B5CF6] underline">Report it here</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
