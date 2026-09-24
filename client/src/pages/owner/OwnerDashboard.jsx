import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { getMyItems } from '../../api/itemApi';
import { ITEM_CATEGORIES } from '../../config/constants';
import QRModal from '../../components/items/QRModal';

/**
 * OwnerDashboard — Phase 2:
 * - Dynamic stats calculated from registered items
 * - Functional "+ Register Item" button
 * - "My Items" section displaying owner's registered items
 * - Search, category filter, and interactive QR modal (copy/download/print)
 */
const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Welcome Header & Register Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your registered items, view Tag IDs, and print recovery QR codes.
            </p>
          </div>
          <div>
            <Link
              to="/items/register"
              className="btn-primary py-2.5 px-5 shadow-sm text-sm"
            >
              + Register Item
            </Link>
          </div>
        </div>

        {/* Dynamic Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Items', value: totalCount, color: 'text-gray-900', bg: 'bg-white' },
            { label: 'Lost', value: lostCount, color: 'text-amber-700', bg: 'bg-amber-50/50' },
            { label: 'Found', value: foundCount, color: 'text-blue-700', bg: 'bg-blue-50/50' },
            { label: 'Returned', value: returnedCount, color: 'text-green-700', bg: 'bg-green-50/50' },
          ].map((card) => (
            <div key={card.label} className={`card p-5 ${card.bg}`}>
              <div className={`text-3xl font-extrabold ${card.color}`}>
                {isLoading ? '-' : card.value}
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* ── My Items Section ──────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>📦</span>
              <span>My Items</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </h2>

            {items.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
                {/* Search input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or Tag ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input py-1.5 px-3 text-xs w-full sm:w-60"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input py-1.5 px-3 text-xs w-full sm:w-44"
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
            <div className="card p-12 text-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading your items...</p>
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">📦</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No items registered yet</h2>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                Register your first item to generate a unique Tag ID and QR code you can attach to your valuables.
              </p>
              <Link to="/items/register" className="btn-primary inline-flex">
                + Register Item
              </Link>
            </div>
          ) : filteredItems.length === 0 ? (
            /* No search results */
            <div className="card p-10 text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-sm font-semibold text-gray-800">No matching items found</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Try adjusting your search query or category filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Items Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="card p-5 hover:shadow-md transition-shadow flex flex-col justify-between border-gray-200"
                >
                  <div>
                    {/* Header: Title & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1" title={item.itemName}>
                        {item.itemName}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>

                    {/* Category */}
                    <div className="mb-3">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                        {item.category}
                      </span>
                    </div>

                    {/* Description preview */}
                    {item.description ? (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic mb-4">No description provided</p>
                    )}
                  </div>

                  {/* Footer details: Tag ID, QR preview & actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                        Tag ID
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-sm font-bold text-indigo-900">
                          {item.tagId}
                        </span>
                        <button
                          onClick={(e) => handleCopyTagId(item.tagId, e)}
                          className="text-gray-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
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
                        <span className="text-[10px] text-gray-400 block mt-1">
                          Added {format(new Date(item.createdAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>

                    {/* QR Code trigger */}
                    <button
                      onClick={() => setSelectedItemForQR(item)}
                      className="group relative flex flex-col items-center bg-indigo-50/70 hover:bg-indigo-100 p-2 rounded-xl border border-indigo-100 transition-colors"
                      title="View & Print QR Code"
                    >
                      <img
                        src={item.qrCode}
                        alt={`QR ${item.tagId}`}
                        className="w-12 h-12 rounded bg-white"
                      />
                      <span className="text-[9px] font-semibold text-indigo-700 mt-1">
                        View QR
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Name</span>
              <p className="font-medium text-gray-900 mt-0.5">{user?.name}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Email</span>
              <p className="font-medium text-gray-900 mt-0.5">{user?.email}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Role</span>
              <p className="mt-0.5">
                <span className="badge bg-indigo-100 text-indigo-700 capitalize">{user?.role}</span>
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Account Status</span>
              <p className="mt-0.5">
                <span className="badge bg-green-100 text-green-700">
                  {user?.isActive ? 'Active' : 'Suspended'}
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
