import axiosInstance from '../utils/axiosInstance';

/**
 * Item API functions for owner operations.
 */

// Register a new item
export const registerItem = async (itemData) => {
  const response = await axiosInstance.post('/items', itemData);
  return response.data;
};

// Get all items belonging to the authenticated owner
export const getMyItems = async (params = {}) => {
  const response = await axiosInstance.get('/items/my-items', { params });
  return response.data;
};

// Get item details by ID
export const getItemById = async (id) => {
  const response = await axiosInstance.get(`/items/${id}`);
  return response.data;
};

// Mark a registered item as lost
export const markItemLost = async (id) => {
  const response = await axiosInstance.patch(`/items/${id}/lost`);
  return response.data;
};

// Get public item details by Tag ID (No auth required)
export const getItemByTagId = async (tagId) => {
  const response = await axiosInstance.get(`/items/tag/${tagId}`);
  return response.data;
};

// Submit a found report for a lost item (No auth required)
export const reportItemFound = async (tagId, reportData) => {
  const response = await axiosInstance.post(`/items/${tagId}/found`, reportData);
  return response.data;
};

// Get all found reports for items owned by authenticated owner (JWT required)
export const getMyFoundReports = async () => {
  const response = await axiosInstance.get('/items/found-reports');
  return response.data;
};

// Submit an ownership claim for an item with a found report (JWT required)
export const submitOwnershipClaim = async (tagId, claimData) => {
  const response = await axiosInstance.post(`/items/${tagId}/claims`, claimData);
  return response.data;
};

// Get all ownership claims submitted by authenticated owner (JWT required)
export const getMyClaims = async () => {
  const response = await axiosInstance.get('/items/my-claims');
  return response.data;
};

