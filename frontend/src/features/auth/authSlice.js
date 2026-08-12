import { createSlice } from '@reduxjs/toolkit';
import {
  registerUser,
  loginUser,
  googleLogin,
  logoutUser,
  fetchCurrentUser,
  updateProfile,
} from './authThunks';

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false, // True once session hydration check finishes
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Current User (Session Hydration)
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })

      // Login User
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.error = null;
        if (action.payload.data?.accessToken) {
          localStorage.setItem('accessToken', action.payload.data.accessToken);
        }
        if (action.payload.data?.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.data.refreshToken);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Login failed.';
      })

      // Google OAuth Login
      .addCase(googleLogin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.error = null;
        if (action.payload.data?.accessToken) {
          localStorage.setItem('accessToken', action.payload.data.accessToken);
        }
        if (action.payload.data?.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.data.refreshToken);
        }
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Google login failed.';
      })

      // Register User
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Registration failed.';
      })

      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })

      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.data;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
