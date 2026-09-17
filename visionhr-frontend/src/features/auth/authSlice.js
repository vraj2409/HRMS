import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  user: null, // { id, email, role, employeeCode, fullName, department, designation, avatarS3Key }
  status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, user } = action.payload;
      state.accessToken = accessToken;
      state.user = user;
      state.status = 'authenticated';
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      state.status = 'authenticated';
    },
    setAuthStatus: (state, action) => {
      state.status = action.payload;
    },
    logoutLocal: (state) => {
      state.accessToken = null;
      state.user = null;
      state.status = 'unauthenticated';
    },
  },
});

export const { setCredentials, setAccessToken, setAuthStatus, logoutLocal } = authSlice.actions;
export default authSlice.reducer;
