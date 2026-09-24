import React from 'react';
import useAuth from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Logged in as: <span className="font-medium text-gray-700">{user?.email}</span>
          {' '}·{' '}
          <span className="badge bg-rose-100 text-rose-700">Admin</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {['Total Users', 'Total Items', 'Active Claims'].map((label) => (
            <div key={label} className="card p-5">
              <div className="text-2xl font-bold text-gray-800">0</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Admin Controls</h2>
          <p className="text-gray-500 text-sm">
            Full admin management interface will be active in Phase 7.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
