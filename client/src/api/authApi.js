import axiosInstance from '../utils/axiosInstance';

/**
 * Auth API functions.
 * Each function returns the response data directly.
 */

export const registerUser = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await axiosInstance.put('/auth/me', profileData);
  return response.data;
};

export const changeMyPassword = async (passwordData) => {
  const response = await axiosInstance.put('/auth/me/password', passwordData);
  return response.data;
};
