import React from 'react';
import useAuth from '../../hooks/useAuth';

const OfficerDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen bg-[#F8F7FF] text-[#18151F] py-10 px-4 sm:px-6 lg:px-8 page-transition">

      {/* Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-[#F59E0B]/5 rounded-full blur-[140px] animate-pulse-glow" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9DFFF]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-xs font-bold text-[#F59E0B] tracking-wider uppercase">
                Officer Portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#18151F] tracking-tight">
              Verification Officer Dashboard
            </h1>
            <p className="text-[#5B5568] text-sm mt-1">
              Logged in as: <span className="font-bold text-[#18151F]">{user?.email}</span>
              {' '}·{' '}
              <span className="badge bg-[#FFF4E8] text-[#F59E0B] border-[#FED7AA] capitalize font-bold">
                {user?.role}
              </span>
            </p>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-[22px] bg-[#FFF4E8] border border-[#FED7AA] shadow-soft-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⏳</span>
              <span className="text-3xl font-extrabold font-mono text-[#F59E0B]">0</span>
            </div>
            <div className="text-xs font-bold text-[#5B5568] uppercase tracking-wider">Pending Claims</div>
          </div>
          <div className="p-6 rounded-[22px] bg-[#ECFDF5] border border-[#A7F3D0] shadow-soft-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">✅</span>
              <span className="text-3xl font-extrabold font-mono text-[#10B981]">0</span>
            </div>
            <div className="text-xs font-bold text-[#5B5568] uppercase tracking-wider">Approved Returns</div>
          </div>
          <div className="p-6 rounded-[22px] bg-[#FFF0F7] border border-[#FBCFE8] shadow-soft-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">❌</span>
              <span className="text-3xl font-extrabold font-mono text-[#EC4899]">0</span>
            </div>
            <div className="text-xs font-bold text-[#5B5568] uppercase tracking-wider">Rejected Claims</div>
          </div>
        </div>

        {/* Claims Queue Card */}
        <div className="rounded-[28px] p-12 sm:p-16 bg-white border border-[#E9DFFF] text-center shadow-soft-lg transition-all duration-300">
          <div className="text-5xl mb-4">⚖️</div>
          <h2 className="text-xl font-bold text-[#18151F] mb-2">Ownership Claims Queue</h2>
          <p className="text-[#5B5568] text-sm max-w-md mx-auto font-normal">
            Ownership claims review, proof inspection, and return authorization interface will be active in Phase 4.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
