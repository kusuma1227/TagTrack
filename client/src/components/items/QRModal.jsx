import React from 'react';
import toast from 'react-hot-toast';

const QRModal = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  const handleCopyTagId = () => {
    navigator.clipboard.writeText(item.tagId);
    toast.success('Tag ID copied to clipboard!');
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = item.qrCode;
      link.download = `${item.tagId}-QRCode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR Code downloaded!');
    } catch (err) {
      toast.error('Failed to download QR code');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print your tag');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TagTrack - ${item.tagId} - ${item.itemName}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f9fafb;
            }
            .tag-card {
              width: 320px;
              border: 2px dashed #4f46e5;
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              background: #ffffff;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .tag-header {
              font-size: 14px;
              font-weight: 700;
              color: #4f46e5;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .item-title {
              font-size: 18px;
              font-weight: 800;
              color: #111827;
              margin: 4px 0;
            }
            .category {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 16px;
            }
            .qr-image {
              width: 220px;
              height: 220px;
              margin: 0 auto;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }
            .tag-id {
              font-family: monospace;
              font-size: 22px;
              font-weight: 800;
              letter-spacing: 2px;
              color: #1e1b4b;
              margin: 14px 0 6px 0;
            }
            .instructions {
              font-size: 11px;
              color: #4b5563;
              line-height: 1.4;
            }
            .footer {
              margin-top: 14px;
              font-size: 10px;
              color: #9ca3af;
            }
            @media print {
              body { background: transparent; }
              .tag-card { box-shadow: none; border-color: #000; }
            }
          </style>
        </head>
        <body>
          <div class="tag-card">
            <div class="tag-header">🏷️ TAGTRACK RECOVERY TAG</div>
            <div class="item-title">${item.itemName}</div>
            <div class="category">${item.category}</div>
            <img class="qr-image" src="${item.qrCode}" alt="QR Code" />
            <div class="tag-id">${item.tagId}</div>
            <div class="instructions">
              If found, scan QR code or search Tag ID at TagTrack to safely return this item to its owner.
            </div>
            <div class="footer">Protected by TagTrack</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-6 bg-white relative animate-in fade-in zoom-in duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <span>🏷️</span>
            <span>Tag & QR Code</span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">{item.itemName}</h3>
          <p className="text-xs text-gray-500 mb-4">{item.category}</p>

          {/* QR Code Frame */}
          <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 inline-block mb-4">
            <img
              src={item.qrCode}
              alt={`QR Code for ${item.tagId}`}
              className="w-56 h-56 mx-auto rounded-xl bg-white shadow-sm"
            />
          </div>

          {/* Tag ID Display with Copy */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] font-medium text-gray-400 block uppercase tracking-wider">
                Unique Tag ID
              </span>
              <span className="font-mono text-lg font-bold text-indigo-900 tracking-wider">
                {item.tagId}
              </span>
            </div>
            <button
              onClick={handleCopyTagId}
              className="btn-secondary text-xs py-1.5 px-3"
              title="Copy Tag ID"
            >
              📋 Copy
            </button>
          </div>

          {item.description && (
            <p className="text-xs text-gray-500 mb-5 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100 text-left">
              <span className="font-medium text-gray-700 block mb-0.5">Description:</span>
              {item.description}
            </p>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleDownload} className="btn-secondary text-sm py-2.5">
              📥 Download PNG
            </button>
            <button onClick={handlePrint} className="btn-primary text-sm py-2.5">
              🖨️ Print Tag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
