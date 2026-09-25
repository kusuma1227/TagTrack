import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

/**
 * ScanPage — Public page for searching a lost item by Tag ID.
 * Clean, modern light theme with violet-pink scanner accents.
 */
const ScanPage = () => {
  const { tagId: urlTagId } = useParams();
  const [tagId, setTagId] = useState(urlTagId ? urlTagId.toUpperCase() : '');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (urlTagId) {
      setTagId(urlTagId.toUpperCase());
    }
  }, [urlTagId]);

  const handleSearch = (e) => {
    e.preventDefault();
    const cleaned = tagId.trim().toUpperCase();
    if (!cleaned) {
      setError('Please enter a Tag ID');
      return;
    }
    if (!/^TT-[A-Z0-9]{6}$/.test(cleaned)) {
      setError('Tag ID format must be TT-XXXXXX (e.g. TT-A3F2K9)');
      return;
    }
    navigate(`/scan/${cleaned}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] bg-[#F8F7FF] text-[#18151F] flex items-center justify-center px-4 py-12 page-transition">

      {/* Ambient Lights */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#8B5CF6]/8 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/3 w-[450px] h-[450px] bg-[#EC4899]/8 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-lg animate-slide-up">

        {/* Scanner Graphic & Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-4 group select-none">
            <div className="w-20 h-20 rounded-3xl bg-white border border-[#DDD3F5] flex items-center justify-center text-3xl shadow-soft-md transition-transform duration-300 group-hover:scale-105">
              🔍
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC4899] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#EC4899]"></span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18151F] tracking-tight">
            Find a Lost Item
          </h1>
          <p className="text-[#5B5568] text-sm mt-2 max-w-sm mx-auto font-normal">
            Enter the unique Tag ID printed on the item's label or QR code to view recovery info.
          </p>
        </div>

        {/* Search / Scan White Card */}
        <div className="rounded-[24px] p-8 sm:p-10 bg-white border border-[#E9DFFF] shadow-soft-lg transition-all duration-300">
          <form onSubmit={handleSearch} className="space-y-6">

            <div>
              <label htmlFor="tagId" className="block text-xs font-bold text-[#5B5568] uppercase tracking-widest text-center mb-3">
                Digital Tag Identifier
              </label>

              <div className="relative overflow-hidden rounded-xl">
                <input
                  id="tagId"
                  type="text"
                  value={tagId}
                  onChange={(e) => {
                    setTagId(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className={`input uppercase tracking-[0.25em] text-center text-xl sm:text-2xl font-mono font-extrabold py-4 text-[#8B5CF6] bg-[#F8F7FF] border-2 ${
                    error ? 'border-[#F43F5E] bg-[#FFF0F7]' : 'border-[#DDD3F5] focus:border-[#8B5CF6]'
                  }`}
                  placeholder="TT-A3F2K9"
                  maxLength={9}
                />
              </div>

              {error && (
                <p className="mt-2 text-xs text-[#F43F5E] text-center flex items-center justify-center gap-1 font-medium animate-scale-in">
                  <span>⚠️</span> {error}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] text-[#777080] px-1">
                <span>Standard Format: <strong className="text-[#8B5CF6] font-mono">TT-XXXXXX</strong></span>
                <span>6 alphanumeric characters</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-4 text-base font-bold shadow-[0_4px_16px_rgba(139,92,246,0.35)]"
            >
              Verify & Search Item →
            </button>
          </form>

          {/* Feature Strip within Scanner */}
          <div className="mt-8 pt-6 border-t border-[#E9DFFF] grid grid-cols-2 gap-4 text-center">
            <div className="p-3.5 rounded-xl bg-[#F8F7FF] border border-[#DDD3F5]">
              <span className="text-[10px] text-[#777080] uppercase tracking-wider block font-bold">Privacy Safe</span>
              <span className="text-xs font-bold text-[#18151F]">No Account Needed</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8F7FF] border border-[#DDD3F5]">
              <span className="text-[10px] text-[#777080] uppercase tracking-wider block font-bold">Security</span>
              <span className="text-xs font-bold text-[#8B5CF6]">Verified System</span>
            </div>
          </div>
        </div>

        {/* Quick Back to Home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs font-semibold text-[#5B5568] hover:text-[#8B5CF6] transition-colors duration-200">
            ← Return to TagTrack Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ScanPage;
