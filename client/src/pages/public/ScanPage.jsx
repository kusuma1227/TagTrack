import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * ScanPage — Public page for searching a lost item by Tag ID.
 * Phase 1: Manual Tag ID entry only.
 * Phase 9: QR camera scan will be added here.
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Find a Lost Item</h1>
          <p className="text-gray-500 text-sm">
            Enter the Tag ID printed on the item's label or QR code.
            No account required.
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="tagId" className="block text-sm font-medium text-gray-700 mb-1.5">
                Tag ID
              </label>
              <input
                id="tagId"
                type="text"
                value={tagId}
                onChange={(e) => { setTagId(e.target.value); setError(''); }}
                className={`input uppercase tracking-widest text-center text-lg font-mono ${
                  error ? 'input-error' : ''
                }`}
                placeholder="TT-A3F2K9"
                maxLength={9}
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              <p className="mt-1.5 text-xs text-gray-400">Format: TT- followed by 6 characters</p>
            </div>
            <button type="submit" className="btn-primary w-full py-3">
              Search Item
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          📷 QR camera scanning coming in the next update
        </p>
      </div>
    </div>
  );
};

export default ScanPage;
