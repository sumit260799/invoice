import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get } from '../services/ApiEndpoint';
// Define the initial state
const initialState = {
  user: null,
  loading: false,
  error: null,
};
export const updateUser = createAsyncThunk('updateuser', async () => {
  try {
    const response = await get('/api/auth/checkUser');
    return response.data;
  } catch (error) {
    throw error;
  }
});
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(updateUser.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.loading = null;
      state.user = action.payload;
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = null;
      state.error = action.error.message;
      state.user = null;
    });
  },
});

// Export the actions
export const { setUser } = authSlice.actions;

export default authSlice.reducer;
