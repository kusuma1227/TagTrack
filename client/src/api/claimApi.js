import axiosInstance from '../utils/axiosInstance';

/**
 * Claim API functions for Verification Officer operations.
 */

// Get all claims (Officer / Admin)
export const getClaims = async (params = {}) => {
  const response = await axiosInstance.get('/claims', { params });
  return response.data;
};

// Get specific claim details by ID
export const getClaimById = async (id) => {
  const response = await axiosInstance.get(`/claims/${id}`);
  return response.data;
};

// Update claim status (Approve / Reject / Under Review)
export const updateClaimStatus = async (id, data) => {
  const response = await axiosInstance.put(`/claims/${id}/status`, data);
  return response.data;
};

// Approve an ownership claim
export const approveClaim = async (id, verificationNotes = '') => {
  const response = await axiosInstance.put(`/claims/${id}/status`, {
    status: 'APPROVED',
    verificationNotes,
  });
  return response.data;
};

// Reject an ownership claim
export const rejectClaim = async (id, rejectionReason, verificationNotes = '') => {
  const response = await axiosInstance.put(`/claims/${id}/status`, {
    status: 'REJECTED',
    rejectionReason,
    verificationNotes,
  });
  return response.data;
};
