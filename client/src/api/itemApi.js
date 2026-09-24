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
