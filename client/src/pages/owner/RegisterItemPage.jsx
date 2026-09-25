import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerItem } from '../../api/itemApi';
import { ITEM_CATEGORIES } from '../../config/constants';
import QRModal from '../../components/items/QRModal';

const RegisterItemPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    itemName: '',
    category: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registeredItem, setRegisteredItem] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    } else if (form.itemName.trim().length < 2) {
      newErrors.itemName = 'Item name must be at least 2 characters';
    } else if (form.itemName.trim().length > 100) {
      newErrors.itemName = 'Item name cannot exceed 100 characters';
    }

    if (!form.category) {
      newErrors.category = 'Please select an item category';
    }

    if (form.description && form.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerItem({
        itemName: form.itemName.trim(),
        category: form.category,
        description: form.description.trim(),
      });

      const item = response.data.item;
      setRegisteredItem(item);
      toast.success('Item registered successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to register item. Please try again.';
      const fieldErrors = error.response?.data?.errors || [];
      if (fieldErrors.length > 0) {
        const mapped = {};
        fieldErrors.forEach((err) => {
          mapped[err.field] = err.message;
        });
        setErrors(mapped);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    setForm({
      itemName: '',
      category: '',
      description: '',
    });
    setErrors({});
    setRegisteredItem(null);
  };

  const handleCopyTagId = () => {
    if (registeredItem?.tagId) {
      navigator.clipboard.writeText(registeredItem.tagId);
      toast.success('Tag ID copied to clipboard!');
    }
  };

  const handleDownloadQR = () => {
    if (!registeredItem) return;
    try {
      const link = document.createElement('a');
      link.href = registeredItem.qrCode;
      link.download = `${registeredItem.tagId}-QRCode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR Code downloaded!');
    } catch (err) {
      toast.error('Failed to download QR code');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F7FF] text-[#18151F] py-10 px-4 sm:px-6 lg:px-8 page-transition">

      {/* Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] bg-[#EC4899]/5 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto animate-slide-up">

        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8B5CF6] hover:text-[#EC4899] transition-colors duration-200"
          >
            ← Back to Dashboard
          </Link>
          <span className="text-[11px] font-mono text-[#777080] font-semibold">
            Digital Tag Generator
          </span>
        </div>

        {!registeredItem ? (
          /* 2-Column Layout on Desktop: Form (Left) + Digital Tag Preview (Right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Form Card */}
            <div className="lg:col-span-7 rounded-[24px] p-8 sm:p-10 bg-white border border-[#E9DFFF] shadow-soft-lg">

              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEE7FF] text-[#8B5CF6] text-xs font-bold mb-3 border border-[#DDD3F5]">
                  <span>📦</span>
                  <span>Register Your Item</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18151F] tracking-tight">
                  Register a New Item
                </h1>
                <p className="text-[#5B5568] text-sm mt-1 font-normal">
                  Enter your item details to generate a collision-safe Tag ID and QR code.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-6">

                {/* Item Name */}
                <div>
                  <label htmlFor="itemName" className="block text-xs font-bold text-[#18151F] uppercase tracking-wider mb-2">
                    Item Name <span className="text-[#F43F5E]">*</span>
                  </label>
                  <input
                    id="itemName"
                    name="itemName"
                    type="text"
                    value={form.itemName}
                    onChange={handleChange}
                    placeholder="e.g. MacBook Pro 16, Blue Samsonite Luggage, Car Keys"
                    className={`input ${errors.itemName ? 'input-error' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.itemName ? (
                    <p className="mt-1.5 text-xs text-[#F43F5E] flex items-center gap-1 font-medium">
                      <span>⚠️</span> {errors.itemName}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-[#777080] font-normal">A clear, identifiable name for your item.</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-xs font-bold text-[#18151F] uppercase tracking-wider mb-2">
                    Category <span className="text-[#F43F5E]">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={`input ${errors.category ? 'input-error' : ''}`}
                    disabled={isLoading}
                  >
                    <option value="">-- Select a Category --</option>
                    {ITEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1.5 text-xs text-[#F43F5E] flex items-center gap-1 font-medium">
                      <span>⚠️</span> {errors.category}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-xs font-bold text-[#18151F] uppercase tracking-wider mb-2">
                    Distinguishing Features & Description <span className="text-[#777080] normal-case font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Provide color, brand, stickers, special marks, or serial numbers..."
                    className={`input ${errors.description ? 'input-error' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.description ? (
                    <p className="mt-1.5 text-xs text-[#F43F5E] flex items-center gap-1 font-medium">
                      <span>⚠️</span> {errors.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-[#777080] font-normal">
                      Max 1000 characters. These details help verify ownership if the item is lost.
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary w-full sm:w-1/3 py-3.5"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-2/3 py-3.5 text-sm font-bold shadow-[0_4px_16px_rgba(139,92,246,0.35)]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Digital Tag...</span>
                      </div>
                    ) : (
                      '✨ Register & Generate QR Tag'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Digital Tag Preview (Live mockup) */}
            <div className="lg:col-span-5 rounded-[24px] p-8 bg-[#F3EEFF] border border-[#DDD3F5] shadow-soft-md text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#8B5CF6] text-xs font-bold mb-4 border border-[#DDD3F5]">
                <span>🏷️</span>
                <span>Digital Tag Preview</span>
              </div>

              {/* Tag Preview Card */}
              <div className="p-5 bg-white rounded-2xl border border-[#E9DFFF] shadow-soft-md max-w-[280px] mx-auto text-center">
                <div className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider mb-1">
                  TAGTRACK RECOVERY TAG
                </div>
                <div className="text-sm font-extrabold text-[#18151F] truncate">
                  {form.itemName.trim() || 'Item Name Preview'}
                </div>
                <div className="text-[11px] text-[#777080] mb-3">
                  {form.category || 'Category Preview'}
                </div>

                {/* Mini QR Mockup */}
                <div className="p-3 bg-[#F8F7FF] rounded-xl inline-block border border-[#DDD3F5] mb-3">
                  <svg className="w-28 h-28 mx-auto" viewBox="0 0 100 100" fill="#18151F">
                    <rect width="100" height="100" fill="#F8F7FF" />
                    <rect x="10" y="10" width="26" height="26" fill="#18151F" rx="2" />
                    <rect x="14" y="14" width="18" height="18" fill="#F8F7FF" rx="1" />
                    <rect x="18" y="18" width="10" height="10" fill="#8B5CF6" rx="1" />
                    <rect x="64" y="10" width="26" height="26" fill="#18151F" rx="2" />
                    <rect x="68" y="14" width="18" height="18" fill="#F8F7FF" rx="1" />
                    <rect x="72" y="18" width="10" height="10" fill="#A855F7" rx="1" />
                    <rect x="10" y="64" width="26" height="26" fill="#18151F" rx="2" />
                    <rect x="14" y="68" width="18" height="18" fill="#F8F7FF" rx="1" />
                    <rect x="18" y="72" width="10" height="10" fill="#EC4899" rx="1" />
                    <rect x="42" y="12" width="6" height="6" fill="#18151F" />
                    <rect x="52" y="12" width="6" height="14" fill="#A855F7" />
                    <rect x="42" y="40" width="14" height="14" fill="#18151F" rx="1" />
                    <rect x="62" y="52" width="16" height="6" fill="#10B981" />
                    <rect x="42" y="82" width="24" height="6" fill="#18151F" />
                  </svg>
                </div>

                {/* Tag ID Mockup */}
                <div className="font-mono text-sm font-extrabold text-[#8B5CF6] tracking-widest bg-[#F8F7FF] py-1.5 px-3 rounded-lg border border-[#DDD3F5]">
                  TT-XXXXXX
                </div>
                <span className="text-[10px] text-[#777080] block mt-2">
                  Auto-generated upon registration
                </span>
              </div>

              <div className="mt-6 text-left space-y-2.5 text-xs text-[#5B5568]">
                <div className="flex items-center gap-2">
                  <span className="text-[#8B5CF6] font-bold">✓</span>
                  <span>Unique cryptographic ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#EC4899] font-bold">✓</span>
                  <span>Printable PNG tag export</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <span>Instant finder lookup support</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Registration Success Display */
          <div className="max-w-2xl mx-auto rounded-[28px] p-8 sm:p-10 bg-white border border-[#E9DFFF] text-center shadow-soft-xl animate-scale-in">

            <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#10B981] flex items-center justify-center mx-auto mb-4 text-3xl shadow-soft-sm">
              ✅
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18151F] tracking-tight mb-1">
              Item Registered Successfully!
            </h1>
            <p className="text-[#5B5568] text-sm mb-8 font-normal">
              Your item is now registered with a unique cryptographic Tag ID and QR code.
            </p>

            {/* Item Summary Card */}
            <div className="rounded-2xl p-6 sm:p-8 bg-[#F8F7FF] border border-[#DDD3F5] mb-6">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#18151F]">{registeredItem.itemName}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="badge bg-[#EEE7FF] text-[#8B5CF6] border-[#DDD3F5]">
                    {registeredItem.category}
                  </span>
                  <span className="badge-registered">REGISTERED</span>
                </div>
              </div>

              {/* QR Code image */}
              <div className="p-4 bg-white rounded-2xl inline-block shadow-soft-md mb-5 border border-[#E9DFFF] transition-transform duration-300 hover:scale-105">
                <img
                  src={registeredItem.qrCode}
                  alt={`QR code for ${registeredItem.tagId}`}
                  className="w-56 h-56 mx-auto rounded-xl"
                />
              </div>

              {/* Tag ID box with copy button */}
              <div className="max-w-md mx-auto bg-white rounded-xl p-3.5 border border-[#DDD3F5] shadow-soft-sm flex items-center justify-between">
                <div className="text-left pl-2">
                  <span className="text-[10px] uppercase font-bold text-[#777080] tracking-wider">
                    Generated Tag ID
                  </span>
                  <p className="font-mono text-xl font-extrabold text-[#8B5CF6] tracking-wider">
                    {registeredItem.tagId}
                  </p>
                </div>
                <button
                  onClick={handleCopyTagId}
                  className="btn-secondary text-xs py-2 px-3.5"
                  title="Copy Tag ID"
                >
                  📋 Copy
                </button>
              </div>

              {registeredItem.description && (
                <p className="text-xs text-[#5B5568] mt-4 text-left bg-white p-3.5 rounded-xl border border-[#E9DFFF]">
                  <strong className="text-[#18151F]">Description:</strong> {registeredItem.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleDownloadQR}
                className="btn-secondary py-3.5 flex items-center justify-center gap-2"
              >
                <span>📥</span> Download QR (PNG)
              </button>
              <button
                onClick={() => setShowQRModal(true)}
                className="btn-primary py-3.5 flex items-center justify-center gap-2"
              >
                <span>🖨️</span> Print Recovery Tag
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleRegisterAnother}
                className="btn-secondary w-full py-3 text-xs"
              >
                + Register Another Item
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary w-full py-3 text-xs"
              >
                Go to My Items (Dashboard) →
              </button>
            </div>
          </div>
        )}

        {/* QR Modal for Print / Full View */}
        <QRModal
          item={registeredItem}
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
        />

      </div>
    </div>
  );
};

export default RegisterItemPage;
