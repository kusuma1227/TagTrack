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
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email))
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
      const data = await loginUser(form);
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
      const msg = error.response?.data?.message || 'Login failed. Please try again.';
      const fieldErrors = error.response?.data?.errors || [];
      if (fieldErrors.length > 0) {
        const mapped = {};
        fieldErrors.forEach((e) => { mapped[e.field] = e.message; });
        setErrors(mapped);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">TT</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TagTrack</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your TagTrack account</p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
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
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full py-3 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create one
            </Link>
          </p>
        </div>

        {/* Guest finder link */}
        <p className="mt-4 text-center text-sm text-gray-500">
          Found someone's item?{' '}
          <Link to="/scan" className="text-indigo-600 hover:underline font-medium">
            Report it here →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
