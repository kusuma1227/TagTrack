import React from 'react';
import useAuth from '../../hooks/useAuth';

const OfficerDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Verification Officer Dashboard
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Logged in as: <span className="font-medium text-gray-700">{user?.email}</span>
          {' '}·{' '}
          <span className="badge bg-amber-100 text-amber-800">Officer</span>
        </p>
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">⚖️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Claims Queue</h2>
          <p className="text-gray-500 text-sm">
            Ownership claims review interface will be active in Phase 4.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
