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
