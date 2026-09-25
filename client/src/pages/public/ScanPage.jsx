import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getItemByTagId, reportItemFound } from '../../api/itemApi';

/**
 * ScanPage — Public page for searching Tag IDs and reporting found lost items.
 * Clean, modern light theme with violet-pink accents.
 * 
 * Strict Data Privacy:
 * - Public details only (Item Name, Category, Description, Status, Tag ID).
 * - Never displays owner contact details, email, phone, or password.
 */
const ScanPage = () => {
  const { tagId: urlTagId } = useParams();
  const navigate = useNavigate();

  // Search state
  const [searchInput, setSearchInput] = useState(urlTagId ? urlTagId.toUpperCase() : '');
  const [searchError, setSearchError] = useState('');

  // Item fetch state
  const [item, setItem] = useState(null);
  const [isLoadingItem, setIsLoadingItem] = useState(Boolean(urlTagId));
  const [fetchError, setFetchError] = useState('');

  // Found report form state
  const [formData, setFormData] = useState({
    finderName: '',
    finderPhone: '',
    finderEmail: '',
    finderMessage: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch public item details when urlTagId changes
  useEffect(() => {
    if (urlTagId) {
      const cleanTag = urlTagId.trim().toUpperCase();
      setSearchInput(cleanTag);
      fetchPublicItem(cleanTag);
    } else {
      setItem(null);
      setFetchError('');
      setIsLoadingItem(false);
      setIsSubmitted(false);
    }
  }, [urlTagId]);

  const fetchPublicItem = async (targetTag) => {
    try {
      setIsLoadingItem(true);
      setFetchError('');
      setIsSubmitted(false);
      const res = await getItemByTagId(targetTag);
      setItem(res.data?.item || null);
    } catch (err) {
      setItem(null);
      const msg = err.response?.data?.message || 'Item not found. Please verify the Tag ID.';
      setFetchError(msg);
    } finally {
      setIsLoadingItem(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const cleaned = searchInput.trim().toUpperCase();
    if (!cleaned) {
      setSearchError('Please enter a Tag ID');
      return;
    }
    if (!/^TT-[A-Z0-9]{6}$/.test(cleaned)) {
      setSearchError('Tag ID format must be TT-XXXXXX (e.g. TT-A3F2K9)');
      return;
    }
    setSearchError('');
    navigate(`/scan/${cleaned}`);
  };

  const handleCopyTagId = (tag) => {
    navigator.clipboard.writeText(tag);
    toast.success(`Tag ID ${tag} copied!`);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.finderName.trim()) {
      errors.finderName = 'Finder name is required';
    } else if (formData.finderName.trim().length < 2) {
      errors.finderName = 'Name must be at least 2 characters';
    }

    if (!formData.finderPhone.trim()) {
      errors.finderPhone = 'Phone number is required';
    } else if (formData.finderPhone.trim().length < 7) {
      errors.finderPhone = 'Please enter a valid phone number';
    }

    if (formData.finderEmail && formData.finderEmail.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.finderEmail.trim())) {
        errors.finderEmail = 'Please provide a valid email address';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !item) return;

    try {
      setIsSubmitting(true);
      const res = await reportItemFound(item.tagId, {
        finderName: formData.finderName.trim(),
        finderPhone: formData.finderPhone.trim(),
        finderEmail: formData.finderEmail ? formData.finderEmail.trim().toLowerCase() : undefined,
        finderMessage: formData.finderMessage.trim(),
      });

      setIsSubmitted(true);
      toast.success(res.message || 'Found report submitted successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit found report';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'LOST':
        return <span className="badge-lost">LOST</span>;
      case 'FOUND':
        return <span className="badge-found">FOUND</span>;
      case 'RETURNED':
        return <span className="badge-returned">RETURNED</span>;
      case 'DEACTIVATED':
        return <span className="badge-deactivated">DEACTIVATED</span>;
      case 'REGISTERED':
      default:
        return <span className="badge-registered">REGISTERED</span>;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] bg-[#F8F7FF] text-[#18151F] flex items-center justify-center px-4 py-12 page-transition">

      {/* Ambient Lights */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#8B5CF6]/8 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/3 w-[450px] h-[450px] bg-[#EC4899]/8 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-xl animate-slide-up space-y-6">

        {/* ── Initial Search Form (when no urlTagId or searching new) ──────────────── */}
        {!urlTagId && (
          <div>
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

            {/* Search Card */}
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
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value.toUpperCase());
                        setSearchError('');
                      }}
                      className={`input uppercase tracking-[0.25em] text-center text-xl sm:text-2xl font-mono font-extrabold py-4 text-[#8B5CF6] bg-[#F8F7FF] border-2 ${
                        searchError ? 'border-[#F43F5E] bg-[#FFF0F7]' : 'border-[#DDD3F5] focus:border-[#8B5CF6]'
                      }`}
                      placeholder="TT-A3F2K9"
                      maxLength={9}
                    />
                  </div>

                  {searchError && (
                    <p className="mt-2 text-xs text-[#F43F5E] text-center flex items-center justify-center gap-1 font-medium animate-scale-in">
                      <span>⚠️</span> {searchError}
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
        )}

        {/* ── Loading State ─────────────────────────────────────────────────── */}
        {urlTagId && isLoadingItem && (
          <div className="rounded-[24px] p-16 bg-white border border-[#E9DFFF] text-center shadow-soft-lg">
            <div className="w-12 h-12 border-3 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-base font-bold text-[#18151F] mb-1">Scanning Tag Identifier...</h3>
            <p className="text-xs text-[#5B5568]">Retrieving public item status for <span className="font-mono font-bold text-[#8B5CF6]">{urlTagId}</span></p>
          </div>
        )}

        {/* ── Error / Not Found State ───────────────────────────────────────── */}
        {urlTagId && !isLoadingItem && fetchError && (
          <div className="rounded-[24px] p-8 sm:p-10 bg-white border border-[#FBCFE8] text-center shadow-soft-lg animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF0F7] border border-[#FBCFE8] flex items-center justify-center mx-auto mb-4 text-3xl">
              ❌
            </div>
            <h2 className="text-2xl font-extrabold text-[#18151F] mb-2">Item Not Found</h2>
            <p className="text-sm text-[#5B5568] mb-6 max-w-md mx-auto leading-relaxed font-normal">
              {fetchError}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/scan')}
                className="btn-primary text-xs py-3 px-6"
              >
                🔍 Search Another Tag ID
              </button>
              <Link to="/" className="btn-secondary text-xs py-3 px-6">
                Return Home
              </Link>
            </div>
          </div>
        )}

        {/* ── Item Details & Action Card ────────────────────────────────────── */}
        {urlTagId && !isLoadingItem && item && (
          <div className="space-y-6">

            {/* Back to search action */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/scan')}
                className="text-xs font-semibold text-[#5B5568] hover:text-[#8B5CF6] transition-colors flex items-center gap-1"
              >
                <span>←</span> <span>Search Another Item</span>
              </button>
              <span className="text-[11px] font-bold text-[#777080] bg-[#F8F7FF] px-2.5 py-1 rounded-full border border-[#DDD3F5]">
                🔒 Verified Public View
              </span>
            </div>

            {/* Public Item Header Card */}
            <div className="rounded-[24px] p-6 sm:p-8 bg-white border border-[#E9DFFF] shadow-soft-lg relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold bg-[#F8F7FF] text-[#8B5CF6] border border-[#DDD3F5] px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    {item.createdAt && (
                      <span className="text-[11px] text-[#777080]">
                        Registered {format(new Date(item.createdAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18151F] tracking-tight">
                    {item.itemName}
                  </h1>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              {/* Tag ID Display */}
              <div className="my-4 p-3.5 rounded-xl bg-[#F8F7FF] border border-[#DDD3F5] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#777080] block tracking-wider">
                    Tag ID
                  </span>
                  <span className="font-mono text-lg font-extrabold text-[#8B5CF6] tracking-wider">
                    {item.tagId}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyTagId(item.tagId)}
                  className="btn-secondary text-xs py-1.5 px-3"
                  title="Copy Tag ID"
                >
                  📋 Copy
                </button>
              </div>

              {/* Description preview */}
              {item.description ? (
                <div className="p-3.5 rounded-xl bg-[#F8F7FF] border border-[#DDD3F5] text-xs text-[#5B5568] leading-relaxed">
                  <span className="font-bold text-[#18151F] block mb-1">Item Description:</span>
                  {item.description}
                </div>
              ) : (
                <p className="text-xs text-[#777080] italic">No additional description provided by owner.</p>
              )}
            </div>

            {/* ── Status-Specific Section ───────────────────────────────────── */}

            {/* CASE 1: Item is LOST → Show Report Found Form */}
            {item.status === 'LOST' && (
              <div className="rounded-[24px] p-6 sm:p-8 bg-white border border-[#E9DFFF] shadow-soft-lg animate-slide-up">
                {isSubmitted ? (
                  /* Success State */
                  <div className="text-center py-6 animate-scale-in">
                    <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mx-auto mb-4 text-3xl">
                      🎉
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#18151F] mb-2">
                      Found Report Submitted!
                    </h2>
                    <p className="text-sm text-[#5B5568] mb-6 max-w-md mx-auto leading-relaxed">
                      Thank you for being a good Samaritan! Your report for{' '}
                      <span className="font-bold text-[#18151F]">{item.itemName}</span> has been securely recorded. TagTrack will coordinate recovery with the owner.
                    </p>
                    <button
                      onClick={() => navigate('/scan')}
                      className="btn-primary text-xs py-3 px-6"
                    >
                      Search Another Item
                    </button>
                  </div>
                ) : (
                  /* Report Found Form */
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📢</span>
                      <h2 className="text-xl font-bold text-[#18151F]">
                        Did You Find This Item?
                      </h2>
                    </div>
                    <p className="text-xs text-[#5B5568] mb-6 leading-relaxed">
                      Please enter your contact details so the owner can securely arrange recovery. Your information is protected and used strictly for recovery coordination.
                    </p>

                    <form onSubmit={handleReportSubmit} className="space-y-4">
                      {/* Finder Name */}
                      <div>
                        <label className="block text-xs font-bold text-[#18151F] mb-1">
                          Your Full Name <span className="text-[#EC4899]">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Alex Johnson"
                          value={formData.finderName}
                          onChange={(e) => {
                            setFormData({ ...formData, finderName: e.target.value });
                            if (formErrors.finderName) setFormErrors({ ...formErrors, finderName: '' });
                          }}
                          className={`input ${formErrors.finderName ? 'input-error' : ''}`}
                        />
                        {formErrors.finderName && (
                          <p className="text-xs text-[#F43F5E] mt-1">{formErrors.finderName}</p>
                        )}
                      </div>

                      {/* Finder Phone */}
                      <div>
                        <label className="block text-xs font-bold text-[#18151F] mb-1">
                          Your Contact Phone Number <span className="text-[#EC4899]">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +1 555-0199"
                          value={formData.finderPhone}
                          onChange={(e) => {
                            setFormData({ ...formData, finderPhone: e.target.value });
                            if (formErrors.finderPhone) setFormErrors({ ...formErrors, finderPhone: '' });
                          }}
                          className={`input ${formErrors.finderPhone ? 'input-error' : ''}`}
                        />
                        {formErrors.finderPhone && (
                          <p className="text-xs text-[#F43F5E] mt-1">{formErrors.finderPhone}</p>
                        )}
                      </div>

                      {/* Finder Email (Optional) */}
                      <div>
                        <label className="block text-xs font-bold text-[#18151F] mb-1">
                          Email Address <span className="text-[#777080] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. alex@example.com"
                          value={formData.finderEmail}
                          onChange={(e) => {
                            setFormData({ ...formData, finderEmail: e.target.value });
                            if (formErrors.finderEmail) setFormErrors({ ...formErrors, finderEmail: '' });
                          }}
                          className={`input ${formErrors.finderEmail ? 'input-error' : ''}`}
                        />
                        {formErrors.finderEmail && (
                          <p className="text-xs text-[#F43F5E] mt-1">{formErrors.finderEmail}</p>
                        )}
                      </div>

                      {/* Message / Location */}
                      <div>
                        <label className="block text-xs font-bold text-[#18151F] mb-1">
                          Where did you find it? / Message for Owner{' '}
                          <span className="text-[#777080] font-normal">(Optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="e.g. Found on the bench near Central Park coffee shop..."
                          value={formData.finderMessage}
                          onChange={(e) => {
                            setFormData({ ...formData, finderMessage: e.target.value });
                          }}
                          className="input resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full py-3.5 text-sm font-bold shadow-[0_4px_16px_rgba(139,92,246,0.35)] mt-2"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting Report...</span>
                          </>
                        ) : (
                          <>
                            <span>📢</span>
                            <span>Submit Found Report</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* CASE 2: Item is REGISTERED → Safe status notice */}
            {item.status === 'REGISTERED' && (
              <div className="rounded-[24px] p-6 sm:p-8 bg-white border border-[#E9DFFF] shadow-soft-lg animate-slide-up text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F3EEFF] border border-[#DDD3F5] flex items-center justify-center mx-auto mb-3 text-2xl">
                  🛡️
                </div>
                <h3 className="text-lg font-extrabold text-[#18151F] mb-2">
                  Item is Registered & Safe
                </h3>
                <p className="text-xs text-[#5B5568] max-w-md mx-auto leading-relaxed">
                  This item is registered on TagTrack and has not been reported lost by its owner. No recovery action is required at this time.
                </p>
              </div>
            )}

            {/* CASE 3: Item is RETURNED → Safe status notice */}
            {item.status === 'RETURNED' && (
              <div className="rounded-[24px] p-6 sm:p-8 bg-white border border-[#A7F3D0] shadow-soft-lg animate-slide-up text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mx-auto mb-3 text-2xl">
                  ✅
                </div>
                <h3 className="text-lg font-extrabold text-[#18151F] mb-2">
                  Item Safely Returned
                </h3>
                <p className="text-xs text-[#5B5568] max-w-md mx-auto leading-relaxed">
                  This item was previously reported and has already been safely returned to its owner.
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default ScanPage;
