import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { registerUser } from '../../api/authApi';

const ROLE_OPTIONS = [
  {
    value: 'owner',
    label: 'Owner',
    desc: 'I want to register my belongings and get QR tags',
    icon: '📦',
  },
  {
    value: 'finder',
    label: 'Finder',
    desc: "I mostly help return found items to their owners",
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
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email))
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
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      login(data.data.token, data.data.user);
      toast.success('Account created successfully! Welcome to TagTrack.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
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
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">TT</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TagTrack</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start protecting your valuables today</p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name" name="name" type="text" autoComplete="name"
                value={form.name} onChange={handleChange}
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="John Smith"
                disabled={isLoading}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={handleChange}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password" name="password" type="password"
                value={form.password} onChange={handleChange}
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                disabled={isLoading}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                value={form.confirmPassword} onChange={handleChange}
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Re-enter your password"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am registering as a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col gap-1 p-3.5 rounded-lg border-2 cursor-pointer transition-colors ${
                      form.role === option.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio" name="role" value={option.value}
                      checked={form.role === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-xl">{option.icon}</span>
                    <span className={`text-sm font-semibold ${
                      form.role === option.value ? 'text-indigo-700' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500 leading-snug">{option.desc}</span>
                    {form.role === option.value && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M3.5 6.5l2 2 3-4" stroke="currentColor" strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Note: Officer and Admin roles are assigned by administrators only.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit" className="btn-primary w-full py-3 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
