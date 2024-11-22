import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get } from '../services/ApiEndpoint';

// Load the user from localStorage if available
const persistedUser = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

// Define the initial state
const initialState = {
  user: persistedUser, // Initialize with the persisted user
  loading: false,
  error: null,
};

// Async thunk for updating the user
export const updateUser = createAsyncThunk('auth/updateUser', async () => {
  try {
    const response = await get('/api/auth/checkUser');
    return response.data;
  } catch (error) {
    throw error;
  }
});

// Slice definition
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload)); // Persist user to localStorage
    },
    clearUser: state => {
      state.user = null;
      localStorage.removeItem('user'); // Remove user from localStorage
    },
  },
  extraReducers: builder => {
    builder.addCase(updateUser.pending, state => {
      state.loading = true;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload)); // Persist user to localStorage
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.user = null;
      localStorage.removeItem('user'); // Clear user from localStorage
    });
  },
});

// Export the actions
export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;
