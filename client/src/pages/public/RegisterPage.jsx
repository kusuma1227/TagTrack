import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { registerUser } from '../../api/authApi';

const ROLE_OPTIONS = [
  {
    value: 'owner',
    label: 'Owner',
    desc: 'Register personal valuables & generate digital QR tags',
    icon: '📦',
  },
  {
    value: 'finder',
    label: 'Finder',
    desc: 'Help return found items securely to verified owners',
    icon: '🔍',
  },
];

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'owner',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email.trim()))
      newErrors.email = 'Please enter a valid email';

    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) newErrors.password = 'Must contain at least one uppercase letter';
    else if (!/[0-9]/.test(form.password)) newErrors.password = 'Must contain at least one number';

    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

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
      const data = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      login(data.data.token, data.data.user);
      toast.success('Account created successfully! Welcome to TagTrack.');
      navigate('/dashboard', { replace: true });
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
      let msg = 'Registration failed. Please try again.';
      if (typeof data === 'string') {
        msg = data.includes('ECONNREFUSED')
          ? 'Backend server is unreachable. Please ensure server is running.'
          : 'Server returned an error. Please try again.';
      } else if (data?.message) {
        msg = data.message;
      } else if (status === 409) {
        msg = 'An account with this email already exists.';
      } else if (status === 429) {
        msg = 'Too many attempts. Please wait a moment before trying again.';
      }

      const fieldErrors = data?.errors || [];
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        const mapped = {};
        fieldErrors.forEach((err) => {
          if (err.field) mapped[err.field] = err.message;
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

      <div className="relative z-10 w-full max-w-lg animate-slide-up">

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
            Create Your Account
          </h1>
          <p className="text-[#5B5568] text-sm mt-1 font-normal">
            Start protecting your belongings with smart digital tags
          </p>
        </div>

        {/* Registration Card */}
        <div className="rounded-[24px] p-8 sm:p-10 bg-white border border-[#E9DFFF] shadow-soft-lg transition-all duration-300">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-[#5B5568] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="Alex Morgan"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-[#F43F5E] flex items-center gap-1 font-medium">
                  <span>⚠️</span> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
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
                placeholder="alex@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#F43F5E] flex items-center gap-1 font-medium">
                  <span>⚠️</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#5B5568] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#5B5568] uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`input pr-11 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Re-enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B5CF6] hover:text-[#EC4899] transition-colors p-1 text-sm focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-[#F43F5E] flex items-center gap-1 font-medium">
                  <span>⚠️</span> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-[#5B5568] uppercase tracking-wider mb-2.5">
                Registering As:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 select-none hover:-translate-y-0.5 active:scale-[0.98] ${
                      form.role === option.value
                        ? 'border-[#8B5CF6] bg-[#F3EEFF] shadow-soft-sm'
                        : 'border-[#DDD3F5] bg-[#F8F7FF] hover:border-[#C4B5FD]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={form.role === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-2xl mb-1.5">{option.icon}</div>
                    <span className={`text-sm font-bold transition-colors ${
                      form.role === option.value ? 'text-[#8B5CF6]' : 'text-[#18151F]'
                    }`}>
                      {option.label}
                    </span>
                    <span className="text-[11px] text-[#5B5568] leading-snug mt-1 font-normal">
                      {option.desc}
                    </span>
                    {form.role === option.value && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-[#8B5CF6] rounded-full flex items-center justify-center animate-scale-in shadow-sm">
                        <svg className="w-3 h-3 text-white font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-sm font-bold mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account & Get Started →'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E9DFFF] text-center text-xs text-[#5B5568]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#8B5CF6] hover:text-[#EC4899] transition-colors">
              Sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
