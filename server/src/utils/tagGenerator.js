const crypto = require('crypto');
const QRCode = require('qrcode');
const Item = require('../models/Item');

// Unambiguous uppercase alphanumeric characters
// Excluding easily confused 0, O, 1, I
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Deployed Vercel frontend URL
const DEPLOYED_PRODUCTION_URL = 'https://tag-track-chi.vercel.app';

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

  // Fallback if collision happens multiple times
  const fallbackCode = (
    Date.now().toString(36).slice(-3) +
    generateRandomCode(3)
  ).toUpperCase();

  return `TT-${fallbackCode}`;
};

/**
 * Resolve the frontend base URL for public scan links.
 *
 * Rules:
 * - If CLIENT_URL is a localhost URL, use localhost.
 * - If CLIENT_URL is empty, missing, or non-localhost on the deployed server, use:
 *   https://tag-track-chi.vercel.app
 *
 * Does not depend on NODE_ENV.
 */
const getClientBaseUrl = (origin = null) => {
  const rawClientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.trim() : '';

  if (rawClientUrl) {
    const configuredUrls = rawClientUrl
      .split(',')
      .map((url) => url.trim().replace(/\/$/, ''))
      .filter(Boolean);

    const isLocalhostOnly = configuredUrls.every(
      (url) => url.includes('localhost') || url.includes('127.0.0.1')
    );

    if (isLocalhostOnly) {
      const localUrl = configuredUrls.find(
        (url) => url.includes('localhost') || url.includes('127.0.0.1')
      );
      return localUrl || 'http://localhost:5173';
    }

    const prodUrl = configuredUrls.find(
      (url) => !url.includes('localhost') && !url.includes('127.0.0.1')
    );

    if (prodUrl) {
      return prodUrl;
    }
  }

  return DEPLOYED_PRODUCTION_URL;
};

/**
 * Generate a QR Code as a Data URL (base64 PNG)
 * containing the item lookup URL.
 *
 * @param {string} tagId - The Tag ID (e.g. TT-A3F2K9)
 * @param {string|null} origin - Optional request origin header
 * @returns {Promise<string>} Base64 Data URL
 */
const generateQRCodeDataUrl = async (tagId, origin = null) => {
  const clientBaseUrl = getClientBaseUrl(origin);

  const lookupUrl = `${clientBaseUrl}/scan/${tagId}`;

  const qrDataUrl = await QRCode.toDataURL(lookupUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    width: 320,
    color: {
      dark: '#1e1b4b',
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