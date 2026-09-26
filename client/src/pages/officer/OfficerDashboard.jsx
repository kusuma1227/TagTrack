import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { getClaims, approveClaim, rejectClaim } from '../../api/claimApi';
import { CLAIM_STATUS } from '../../config/constants';

/**
 * OfficerDashboard — Verification Officer Command Center
 * - Live queue of submitted & reviewed ownership claims
 * - Real-time filtering by claim status & search query
 * - Comprehensive item, claimant, finder, and proof notes inspection
 * - Multi-step interactive Approve & Reject validation flows with modals
 */
const OfficerDashboard = () => {
  const { user } = useAuth();

  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [claimToApprove, setClaimToApprove] = useState(null);
  const [approveNotes, setApproveNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const [claimToReject, setClaimToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [selectedClaimDetails, setSelectedClaimDetails] = useState(null);

  const formatDateSafe = (dateVal, pattern = 'MMM d, yyyy h:mm a') => {
    if (!dateVal) return 'N/A';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'N/A';
      return format(d, pattern);
    } catch {
      return 'N/A';
    }
  };

  const fetchClaimsList = async () => {
    try {
      setIsLoading(true);
      const res = await getClaims();
      setClaims(res.data?.claims || []);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Failed to load ownership claims';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimsList();
  }, []);

  // Filtered claims
  const filteredClaims = claims.filter((claim) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      claim.status === statusFilter ||
      (statusFilter === 'PENDING' && (claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW'));

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (claim.item?.itemName && claim.item.itemName.toLowerCase().includes(term)) ||
      (claim.item?.tagId && claim.item.tagId.toLowerCase().includes(term)) ||
      (claim.owner?.name && claim.owner.name.toLowerCase().includes(term)) ||
      (claim.owner?.email && claim.owner.email.toLowerCase().includes(term)) ||
      (claim.foundReport?.finderName && claim.foundReport.finderName.toLowerCase().includes(term)) ||
      (claim.claimMessage && claim.claimMessage.toLowerCase().includes(term));

    return matchesStatus && matchesSearch;
  });

  // Dynamic stats
  const totalClaims = claims.length;
  const pendingCount = claims.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
  const approvedCount = claims.filter((c) => c.status === 'APPROVED').length;
  const rejectedCount = claims.filter((c) => c.status === 'REJECTED').length;

  const handleCopyTag = (tagId, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tagId);
    toast.success(`Tag ID ${tagId} copied!`);
  };

  // ── Handle Approve Submission ──
  const handleConfirmApprove = async () => {
    if (!claimToApprove) return;
    try {
      setIsApproving(true);
      const res = await approveClaim(claimToApprove._id, approveNotes.trim());
      toast.success(res.message || 'Ownership claim approved successfully!');
      
      // Update local state
      if (res.data?.claim) {
        setClaims((prev) =>
          prev.map((c) => (c._id === claimToApprove._id ? res.data.claim : c))
        );
      }
      setClaimToApprove(null);
      setApproveNotes('');
      fetchClaimsList();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Failed to approve claim';
      toast.error(errorMsg);
    } finally {
      setIsApproving(false);
    }
  };

  // ── Handle Reject Submission ──
  const handleConfirmReject = async (e) => {
    if (e) e.preventDefault();
    if (!claimToReject) return;

    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }

    try {
      setIsRejecting(true);
      const res = await rejectClaim(
        claimToReject._id,
        rejectionReason.trim(),
        rejectNotes.trim()
      );
      toast.success(res.message || 'Ownership claim rejected.');

      // Update local state
      if (res.data?.claim) {
        setClaims((prev) =>
          prev.map((c) => (c._id === claimToReject._id ? res.data.claim : c))
        );
      }
      setClaimToReject(null);
      setRejectionReason('');
      setRejectNotes('');
      fetchClaimsList();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Failed to reject claim';
      toast.error(errorMsg);
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="badge bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0] uppercase font-bold text-[11px] inline-flex items-center gap-1">
            <span>✅</span>
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="badge bg-[#FFF0F7] text-[#EC4899] border-[#FBCFE8] uppercase font-bold text-[11px] inline-flex items-center gap-1">
            <span>❌</span>
            <span>REJECTED</span>
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="badge bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE] uppercase font-bold text-[11px] inline-flex items-center gap-1">
            <span>🔍</span>
            <span>UNDER REVIEW</span>
          </span>
        );
      case 'SUBMITTED':
      default:
        return (
          <span className="badge bg-[#FFF4E8] text-[#F59E0B] border-[#FED7AA] uppercase font-bold text-[11px] inline-flex items-center gap-1">
            <span>⏳</span>
            <span>SUBMITTED</span>
          </span>
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F7FF] text-[#18151F] py-10 px-4 sm:px-6 lg:px-8 page-transition">

      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-[#F59E0B]/5 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-[20%] left-[5%] w-[600px] h-[600px] bg-[#8B5CF6]/5 rounded-full blur-[160px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9DFFF] animate-slide-up">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-xs font-bold text-[#F59E0B] tracking-wider uppercase">
                Verification Portal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18151F] tracking-tight">
              Verification Officer Dashboard
            </h1>
            <p className="text-[#5B5568] text-sm mt-1">
              Review claimant ownership submissions, cross-verify finder reports, and authorize item returns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchClaimsList}
              disabled={isLoading}
              className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
              title="Refresh queue"
            >
              <span className={isLoading ? 'animate-spin inline-block' : ''}>🔄</span>
              <span>{isLoading ? 'Refreshing...' : 'Refresh Queue'}</span>
            </button>
          </div>
        </div>

        {/* ── Highlights / Status Summary Cards ─────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {[
            {
              label: 'Total Claims',
              value: totalClaims,
              color: 'text-[#8B5CF6]',
              bg: 'bg-[#F3EEFF]',
              border: 'border-[#DDD3F5]',
              icon: '📋',
            },
            {
              label: 'Pending Review',
              value: pendingCount,
              color: 'text-[#F59E0B]',
              bg: 'bg-[#FFF4E8]',
              border: 'border-[#FED7AA]',
              icon: '⏳',
            },
            {
              label: 'Approved Claims',
              value: approvedCount,
              color: 'text-[#10B981]',
              bg: 'bg-[#ECFDF5]',
              border: 'border-[#A7F3D0]',
              icon: '✅',
            },
            {
              label: 'Rejected Claims',
              value: rejectedCount,
              color: 'text-[#EC4899]',
              bg: 'bg-[#FFF0F7]',
              border: 'border-[#FBCFE8]',
              icon: '❌',
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`p-5 rounded-[22px] ${card.bg} border ${card.border} shadow-soft-sm transition-all duration-300 hover:shadow-soft-md hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-3xl font-extrabold font-mono ${card.color}`}>
                  {isLoading ? '-' : card.value}
                </span>
              </div>
              <div className="text-xs font-bold text-[#5B5568] uppercase tracking-wider">
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters & Search ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Claims', value: 'ALL' },
              { label: 'Pending Review', value: 'PENDING' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Rejected', value: 'REJECTED' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`text-xs font-bold py-2 px-3.5 rounded-xl border transition-all duration-200 ${
                  statusFilter === tab.value
                    ? 'bg-[#18151F] text-white border-[#18151F] shadow-soft-sm'
                    : 'bg-white text-[#5B5568] border-[#E9DFFF] hover:bg-[#F8F7FF]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by item, Tag ID, owner, or finder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input py-2 px-3 text-xs w-full sm:w-80"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777080] hover:text-[#18151F] text-xs p-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Claims Review Queue ────────────────────────────────────────────── */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {isLoading ? (
            /* Loading State */
            <div className="rounded-[24px] p-16 bg-white border border-[#E9DFFF] text-center shadow-soft-sm">
              <div className="w-10 h-10 border-3 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#5B5568] font-medium">Loading claims queue...</p>
            </div>
          ) : filteredClaims.length === 0 ? (
            /* Empty State */
            <div className="rounded-[24px] p-16 bg-white border border-[#E9DFFF] text-center shadow-soft-md animate-scale-in">
              <div className="text-5xl mb-3">📬</div>
              <h3 className="text-lg font-bold text-[#18151F] mb-1">No Claims in this View</h3>
              <p className="text-[#5B5568] text-xs max-w-md mx-auto">
                {statusFilter !== 'ALL' || searchTerm
                  ? 'No claims match your selected filter or search query.'
                  : 'There are currently no ownership claims submitted by owners for verification.'}
              </p>
              {(statusFilter !== 'ALL' || searchTerm) && (
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="btn-secondary text-xs py-2 px-4 mt-4"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            /* Claims Cards Grid */
            <div className="grid grid-cols-1 gap-6">
              {filteredClaims.map((claim, idx) => {
                const isPending = claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW';

                return (
                  <div
                    key={claim._id}
                    className="rounded-[24px] p-6 sm:p-7 bg-white border border-[#E9DFFF] hover:border-[#8B5CF6]/50 shadow-soft-sm hover:shadow-soft-md transition-all duration-300 relative overflow-hidden space-y-6"
                  >
                    {/* Top Status Stripe */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 ${
                        claim.status === 'APPROVED'
                          ? 'bg-[#10B981]'
                          : claim.status === 'REJECTED'
                          ? 'bg-[#EC4899]'
                          : 'bg-[#F59E0B]'
                      }`}
                    />

                    {/* Header: Item, Tag ID & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EAF8] pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {claim.item?.category && (
                            <span className="text-[11px] font-bold bg-[#F8F7FF] text-[#8B5CF6] border border-[#DDD3F5] px-2.5 py-0.5 rounded-full">
                              {claim.item.category}
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold bg-[#F3EEFF] text-[#8B5CF6] border border-[#DDD3F5] px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                            <span>{claim.item?.tagId || 'N/A'}</span>
                            {claim.item?.tagId && (
                              <button
                                onClick={(e) => handleCopyTag(claim.item.tagId, e)}
                                className="hover:text-[#18151F]"
                                title="Copy Tag ID"
                              >
                                📋
                              </button>
                            )}
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-[#18151F]">
                          {claim.item?.itemName || 'Untitled Item'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(claim.status)}
                        <span className="text-xs text-[#777080]">
                          Claimed {formatDateSafe(claim.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* 3-Column Verification Dossier */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">

                      {/* 1. Claimant / Owner Info */}
                      <div className="p-4 bg-[#F8F7FF] rounded-2xl border border-[#DDD3F5] space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#DDD3F5] pb-2">
                          <span className="font-bold text-[#8B5CF6] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <span>👤</span>
                            <span>Claimant (Owner)</span>
                          </span>
                        </div>
                        <div className="space-y-1 text-[#18151F]">
                          <div className="font-bold text-sm">{claim.owner?.name || 'Owner'}</div>
                          <div className="text-[#5B5568] flex items-center gap-1 truncate" title={claim.owner?.email}>
                            <span>✉️</span> {claim.owner?.email || 'N/A'}
                          </div>
                          {claim.owner?.phone && (
                            <div className="text-[#5B5568] flex items-center gap-1 font-mono">
                              <span>📞</span> {claim.owner?.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Finder Report Lead */}
                      <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FCE7F3] space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#FBCFE8] pb-2">
                          <span className="font-bold text-[#9D174D] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <span>📢</span>
                            <span>Finder Lead</span>
                          </span>
                        </div>
                        <div className="space-y-1 text-[#18151F]">
                          <div className="font-bold text-sm">{claim.foundReport?.finderName || 'Anonymous Finder'}</div>
                          {claim.foundReport?.finderPhone && (
                            <div className="text-[#5B5568] flex items-center gap-1 font-mono">
                              <span>📞</span> {claim.foundReport.finderPhone}
                            </div>
                          )}
                          {claim.foundReport?.finderMessage && (
                            <div className="text-[11px] text-[#777080] italic bg-white/70 p-2 rounded-lg border border-[#FCE7F3] mt-1 line-clamp-2">
                              "{claim.foundReport.finderMessage}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. Claim Proof & Verification State */}
                      <div className="p-4 bg-[#FFFDF5] rounded-2xl border border-[#FEF3C7] space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#FDE68A] pb-2">
                          <span className="font-bold text-[#B45309] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <span>🛡️</span>
                            <span>Proof & Reason</span>
                          </span>
                        </div>
                        <div className="space-y-1">
                          {claim.claimMessage ? (
                            <p className="text-xs text-[#18151F] leading-relaxed bg-white/80 p-2.5 rounded-lg border border-[#FDE68A] italic">
                              "{claim.claimMessage}"
                            </p>
                          ) : (
                            <p className="text-xs text-[#777080] italic">No proof message provided</p>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Review History Details (if reviewed) */}
                    {(claim.status === 'APPROVED' || claim.status === 'REJECTED') && (
                      <div
                        className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                          claim.status === 'APPROVED'
                            ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                            : 'bg-[#FFF0F7] border-[#FBCFE8] text-[#9D174D]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-semibold">
                          <span>
                            {claim.status === 'APPROVED' ? '✅ Verification Approved' : '❌ Claim Rejected'} by{' '}
                            <span className="font-bold">{claim.reviewedBy?.name || 'Verification Officer'}</span>
                          </span>
                          {claim.reviewedAt && (
                            <span className="text-[11px] font-normal">
                              Reviewed {formatDateSafe(claim.reviewedAt)}
                            </span>
                          )}
                        </div>
                        {claim.rejectionReason && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-[#FBCFE8] text-xs font-normal">
                            <span className="font-bold block mb-0.5">Rejection Reason:</span>
                            "{claim.rejectionReason}"
                          </div>
                        )}
                        {claim.verificationNotes && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-[#A7F3D0] text-xs font-normal">
                            <span className="font-bold block mb-0.5">Officer Verification Notes:</span>
                            "{claim.verificationNotes}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Officer Review Actions ────────────────────────────────── */}
                    <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#F0EAF8]">
                      {/* Left: View Claim Details */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedClaimDetails(claim)}
                          className="w-full sm:w-auto btn-secondary text-xs py-2 px-3.5 flex items-center justify-center gap-1.5 shadow-soft-sm hover:border-[#8B5CF6]/50 transition-all duration-200 active:scale-95"
                        >
                          <span>👁️</span>
                          <span>View Claim Details</span>
                        </button>
                      </div>

                      {/* Right: Approve / Reject quick actions (if pending) */}
                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setClaimToReject(claim);
                                setRejectionReason('');
                                setRejectNotes('');
                              }}
                              className="w-full sm:w-auto btn-danger py-2 px-4 text-xs flex items-center justify-center gap-1.5 shadow-soft-sm active:scale-95"
                            >
                              <span>❌</span>
                              <span>Reject</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setClaimToApprove(claim);
                                setApproveNotes('');
                              }}
                              className="w-full sm:w-auto btn-primary py-2 px-5 text-xs flex items-center justify-center gap-1.5 bg-[#10B981] hover:bg-[#059669] border-transparent shadow-[0_4px_12px_rgba(16,185,129,0.3)] active:scale-95"
                            >
                              <span>✅</span>
                              <span>Approve Claim</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-[#5B5568] font-medium flex items-center gap-1">
                            <span>🔒</span>
                            <span>Review Finalized</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── Claim Dossier Details Modal ────────────────────────────────────── */}
      {selectedClaimDetails && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedClaimDetails(null)}
        >
          <div
            className="w-full max-w-2xl p-6 sm:p-8 rounded-[28px] bg-white border border-[#E9DFFF] shadow-soft-xl relative animate-scale-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedClaimDetails(null)}
              className="absolute top-5 right-5 text-[#777080] hover:text-[#18151F] p-2 rounded-xl bg-[#F8F7FF] hover:bg-[#F3EEFF] transition-all duration-200"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pr-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold bg-[#F3EEFF] text-[#8B5CF6] border border-[#DDD3F5] px-2.5 py-0.5 rounded-lg">
                      {selectedClaimDetails.item?.tagId || 'N/A'}
                    </span>
                    {selectedClaimDetails.item?.category && (
                      <span className="text-[11px] font-bold bg-[#F8F7FF] text-[#8B5CF6] border border-[#DDD3F5] px-2 py-0.5 rounded-full">
                        {selectedClaimDetails.item.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#18151F]">
                    {selectedClaimDetails.item?.itemName || 'Untitled Item'}
                  </h3>
                </div>
                <div>{getStatusBadge(selectedClaimDetails.status)}</div>
              </div>

              {/* Item Description (if any) */}
              {selectedClaimDetails.item?.description && (
                <div className="p-3 bg-[#F8F7FF] rounded-xl border border-[#DDD3F5] text-xs text-[#5B5568]">
                  <span className="font-bold text-[#18151F] block mb-0.5">Item Description:</span>
                  {selectedClaimDetails.item.description}
                </div>
              )}

              {/* 2-Column Info: Claimant & Finder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Claimant */}
                <div className="p-4 bg-[#F8F7FF] rounded-2xl border border-[#DDD3F5] space-y-2">
                  <div className="font-bold text-[#8B5CF6] border-b border-[#DDD3F5] pb-1.5 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span>👤</span> Claimant (Owner)
                  </div>
                  <div className="font-bold text-sm text-[#18151F]">{selectedClaimDetails.owner?.name || 'Owner'}</div>
                  <div className="text-[#5B5568]">✉️ {selectedClaimDetails.owner?.email || 'N/A'}</div>
                  {selectedClaimDetails.owner?.phone && (
                    <div className="text-[#5B5568] font-mono">📞 {selectedClaimDetails.owner.phone}</div>
                  )}
                </div>

                {/* Finder */}
                <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FCE7F3] space-y-2">
                  <div className="font-bold text-[#9D174D] border-b border-[#FBCFE8] pb-1.5 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span>📢</span> Finder Report
                  </div>
                  <div className="font-bold text-sm text-[#18151F]">{selectedClaimDetails.foundReport?.finderName || 'Finder'}</div>
                  {selectedClaimDetails.foundReport?.finderPhone && (
                    <div className="text-[#5B5568] font-mono">📞 {selectedClaimDetails.foundReport.finderPhone}</div>
                  )}
                  {selectedClaimDetails.foundReport?.finderEmail && (
                    <div className="text-[#5B5568]">✉️ {selectedClaimDetails.foundReport.finderEmail}</div>
                  )}
                  {selectedClaimDetails.foundReport?.finderMessage && (
                    <p className="text-[11px] italic text-[#777080] bg-white p-2 rounded-lg border border-[#FBCFE8]">
                      "{selectedClaimDetails.foundReport.finderMessage}"
                    </p>
                  )}
                </div>
              </div>

              {/* Claim Proof Message */}
              <div className="p-4 bg-[#FFFDF5] rounded-2xl border border-[#FEF3C7] text-xs space-y-1.5">
                <span className="font-bold text-[#B45309] block uppercase tracking-wider text-[11px]">
                  🛡️ Claimant Proof / Reason:
                </span>
                <p className="text-[#18151F] bg-white p-3 rounded-xl border border-[#FDE68A] italic leading-relaxed">
                  {selectedClaimDetails.claimMessage || 'No proof message provided.'}
                </p>
              </div>

              {/* Review Audit (if finalized) */}
              {(selectedClaimDetails.status === 'APPROVED' || selectedClaimDetails.status === 'REJECTED') && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                    selectedClaimDetails.status === 'APPROVED'
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                      : 'bg-[#FFF0F7] border-[#FBCFE8] text-[#9D174D]'
                  }`}
                >
                  <div className="font-bold">
                    {selectedClaimDetails.status === 'APPROVED' ? '✅ Approved' : '❌ Rejected'} by{' '}
                    {selectedClaimDetails.reviewedBy?.name || 'Verification Officer'} on{' '}
                    {formatDateSafe(selectedClaimDetails.reviewedAt)}
                  </div>
                  {selectedClaimDetails.rejectionReason && (
                    <div className="bg-white p-2 rounded-lg border border-[#FBCFE8]">
                      <span className="font-bold block">Rejection Reason:</span>
                      "{selectedClaimDetails.rejectionReason}"
                    </div>
                  )}
                  {selectedClaimDetails.verificationNotes && (
                    <div className="bg-white p-2 rounded-lg border border-[#A7F3D0]">
                      <span className="font-bold block">Officer Notes:</span>
                      "{selectedClaimDetails.verificationNotes}"
                    </div>
                  )}
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-[#E9DFFF] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedClaimDetails(null)}
                  className="btn-secondary text-xs py-2.5 px-4 w-full sm:w-auto"
                >
                  Close
                </button>

                {(selectedClaimDetails.status === 'SUBMITTED' || selectedClaimDetails.status === 'UNDER_REVIEW') && (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const c = selectedClaimDetails;
                        setSelectedClaimDetails(null);
                        setClaimToReject(c);
                        setRejectionReason('');
                        setRejectNotes('');
                      }}
                      className="btn-danger text-xs py-2.5 px-4 flex-1 sm:flex-none flex items-center justify-center gap-1.5"
                    >
                      <span>❌ Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const c = selectedClaimDetails;
                        setSelectedClaimDetails(null);
                        setClaimToApprove(c);
                        setApproveNotes('');
                      }}
                      className="btn-primary text-xs py-2.5 px-5 flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#10B981] hover:bg-[#059669] border-transparent shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                    >
                      <span>✅ Approve</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Confirmation Modal ─────────────────────────────────────── */}
      {claimToApprove && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !isApproving && setClaimToApprove(null)}
        >
          <div
            className="w-full max-w-lg p-6 sm:p-7 rounded-[28px] bg-white border border-[#E9DFFF] shadow-soft-xl relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => !isApproving && setClaimToApprove(null)}
              disabled={isApproving}
              className="absolute top-5 right-5 text-[#777080] hover:text-[#18151F] p-2 rounded-xl bg-[#F8F7FF] hover:bg-[#F3EEFF] transition-all duration-200 disabled:opacity-50"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-2xl shadow-soft-sm">
                  ✅
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#18151F]">
                    Approve Ownership Claim
                  </h3>
                  <p className="text-xs text-[#5B5568]">
                    Confirm claimant legitimacy for this item
                  </p>
                </div>
              </div>

              {/* Summary Dossier */}
              <div className="p-4 bg-[#F8F7FF] rounded-2xl border border-[#DDD3F5] space-y-2 mb-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#777080] font-medium">Item Name:</span>
                  <span className="font-bold text-[#18151F]">{claimToApprove.item?.itemName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777080] font-medium">Tag ID:</span>
                  <span className="font-mono font-bold text-[#8B5CF6]">{claimToApprove.item?.tagId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777080] font-medium">Claimant:</span>
                  <span className="font-bold text-[#18151F]">{claimToApprove.owner?.name} ({claimToApprove.owner?.email})</span>
                </div>
                {claimToApprove.claimMessage && (
                  <div className="pt-2 border-t border-[#DDD3F5] text-xs">
                    <span className="text-[#777080] font-medium block mb-0.5">Claimant Proof Message:</span>
                    <p className="italic text-[#18151F] bg-white p-2 rounded-lg border border-[#DDD3F5]">
                      "{claimToApprove.claimMessage}"
                    </p>
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#18151F] mb-1.5 uppercase tracking-wider">
                    Verification Notes <span className="text-[#777080] font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    placeholder="Add notes explaining how ownership was verified (e.g. proof of purchase verified, serial matches, etc.)..."
                    maxLength={1000}
                    className="input text-xs w-full resize-none p-3"
                    disabled={isApproving}
                  />
                </div>

                <div className="p-3 bg-[#ECFDF5] rounded-xl border border-[#A7F3D0] text-xs text-[#065F46] leading-relaxed">
                  <span className="font-bold block mb-0.5">ℹ️ Confirmation Impact:</span>
                  Approving this claim updates its status to <span className="font-mono font-bold">APPROVED</span> and records your verification timestamp.
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setClaimToApprove(null)}
                    disabled={isApproving}
                    className="btn-secondary text-xs py-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmApprove}
                    disabled={isApproving}
                    className="btn-primary text-xs py-3 flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] border-transparent"
                  >
                    {isApproving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <span>✅ Confirm Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal (Reason Required) ─────────────────────────────────── */}
      {claimToReject && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !isRejecting && setClaimToReject(null)}
        >
          <div
            className="w-full max-w-lg p-6 sm:p-7 rounded-[28px] bg-white border border-[#E9DFFF] shadow-soft-xl relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => !isRejecting && setClaimToReject(null)}
              disabled={isRejecting}
              className="absolute top-5 right-5 text-[#777080] hover:text-[#18151F] p-2 rounded-xl bg-[#F8F7FF] hover:bg-[#F3EEFF] transition-all duration-200 disabled:opacity-50"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F7] border border-[#FBCFE8] flex items-center justify-center text-2xl shadow-soft-sm">
                  ❌
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#18151F]">
                    Reject Ownership Claim
                  </h3>
                  <p className="text-xs text-[#5B5568]">
                    Specify why this ownership claim cannot be verified
                  </p>
                </div>
              </div>

              {/* Summary Dossier */}
              <div className="p-4 bg-[#F8F7FF] rounded-2xl border border-[#DDD3F5] space-y-2 mb-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#777080] font-medium">Item:</span>
                  <span className="font-bold text-[#18151F]">{claimToReject.item?.itemName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777080] font-medium">Claimant:</span>
                  <span className="font-bold text-[#18151F]">{claimToReject.owner?.name}</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#18151F] mb-1.5 uppercase tracking-wider">
                    Rejection Reason <span className="text-[#EC4899]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="State the specific reason for rejecting this claim (e.g. proof inadequate, serial mismatch, conflicting claims, etc.)..."
                    maxLength={1000}
                    className="input text-xs w-full resize-none p-3 border-[#FBCFE8] focus:border-[#EC4899]"
                    disabled={isRejecting}
                  />
                  <div className="flex justify-end mt-1 text-[11px] text-[#777080]">
                    <span>{rejectionReason.length} / 1000</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18151F] mb-1.5 uppercase tracking-wider">
                    Internal Verification Notes <span className="text-[#777080] font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Optional notes for internal verification audit..."
                    maxLength={1000}
                    className="input text-xs w-full resize-none p-3"
                    disabled={isRejecting}
                  />
                </div>

                <div className="p-3 bg-[#FFF0F7] rounded-xl border border-[#FBCFE8] text-xs text-[#9D174D] leading-relaxed">
                  <span className="font-bold block mb-0.5">⚠️ Rejection Impact:</span>
                  Rejecting this claim records the reason and sets status to <span className="font-mono font-bold">REJECTED</span>.
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setClaimToReject(null)}
                    disabled={isRejecting}
                    className="btn-secondary text-xs py-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRejecting || !rejectionReason.trim()}
                    className="btn-danger text-xs py-3 flex items-center justify-center gap-2"
                  >
                    {isRejecting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Rejecting...</span>
                      </>
                    ) : (
                      <>
                        <span>❌ Confirm Rejection</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OfficerDashboard;
