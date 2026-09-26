import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { getMyItems, markItemLost, getMyFoundReports, getMyClaims, submitOwnershipClaim } from '../../api/itemApi';
import { ITEM_CATEGORIES } from '../../config/constants';
import QRModal from '../../components/items/QRModal';

/**
 * OwnerDashboard — Clean, Modern, Light & Colorful Dashboard
 * - Background: #F8F7FF
 * - Colored status cards (Lavender, Pink, Orange, Green)
 * - Clean white item cards with subtle lavender borders
 * - Real-time search & Category filters
 * - QR preview triggers & copyable Tag IDs
 * - Found Reports recovery leads viewer
 * - Ownership Claim Submission Flow
 */
const OwnerDashboard = () => {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItemForQR, setSelectedItemForQR] = useState(null);
  const [itemToMarkLost, setItemToMarkLost] = useState(null);
  const [isMarkingLost, setIsMarkingLost] = useState(false);

  // Found Reports state
  const [foundReports, setFoundReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState('');

  // Ownership Claims state
  const [claims, setClaims] = useState([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  const [claimModalReport, setClaimModalReport] = useState(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await getMyItems();
      setItems(res.data?.items || []);
    } catch (error) {
      toast.error('Failed to load registered items');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFoundReports = async () => {
    try {
      setIsLoadingReports(true);
      setReportsError('');
      const res = await getMyFoundReports();
      setFoundReports(res.data?.reports || []);
    } catch (error) {
      setReportsError('Failed to load found reports');
    } finally {
      setIsLoadingReports(false);
    }
  };

  const fetchClaims = async () => {
    try {
      setIsLoadingClaims(true);
      const res = await getMyClaims();
      setClaims(res.data?.claims || []);
    } catch (error) {
      console.error('Failed to load claims', error);
    } finally {
      setIsLoadingClaims(false);
    }
  };

  const handleConfirmMarkLost = async () => {
    if (!itemToMarkLost) return;
    try {
      setIsMarkingLost(true);
      const res = await markItemLost(itemToMarkLost._id);
      const updatedItem = res.data?.item;

      // Update item status immediately in local state
      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemToMarkLost._id
            ? { ...item, status: updatedItem?.status || 'LOST' }
            : item
        )
      );

      toast.success(res.message || 'Item marked as lost successfully');
      setItemToMarkLost(null);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Failed to mark item as lost';
      toast.error(errorMsg);
    } finally {
      setIsMarkingLost(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchFoundReports();
    fetchClaims();
  }, []);

  const getClaimForReport = (report) => {
    if (!report) return null;
    return claims.find(
      (c) =>
        (c.foundReport?._id && report._id && c.foundReport._id.toString() === report._id.toString()) ||
        (c.foundReport && report._id && c.foundReport.toString() === report._id.toString()) ||
        (c.item?._id && report.item?._id && c.item._id.toString() === report.item._id.toString()) ||
        (c.item && report.item?._id && c.item.toString() === report.item._id.toString()) ||
        (c.item?.tagId && report.item?.tagId && c.item.tagId === report.item.tagId)
    );
  };

  const handleOpenClaimModal = (report) => {
    setClaimModalReport(report);
    setClaimMessage('');
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimModalReport || !claimModalReport.item?.tagId) return;

    try {
      setIsSubmittingClaim(true);
      const payload = {
        foundReportId: claimModalReport._id,
        claimMessage: claimMessage.trim(),
      };
      const res = await submitOwnershipClaim(claimModalReport.item.tagId, payload);
      toast.success(res.message || 'Ownership claim submitted successfully');

      if (res.data?.claim) {
        setClaims((prev) => [res.data.claim, ...prev.filter((c) => c._id !== res.data.claim._id)]);
      }

      setClaimModalReport(null);
      setClaimMessage('');
      fetchClaims();
      fetchFoundReports();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit ownership claim';
      toast.error(errorMsg);
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // Filter items client-side for smooth real-time searching
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchTerm.trim() ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      item.tagId.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase().trim()));

    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate dynamic stats
  const totalCount = items.length;
  const lostCount = items.filter((i) => i.status === 'LOST').length;
  const foundCount = items.filter((i) => i.status === 'FOUND').length;
  const returnedCount = items.filter((i) => i.status === 'RETURNED').length;

  const handleCopyTagId = (tagId, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tagId);
    toast.success(`Tag ID ${tagId} copied!`);
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
    <div className="relative min-h-screen bg-[#F8F7FF] text-[#18151F] py-10 px-4 sm:px-6 lg:px-8 page-transition">

      {/* Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-[20%] left-[5%] w-[600px] h-[600px] bg-[#EC4899]/5 rounded-full blur-[160px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">

        {/* ── Welcome Header & Register Action ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9DFFF] animate-slide-up">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899] animate-pulse" />
              <span className="text-xs font-bold text-[#8B5CF6] tracking-wider uppercase">
                Owner Command Center
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18151F] tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-[#5B5568] text-sm mt-1">
              Manage your registered items, view digital tags, and print recovery QR codes.
            </p>
          </div>

          <div>
            <Link
              to="/items/register"
              className="btn-primary py-3 px-6 flex items-center gap-2 text-sm shadow-[0_4px_16px_rgba(139,92,246,0.35)]"
            >
              <span>✨</span>
              <span>+ Register New Item</span>
            </Link>
          </div>
        </div>

        {/* ── Dynamic Status Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {[
            {
              label: 'Total Registered',
              value: totalCount,
              color: 'text-[#8B5CF6]',
              bg: 'bg-[#F3EEFF]',
              border: 'border-[#DDD3F5]',
              glow: 'hover:border-[#8B5CF6]/50',
              icon: '📦',
            },
            {
              label: 'Items Lost',
              value: lostCount,
              color: 'text-[#EC4899]',
              bg: 'bg-[#FFF0F7]',
              border: 'border-[#FBCFE8]',
              glow: 'hover:border-[#EC4899]/50',
              icon: '⚠️',
            },
            {
              label: 'Found Reports',
              value: foundReports.length,
              color: 'text-[#F97316]',
              bg: 'bg-[#FFF4E8]',
              border: 'border-[#FED7AA]',
              glow: 'hover:border-[#F97316]/50',
              icon: '📢',
            },
            {
              label: 'Safely Returned',
              value: returnedCount,
              color: 'text-[#10B981]',
              bg: 'bg-[#ECFDF5]',
              border: 'border-[#A7F3D0]',
              glow: 'hover:border-[#10B981]/50',
              icon: '✅',
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`p-5 rounded-[22px] ${card.bg} border ${card.border} ${card.glow} shadow-soft-sm transition-all duration-300 hover:shadow-soft-md hover:-translate-y-1`}
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

        {/* ── Found Reports Section ────────────────────────────────────────── */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#18151F] flex items-center gap-2">
                <span>📢</span>
                <span>Found Reports</span>
              </h2>
              <span className="text-xs font-mono font-bold bg-[#FFF0F7] text-[#EC4899] border border-[#FBCFE8] px-2.5 py-0.5 rounded-full">
                {isLoadingReports ? '...' : foundReports.length}
              </span>
              {foundReports.length > 0 && (
                <span className="text-[11px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  Recovery Leads Available
                </span>
              )}
            </div>

            <button
              onClick={fetchFoundReports}
              disabled={isLoadingReports}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto"
              title="Refresh Found Reports"
            >
              <span className={isLoadingReports ? 'animate-spin inline-block' : ''}>🔄</span>
              <span>{isLoadingReports ? 'Refreshing...' : 'Refresh Reports'}</span>
            </button>
          </div>

          {isLoadingReports ? (
            /* Loading State */
            <div className="rounded-[24px] p-12 bg-white border border-[#E9DFFF] text-center shadow-soft-sm">
              <div className="w-8 h-8 border-3 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#5B5568] font-medium">Checking for finder reports...</p>
            </div>
          ) : reportsError ? (
            /* Error State */
            <div className="rounded-[24px] p-8 bg-white border border-[#FBCFE8] text-center shadow-soft-sm">
              <div className="text-3xl mb-2">⚠️</div>
              <h3 className="text-sm font-bold text-[#18151F] mb-1">Failed to Load Reports</h3>
              <p className="text-xs text-[#5B5568] mb-4">{reportsError}</p>
              <button
                onClick={fetchFoundReports}
                className="btn-secondary text-xs py-2 px-4"
              >
                Try Again
              </button>
            </div>
          ) : foundReports.length === 0 ? (
            /* Empty State */
            <div className="rounded-[24px] p-10 bg-white border border-[#E9DFFF] text-center shadow-soft-sm">
              <div className="text-4xl mb-3">📬</div>
              <h3 className="text-base font-bold text-[#18151F] mb-1">No Found Reports Yet</h3>
              <p className="text-xs text-[#5B5568] max-w-md mx-auto leading-relaxed font-normal">
                When someone scans the QR code or Tag ID of one of your LOST items and submits a report, the finder's contact details and location will appear here immediately.
              </p>
            </div>
          ) : (
            /* Reports Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {foundReports.map((report, idx) => {
                const activeClaim = getClaimForReport(report);
                return (
                  <div
                    key={report._id}
                    className="rounded-[22px] p-6 bg-white border border-[#E9DFFF] hover:border-[#8B5CF6]/50 shadow-soft-sm hover:shadow-soft-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 animate-slide-up relative overflow-hidden"
                    style={{ animationDelay: `${Math.min((idx + 1) * 60, 400)}ms` }}
                  >
                    {/* Subtle Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316]" />

                    <div className="space-y-4">
                      {/* Header: Item Name, Category & Visual LOST Indicator */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold bg-[#FFF0F7] text-[#EC4899] border border-[#FBCFE8] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              <span>⚠️</span>
                              <span>LOST Item</span>
                            </span>
                            {report.item?.category && (
                              <span className="text-[11px] font-bold bg-[#F8F7FF] text-[#8B5CF6] border border-[#DDD3F5] px-2 py-0.5 rounded-full">
                                {report.item.category}
                              </span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-[#18151F] text-lg">
                            {report.item?.itemName || 'Item'}
                          </h3>
                        </div>

                        {/* Report Status Badge */}
                        <div className="text-right">
                          <span className="badge bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0] uppercase font-bold text-[10px]">
                            {report.status || 'SUBMITTED'}
                          </span>
                        </div>
                      </div>

                      {/* Tag ID Display */}
                      <div className="p-3 bg-[#F8F7FF] rounded-xl border border-[#DDD3F5] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#777080] block tracking-wider">
                            Target Tag ID
                          </span>
                          <span className="font-mono text-sm font-extrabold text-[#8B5CF6] tracking-wider">
                            {report.item?.tagId || 'N/A'}
                          </span>
                        </div>
                        {report.item?.tagId && (
                          <button
                            onClick={(e) => handleCopyTagId(report.item.tagId, e)}
                            className="btn-secondary text-[11px] py-1 px-2.5"
                            title="Copy Tag ID"
                          >
                            📋 Copy Tag
                          </button>
                        )}
                      </div>

                      {/* Finder Contact Information Box */}
                      <div className="p-4 bg-[#FFF8FA] rounded-xl border border-[#FCE7F3] space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#FBCFE8] pb-2">
                          <span className="text-xs font-bold text-[#9D174D] flex items-center gap-1.5">
                            <span>👤</span>
                            <span>Finder Details</span>
                          </span>
                          <span className="text-xs font-bold text-[#18151F]">
                            {report.finderName}
                          </span>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#777080] font-medium flex items-center gap-1">
                            <span>📞</span> Phone:
                          </span>
                          <a
                            href={`tel:${report.finderPhone}`}
                            className="font-bold text-[#8B5CF6] hover:underline font-mono"
                          >
                            {report.finderPhone}
                          </a>
                        </div>

                        {/* Email (if available) */}
                        {report.finderEmail && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#777080] font-medium flex items-center gap-1">
                              <span>✉️</span> Email:
                            </span>
                            <a
                              href={`mailto:${report.finderEmail}`}
                              className="font-bold text-[#8B5CF6] hover:underline truncate max-w-[200px]"
                            >
                              {report.finderEmail}
                            </a>
                          </div>
                        )}

                        {/* Message / Location */}
                        {report.finderMessage && (
                          <div className="pt-2 border-t border-[#FBCFE8] text-xs">
                            <span className="text-[#777080] font-medium block mb-1">
                              💬 Finder Message / Location:
                            </span>
                            <p className="bg-white p-2.5 rounded-lg border border-[#FBCFE8] text-[#18151F] leading-relaxed italic font-normal">
                              "{report.finderMessage}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Ownership Claim Status / Action */}
                      <div className="pt-1">
                        {activeClaim ? (
                          <div className="p-3.5 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#15803D] flex items-center gap-1.5">
                                <span>✨</span>
                                <span>Claim Submitted</span>
                              </span>
                              <span className="badge bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC] font-mono text-[10px] font-extrabold uppercase">
                                {activeClaim.status || 'SUBMITTED'}
                              </span>
                            </div>
                            {activeClaim.claimMessage && (
                              <p className="text-xs text-[#166534] bg-white/80 p-2.5 rounded-lg border border-[#BBF7D0] font-normal leading-relaxed italic">
                                "{activeClaim.claimMessage}"
                              </p>
                            )}
                            <div className="text-[10px] text-[#15803D]/80 flex items-center justify-between pt-0.5">
                              <span>Claimed by You</span>
                              <span>{activeClaim.createdAt ? format(new Date(activeClaim.createdAt), 'MMM d, yyyy') : ''}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenClaimModal(report)}
                            className="w-full btn-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(139,92,246,0.25)]"
                          >
                            <span>🛡️</span>
                            <span>Submit Ownership Claim</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Footer: Date Submitted */}
                    <div className="pt-3 mt-4 border-t border-[#E9DFFF] flex items-center justify-between text-[11px] text-[#777080]">
                      <span className="flex items-center gap-1">
                        <span>🕒</span>
                        <span>Reported {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}</span>
                      </span>
                      <span className="font-semibold text-[#8B5CF6]">
                        Verified Lead
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── My Items Section ────────────────────────────────────────────── */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#18151F] flex items-center gap-2">
                <span>📦</span>
                <span>My Registered Items</span>
              </h2>
              <span className="text-xs font-mono font-bold bg-[#EEE7FF] text-[#8B5CF6] border border-[#DDD3F5] px-2.5 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>

            {items.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                {/* Search input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or Tag ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input py-2 px-3 text-xs w-full sm:w-64"
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

                {/* Category filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input py-2 px-3 text-xs w-full sm:w-48"
                >
                  <option value="">All Categories</option>
                  {ITEM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isLoading ? (
            /* Loading State */
            <div className="rounded-[24px] p-16 bg-white border border-[#E9DFFF] text-center shadow-soft-sm">
              <div className="w-10 h-10 border-3 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#5B5568] font-medium">Loading your registered tags...</p>
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="rounded-[24px] p-16 bg-white border border-[#E9DFFF] text-center shadow-soft-md animate-scale-in">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-[#18151F] mb-2">No Items Registered Yet</h3>
              <p className="text-[#5B5568] text-sm mb-6 max-w-md mx-auto font-normal">
                Register your valuable belongings to generate a collision-safe Tag ID and printable QR recovery code.
              </p>
              <Link to="/items/register" className="btn-primary inline-flex">
                + Register First Item
              </Link>
            </div>
          ) : filteredItems.length === 0 ? (
            /* No search results */
            <div className="rounded-[24px] p-12 bg-white border border-[#E9DFFF] text-center shadow-soft-sm animate-scale-in">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-base font-bold text-[#18151F]">No Matching Items Found</h3>
              <p className="text-xs text-[#5B5568] mt-1 mb-5">
                Try adjusting your search query or category filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="btn-secondary text-xs py-2 px-4"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Items Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, idx) => (
                <div
                  key={item._id}
                  className="rounded-[22px] p-6 bg-white border border-[#E9DFFF] hover:border-[#8B5CF6]/50 shadow-soft-sm hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 animate-slide-up"
                  style={{ animationDelay: `${Math.min((idx + 1) * 60, 400)}ms` }}
                >
                  <div>
                    {/* Header: Title & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-[#18151F] text-base line-clamp-1" title={item.itemName}>
                        {item.itemName}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>

                    {/* Category */}
                    <div className="mb-3">
                      <span className="text-[11px] font-bold bg-[#F8F7FF] text-[#8B5CF6] border border-[#DDD3F5] px-2.5 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>

                    {/* Description preview */}
                    {item.description ? (
                      <p className="text-xs text-[#5B5568] line-clamp-2 mb-4 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-xs text-[#777080] italic mb-4">No description provided</p>
                    )}
                  </div>

                  {/* Footer details: Tag ID, QR preview & actions */}
                  <div className="pt-4 border-t border-[#E9DFFF] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#777080] block tracking-wider">
                        Tag ID
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-sm font-extrabold text-[#8B5CF6] tracking-wider">
                          {item.tagId}
                        </span>
                        <button
                          onClick={(e) => handleCopyTagId(item.tagId, e)}
                          className="text-[#777080] hover:text-[#8B5CF6] p-1 rounded transition-colors duration-200 active:scale-90"
                          title="Copy Tag ID"
                          aria-label="Copy Tag ID"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                      {item.createdAt && (
                        <span className="text-[10px] text-[#777080] block mt-1 font-normal">
                          Added {format(new Date(item.createdAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>

                    {/* QR Code trigger */}
                    <button
                      onClick={() => setSelectedItemForQR(item)}
                      className="group relative flex flex-col items-center bg-[#F8F7FF] hover:bg-[#F3EEFF] p-2 rounded-xl border border-[#DDD3F5] hover:border-[#8B5CF6]/50 transition-all duration-200 shadow-soft-sm active:scale-95"
                      title="View & Print QR Code"
                    >
                      <img
                        src={item.qrCode}
                        alt={`QR ${item.tagId}`}
                        className="w-12 h-12 rounded-lg bg-white p-0.5 border border-slate-200 transition-transform duration-200 group-hover:scale-105"
                      />
                      <span className="text-[10px] font-bold text-[#8B5CF6] mt-1">
                        View QR
                      </span>
                    </button>
                  </div>

                  {/* Mark as Lost Action (Only for items whose status is REGISTERED) */}
                  {item.status === 'REGISTERED' && (
                    <div className="mt-4 pt-3 border-t border-[#F0EAF8]">
                      <button
                        onClick={() => setItemToMarkLost(item)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-[#EC4899] bg-[#FFF0F7] hover:bg-[#FCE7F3] border border-[#FBCFE8] hover:border-[#F472B6] transition-all duration-200 shadow-soft-sm active:scale-[0.98]"
                      >
                        <span>⚠️</span>
                        <span>Mark as Lost</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Profile Info Summary ────────────────────────────────────────── */}
        <div className="rounded-[24px] p-6 sm:p-8 bg-white border border-[#E9DFFF] shadow-soft-sm animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-sm font-bold text-[#18151F] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🛡️</span>
            <span>Account Profile & Security</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8F7FF] border border-[#DDD3F5]">
              <span className="text-[#777080] block mb-1 font-medium">Full Name</span>
              <p className="font-bold text-[#18151F] text-sm">{user?.name}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8F7FF] border border-[#DDD3F5]">
              <span className="text-[#777080] block mb-1 font-medium">Email Address</span>
              <p className="font-bold text-[#18151F] text-sm truncate">{user?.email}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8F7FF] border border-[#DDD3F5]">
              <span className="text-[#777080] block mb-1 font-medium">Assigned Role</span>
              <p className="mt-0.5">
                <span className="badge bg-[#EEE7FF] text-[#8B5CF6] border-[#DDD3F5] capitalize">
                  {user?.role}
                </span>
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8F7FF] border border-[#DDD3F5]">
              <span className="text-[#777080] block mb-1 font-medium">Verification Status</span>
              <p className="mt-0.5">
                <span className="badge bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]">
                  {user?.isActive ? 'Active Verified' : 'Suspended'}
                </span>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* QR Modal */}
      <QRModal
        item={selectedItemForQR}
        isOpen={Boolean(selectedItemForQR)}
        onClose={() => setSelectedItemForQR(null)}
      />

      {/* Confirmation Modal for Marking Item as LOST */}
      {itemToMarkLost && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !isMarkingLost && setItemToMarkLost(null)}
        >
          <div
            className="w-full max-w-md p-6 sm:p-7 rounded-[28px] bg-white border border-[#E9DFFF] shadow-soft-xl relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => !isMarkingLost && setItemToMarkLost(null)}
              disabled={isMarkingLost}
              className="absolute top-5 right-5 text-[#777080] hover:text-[#18151F] p-2 rounded-xl bg-[#F8F7FF] hover:bg-[#F3EEFF] transition-all duration-200 disabled:opacity-50"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              {/* Warning Icon Badge */}
              <div className="w-14 h-14 rounded-2xl bg-[#FFF0F7] border border-[#FBCFE8] flex items-center justify-center mx-auto mb-4 text-2xl shadow-soft-sm">
                ⚠️
              </div>

              <h3 className="text-xl font-extrabold text-[#18151F] mb-2">
                Mark Item as Lost?
              </h3>

              <p className="text-sm text-[#5B5568] mb-4">
                Are you sure you want to mark <span className="font-bold text-[#18151F]">{itemToMarkLost.itemName}</span> (<span className="font-mono font-bold text-[#8B5CF6]">{itemToMarkLost.tagId}</span>) as <span className="font-bold text-[#EC4899]">LOST</span>?
              </p>

              <div className="p-3 bg-[#FFF0F7] rounded-xl border border-[#FBCFE8] text-xs text-[#9D174D] mb-6 text-left leading-relaxed">
                <span className="font-bold block mb-0.5">ℹ️ What happens next:</span>
                The item status will be updated to LOST. Anyone who scans this item's QR code will be able to see that it is lost and can help you recover it.
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setItemToMarkLost(null)}
                  disabled={isMarkingLost}
                  className="btn-secondary text-xs py-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMarkLost}
                  disabled={isMarkingLost}
                  className="btn-danger text-xs py-3 flex items-center justify-center gap-2"
                >
                  {isMarkingLost ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Marking...</span>
                    </>
                  ) : (
                    <>
                      <span>⚠️ Confirm Lost</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ownership Claim Modal */}
      {claimModalReport && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !isSubmittingClaim && setClaimModalReport(null)}
        >
          <div
            className="w-full max-w-lg p-6 sm:p-7 rounded-[28px] bg-white border border-[#E9DFFF] shadow-soft-xl relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => !isSubmittingClaim && setClaimModalReport(null)}
              disabled={isSubmittingClaim}
              className="absolute top-5 right-5 text-[#777080] hover:text-[#18151F] p-2 rounded-xl bg-[#F8F7FF] hover:bg-[#F3EEFF] transition-all duration-200 disabled:opacity-50"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] border border-[#DDD3F5] flex items-center justify-center text-2xl shadow-soft-sm">
                  🛡️
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#18151F]">
                    Submit Ownership Claim
                  </h3>
                  <p className="text-xs text-[#5B5568]">
                    Verify and submit an ownership claim for your found item
                  </p>
                </div>
              </div>

              {/* Item & Finder Info Card */}
              <div className="p-4 bg-[#F8F7FF] rounded-2xl border border-[#DDD3F5] space-y-2 mb-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#777080] font-medium">Item Name:</span>
                  <span className="font-bold text-[#18151F]">{claimModalReport.item?.itemName || 'Item'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777080] font-medium">Tag ID:</span>
                  <span className="font-mono font-bold text-[#8B5CF6]">{claimModalReport.item?.tagId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777080] font-medium">Reported by Finder:</span>
                  <span className="font-semibold text-[#18151F]">{claimModalReport.finderName}</span>
                </div>
                {claimModalReport.finderPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#777080] font-medium">Finder Phone:</span>
                    <span className="font-mono text-[#5B5568]">{claimModalReport.finderPhone}</span>
                  </div>
                )}
              </div>

              {/* Claim Form */}
              <form onSubmit={handleSubmitClaim} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#18151F] mb-1.5 uppercase tracking-wider">
                    Claim Message / Proof Notes <span className="text-[#777080] font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    placeholder="Add details confirming your ownership (e.g. distinguishing marks, serial number, lock code, purchase details, or handover instructions)..."
                    maxLength={1000}
                    className="input text-xs w-full resize-none p-3"
                    disabled={isSubmittingClaim}
                  />
                  <div className="flex justify-end mt-1 text-[11px] text-[#777080]">
                    <span>{claimMessage.length} / 1000</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FFF8FA] rounded-xl border border-[#FCE7F3] text-xs text-[#9D174D] leading-relaxed">
                  <span className="font-bold block mb-0.5">ℹ️ What happens next:</span>
                  Your claim will be recorded with status <span className="font-mono font-bold">SUBMITTED</span> and associated with this found report lead.
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setClaimModalReport(null)}
                    disabled={isSubmittingClaim}
                    className="btn-secondary text-xs py-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingClaim}
                    className="btn-primary text-xs py-3 flex items-center justify-center gap-2"
                  >
                    {isSubmittingClaim ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Claim...</span>
                      </>
                    ) : (
                      <>
                        <span>🛡️ Submit Claim</span>
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

export default OwnerDashboard;
