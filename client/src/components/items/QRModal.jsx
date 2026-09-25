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
              border: 2px dashed #8B5CF6;
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              background: #ffffff;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .tag-header {
              font-size: 14px;
              font-weight: 700;
              color: #8B5CF6;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .item-title {
              font-size: 18px;
              font-weight: 800;
              color: #18151F;
              margin: 4px 0;
            }
            .category {
              font-size: 12px;
              color: #5B5568;
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
              color: #8B5CF6;
              margin: 14px 0 6px 0;
            }
            .instructions {
              font-size: 11px;
              color: #5B5568;
              line-height: 1.4;
            }
            .footer {
              margin-top: 14px;
              font-size: 10px;
              color: #777080;
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 sm:p-8 rounded-[28px] bg-white border border-[#E9DFFF] shadow-soft-xl relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#777080] hover:text-[#18151F] p-2 rounded-xl bg-[#F8F7FF] hover:bg-[#F3EEFF] transition-all duration-200 active:scale-90"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#EEE7FF] text-[#8B5CF6] border border-[#DDD3F5] px-3 py-1 rounded-full text-xs font-bold mb-3">
            <span>🏷️</span>
            <span>Digital Tag & QR Code</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-[#18151F] mb-1">{item.itemName}</h3>
          <p className="text-xs text-[#5B5568] mb-5 font-medium">{item.category}</p>

          {/* QR Code Frame */}
          <div className="p-4 bg-[#F8F7FF] rounded-2xl shadow-soft-sm border border-[#DDD3F5] inline-block mb-5 transition-transform duration-300 hover:scale-105">
            <img
              src={item.qrCode}
              alt={`QR Code for ${item.tagId}`}
              className="w-56 h-56 mx-auto rounded-xl bg-white p-1"
            />
          </div>

          {/* Tag ID Display with Copy */}
          <div className="bg-[#F8F7FF] rounded-xl p-3.5 border border-[#DDD3F5] mb-4 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-[#777080] block uppercase tracking-wider">
                Unique Tag ID
              </span>
              <span className="font-mono text-lg font-extrabold text-[#8B5CF6] tracking-wider">
                {item.tagId}
              </span>
            </div>
            <button
              onClick={handleCopyTagId}
              className="btn-secondary text-xs py-1.5 px-3.5"
              title="Copy Tag ID"
            >
              📋 Copy
            </button>
          </div>

          {item.description && (
            <p className="text-xs text-[#5B5568] mb-5 bg-[#F8F7FF] p-3 rounded-xl border border-[#DDD3F5] text-left leading-relaxed font-normal">
              <span className="font-bold text-[#18151F] block mb-0.5">Description:</span>
              {item.description}
            </p>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleDownload} className="btn-secondary text-xs py-3">
              📥 Download PNG
            </button>
            <button onClick={handlePrint} className="btn-primary text-xs py-3">
              🖨️ Print Recovery Tag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
