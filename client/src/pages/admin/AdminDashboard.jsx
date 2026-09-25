import React from 'react';
import useAuth from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen bg-[#F8F7FF] text-[#18151F] py-10 px-4 sm:px-6 lg:px-8 page-transition">

      {/* Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-[#EC4899]/5 rounded-full blur-[140px] animate-pulse-glow" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9DFFF]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899] animate-pulse" />
              <span className="text-xs font-bold text-[#EC4899] tracking-wider uppercase">
                Super Admin Console
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#18151F] tracking-tight">
              System Administration
            </h1>
            <p className="text-[#5B5568] text-sm mt-1">
              Logged in as: <span className="font-bold text-[#18151F]">{user?.email}</span>
              {' '}·{' '}
              <span className="badge bg-[#FFF0F7] text-[#EC4899] border-[#FBCFE8] capitalize font-bold">
                {user?.role}
              </span>
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Platform Users', value: '1', icon: '👥', bg: 'bg-[#F3EEFF]', border: 'border-[#DDD3F5]', color: 'text-[#8B5CF6]' },
            { label: 'Total Tracked Items', value: '0', icon: '📦', bg: 'bg-[#EEE7FF]', border: 'border-[#DDD3F5]', color: 'text-[#A855F7]' },
            { label: 'Active Security Claims', value: '0', icon: '🛡️', bg: 'bg-[#FFF4E8]', border: 'border-[#FED7AA]', color: 'text-[#F97316]' },
          ].map((card, idx) => (
            <div
              key={card.label}
              className={`p-6 rounded-[22px] ${card.bg} border ${card.border} shadow-soft-sm hover:shadow-soft-md transition-all duration-300 hover:-translate-y-1`}
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
                <div className={`text-3xl font-extrabold font-mono ${card.color}`}>{card.value}</div>
              </div>
              <div className="text-xs font-bold text-[#5B5568] uppercase tracking-wider">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Admin Controls Card */}
        <div className="rounded-[28px] p-12 sm:p-16 bg-white border border-[#E9DFFF] text-center shadow-soft-lg transition-all duration-300">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-xl font-bold text-[#18151F] mb-2">System Administration Controls</h2>
          <p className="text-[#5B5568] text-sm max-w-md mx-auto font-normal">
            Full user role management, system audit logs, and platform analytics will be active in Phase 7.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
