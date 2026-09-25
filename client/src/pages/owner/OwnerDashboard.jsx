import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { getMyItems } from '../../api/itemApi';
import { ITEM_CATEGORIES } from '../../config/constants';
import QRModal from '../../components/items/QRModal';

/**
 * OwnerDashboard — Clean, Modern, Light & Colorful Dashboard
 * - Background: #F8F7FF
 * - Colored status cards (Lavender, Pink, Orange, Green)
 * - Clean white item cards with subtle lavender borders
 * - Real-time search & Category filters
 * - QR preview triggers & copyable Tag IDs
 */
const OwnerDashboard = () => {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItemForQR, setSelectedItemForQR] = useState(null);

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

  useEffect(() => {
    fetchItems();
  }, []);

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
              label: 'Items Found',
              value: foundCount,
              color: 'text-[#F97316]',
              bg: 'bg-[#FFF4E8]',
              border: 'border-[#FED7AA]',
              glow: 'hover:border-[#F97316]/50',
              icon: '🔍',
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
    </div>
  );
};

export default OwnerDashboard;
