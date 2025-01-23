// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to process request' };
  }
};

export const validateResetToken = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/auth/validate-reset-token/${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Invalid or expired token' };
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};