import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

// 1. Register User
export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.normalizedMessage }
      );
    }
  }
);

// 2. Login User
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.normalizedMessage }
      );
    }
  }
);

// 3. Google OAuth Login
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (idToken, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/google', { idToken });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.normalizedMessage }
      );
    }
  }
);

// 4. Resend Verification Email
export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.normalizedMessage }
      );
    }
  }
);

// 5. Logout User
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.normalizedMessage }
      );
    }
  }
);

// 6. Fetch Current Authenticated User (Session Hydration)
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.normalizedMessage }
      );
    }
  }
);

// 7. Forgot Password Request
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.normalizedMessage }
      );
    }
  }
);

// 8. Reset Password Submission
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.normalizedMessage }
      );
    }
  }
);

// 9. Verify Email Token
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.normalizedMessage }
      );
    }
  }
);

// 10. Update Profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.patch('/users/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.normalizedMessage }
      );
    }
  }
);

// 11. Change Password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords, { rejectWithValue }) => {
    try {
      const response = await api.patch('/users/change-password', passwords);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.normalizedMessage }
      );
    }
  }
);
