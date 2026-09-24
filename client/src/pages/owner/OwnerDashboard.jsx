import React from 'react';
import useAuth from '../../hooks/useAuth';

/**
 * OwnerDashboard — Phase 1 overview.
 * Full dashboard with stats, items list, and QR features will be expanded in Phase 2.
 */
const OwnerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your registered items and track their recovery status.
          </p>
        </div>

        {/* Status Cards (placeholders for Phase 2) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Items', value: '0', color: 'text-gray-800', bg: 'bg-gray-100' },
            { label: 'Lost', value: '0', color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Found', value: '0', color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Returned', value: '0', color: 'text-green-700', bg: 'bg-green-50' },
          ].map((card) => (
            <div key={card.label} className="card p-5">
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-gray-500 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No items registered yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Register your first item to generate a QR code and start protecting your belongings.
          </p>
          <div className="inline-flex">
            <button
              disabled
              className="btn-primary opacity-50 cursor-not-allowed"
              title="Item registration coming in Phase 2"
            >
              + Register Item
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">Item registration will be enabled in Phase 2</p>
        </div>

        {/* Profile Info */}
        <div className="card p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name</span>
              <p className="font-medium text-gray-900 mt-0.5">{user?.name}</p>
            </div>
            <div>
              <span className="text-gray-500">Email</span>
              <p className="font-medium text-gray-900 mt-0.5">{user?.email}</p>
            </div>
            <div>
              <span className="text-gray-500">Role</span>
              <p className="mt-0.5">
                <span className="badge bg-indigo-100 text-indigo-700 capitalize">{user?.role}</span>
              </p>
            </div>
            <div>
              <span className="text-gray-500">Account Status</span>
              <p className="mt-0.5">
                <span className="badge bg-green-100 text-green-700">
                  {user?.isActive ? 'Active' : 'Suspended'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
