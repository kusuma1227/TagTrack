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
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Navigation Breadcrumb / Back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Dashboard
          </Link>
          <span className="text-xs text-gray-400">Phase 2 · Item Registration</span>
        </div>

        {!registeredItem ? (
          /* Registration Form */
          <div className="card p-8">
            <div className="mb-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
                📦
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Register a New Item</h1>
              <p className="text-gray-500 text-sm mt-1">
                Enter your item details to generate a collision-safe Tag ID and QR code.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Item Name */}
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Item Name <span className="text-red-500">*</span>
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
                  <p className="mt-1 text-xs text-red-600">{errors.itemName}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">A clear, identifiable name for your item.</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
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
                {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-xs text-gray-400">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Provide distinguishing features, color, brand, serial number, stickers, or special marks..."
                  className={`input ${errors.description ? 'input-error' : ''}`}
                  disabled={isLoading}
                />
                {errors.description ? (
                  <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">
                    Max 1000 characters. These details help verify ownership if the item is lost.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary w-full sm:w-1/3 py-3"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary w-full sm:w-2/3 py-3 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registering & Generating Tag...
                    </>
                  ) : (
                    '✨ Register & Generate QR Tag'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Registration Success Display */
          <div className="card p-8 text-center border-indigo-200">
            <div className="w-14 h-14 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Item Registered Successfully!</h1>
            <p className="text-gray-500 text-sm mb-6">
              Your item has been assigned a unique Tag ID and QR code.
            </p>

            {/* Item Summary Card */}
            <div className="bg-indigo-50/60 rounded-2xl p-6 border border-indigo-100 mb-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">{registeredItem.itemName}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="badge bg-indigo-100 text-indigo-700">{registeredItem.category}</span>
                  <span className="badge-registered">REGISTERED</span>
                </div>
              </div>

              {/* QR Code image */}
              <div className="p-3 bg-white rounded-2xl inline-block shadow-sm border border-gray-200 mb-4">
                <img
                  src={registeredItem.qrCode}
                  alt={`QR code for ${registeredItem.tagId}`}
                  className="w-56 h-56 mx-auto rounded-lg"
                />
              </div>

              {/* Tag ID box with copy button */}
              <div className="max-w-md mx-auto bg-white rounded-xl p-3 border border-indigo-200 flex items-center justify-between shadow-xs">
                <div className="text-left pl-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Generated Tag ID
                  </span>
                  <p className="font-mono text-xl font-extrabold text-indigo-950 tracking-wider">
                    {registeredItem.tagId}
                  </p>
                </div>
                <button
                  onClick={handleCopyTagId}
                  className="btn-secondary text-xs py-2 px-3"
                  title="Copy Tag ID"
                >
                  📋 Copy
                </button>
              </div>

              {registeredItem.description && (
                <p className="text-xs text-gray-600 mt-4 text-left bg-white/80 p-3 rounded-lg border border-indigo-50">
                  <strong className="text-gray-700">Description:</strong> {registeredItem.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleDownloadQR}
                className="btn-secondary py-3 flex items-center justify-center gap-2"
              >
                <span>📥</span> Download QR (PNG)
              </button>
              <button
                onClick={() => setShowQRModal(true)}
                className="btn-primary py-3 flex items-center justify-center gap-2"
              >
                <span>🖨️</span> Print Recovery Tag
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleRegisterAnother}
                className="btn-secondary w-full py-2.5 text-sm"
              >
                + Register Another Item
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary w-full py-2.5 text-sm bg-gray-900 hover:bg-black"
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
