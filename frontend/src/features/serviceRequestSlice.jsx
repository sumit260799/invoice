// src/features/serviceRequest/serviceRequestSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../services/ApiEndpoint';
// Create Async Thunk for fetching invoices
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get('/api/user/get-service-request');
      if (response.status === 200) {
        return response.data?.serviceRequests || [];
      } else {
        throw new Error('Failed to fetch invoices');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchAllEmails = createAsyncThunk(
  'emails/fetchAllEmails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get('/api/user/v1/names');
      return response.data?.empList; // Assuming response.data.empList is the list of emails
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch emails'
      );
    }
  }
);
export const fetchServiceRequest = createAsyncThunk(
  'serviceRequest/fetchDetails',
  async (serviceRequestId, thunkAPI) => {
    try {
      const response = await get(
        `/api/user/display-report?serviceRequestId=${serviceRequestId}`
      );
      return response.data?.displayReport; // Adjust structure if needed
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
// Async thunk for updating service request status
export const updateServiceRequestStatus = createAsyncThunk(
  'serviceRequest/updateStatus',
  async (payload, thunkAPI) => {
    console.log('🚀 ~ payload:', payload);
    try {
      const response = await post('/api/user/v1/update-existing-sr', payload);
      console.log('🚀 ~ response:', response);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
// Create slice for invoices
const serviceRequestSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoices: [],
    emailList: [],
    statusCounts: {
      srStatusCounts: {},
      quoteStatusCounts: {},
    },
    selectedZone: 'All',
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedZone: (state, action) => {
      state.selectedZone = action.payload;
      const filteredInvoices =
        state.selectedZone === 'All'
          ? state.invoices
          : state.invoices.filter(
              invoice => invoice.zone === state.selectedZone
            );

      const srCounts = {};
      const quoteCounts = {};

      filteredInvoices.forEach(invoice => {
        const srStatus = invoice.srStatus;
        srCounts[srStatus] = (srCounts[srStatus] || 0) + 1;

        const quoteStatus = invoice.quoteStatus;
        quoteCounts[quoteStatus] = (quoteCounts[quoteStatus] || 0) + 1;
      });

      state.statusCounts = {
        srStatusCounts: srCounts,
        quoteStatusCounts: quoteCounts,
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchInvoices.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;

        // Calculate srStatusCounts and quoteStatusCounts
        const srCounts = {};
        const quoteCounts = {};

        action.payload.forEach(invoice => {
          const srStatus = invoice.srStatus;
          srCounts[srStatus] = (srCounts[srStatus] || 0) + 1;

          const quoteStatus = invoice.quoteStatus;
          quoteCounts[quoteStatus] = (quoteCounts[quoteStatus] || 0) + 1;
        });

        state.statusCounts = {
          srStatusCounts: srCounts,
          quoteStatusCounts: quoteCounts,
        };
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //   fetch emails
      .addCase(fetchAllEmails.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.emailList = action.payload;
      })
      .addCase(fetchAllEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch service request
      .addCase(fetchServiceRequest.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.details = action.payload;
      })
      .addCase(fetchServiceRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update service request status
      .addCase(updateServiceRequestStatus.pending, state => {
        state.loading = true;
      })
      .addCase(updateServiceRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.details = { ...state.details, srStatus: action.payload.srStatus }; // Update status in state
      })
      .addCase(updateServiceRequestStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { setSelectedZone } = serviceRequestSlice.actions;
export default serviceRequestSlice.reducer;
