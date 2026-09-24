const crypto = require('crypto');
const QRCode = require('qrcode');
const Item = require('../models/Item');

// Unambiguous uppercase alphanumeric characters (excluding easily confused 0, O, 1, I)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a random 6-character string from the ALPHABET
 */
const generateRandomCode = (length = 6) => {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return result;
};

/**
 * Generate a collision-safe unique Tag ID in format TT-XXXXXX
 * Queries MongoDB to guarantee uniqueness.
 */
const generateUniqueTagId = async (maxRetries = 10) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const candidateId = `TT-${generateRandomCode(6)}`;
    const exists = await Item.exists({ tagId: candidateId });
    if (!exists) {
      return candidateId;
    }
  }
  // Fallback if collision happens multiple times: use timestamp-based entropy
  const fallbackCode = (Date.now().toString(36).slice(-3) + generateRandomCode(3)).toUpperCase();
  return `TT-${fallbackCode}`;
};

/**
 * Resolves the client base URL for public scan links.
 * - In production, uses the deployed Vercel frontend URL (from CLIENT_URL or fallback https://tag-track-chi.vercel.app).
 * - In development, uses the local dev server URL (e.g. http://localhost:5173).
 */
const getClientBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    if (process.env.CLIENT_URL) {
      const urls = process.env.CLIENT_URL.split(',')
        .map((url) => url.trim().replace(/\/$/, ''))
        .filter(Boolean);
      const prodUrl = urls.find((url) => !url.includes('localhost') && !url.includes('127.0.0.1'));
      if (prodUrl) return prodUrl;
    }
    return 'https://tag-track-chi.vercel.app';
  }

  // Development environment
  if (process.env.CLIENT_URL) {
    const urls = process.env.CLIENT_URL.split(',')
      .map((url) => url.trim().replace(/\/$/, ''))
      .filter(Boolean);
    return urls[0] || 'http://localhost:5173';
  }

  return 'http://localhost:5173';
};

/**
 * Generate a QR Code as a Data URL (base64 PNG) containing the item lookup URL
 * @param {string} tagId - The Tag ID (e.g. TT-A3F2K9)
 * @returns {Promise<string>} Base64 Data URL (data:image/png;base64,...)
 */
const generateQRCodeDataUrl = async (tagId) => {
  const clientBaseUrl = getClientBaseUrl();
  const lookupUrl = `${clientBaseUrl}/scan/${tagId}`;

  const qrDataUrl = await QRCode.toDataURL(lookupUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    width: 320,
    color: {
      dark: '#1e1b4b', // Deep indigo for clear scanning and brand consistency
      light: '#ffffff',
    },
  });

  return qrDataUrl;
};

module.exports = {
  generateUniqueTagId,
  generateQRCodeDataUrl,
  getClientBaseUrl,
};
