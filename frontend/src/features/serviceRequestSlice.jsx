// src/features/serviceRequest/serviceRequestSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get, post, put } from "../services/ApiEndpoint";

// Create Async Thunk for fetching invoices
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchInvoices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await get("/api/user/get-service-request");
      if (response.status === 200) {
        return response.data?.serviceRequests || [];
      } else {
        throw new Error("Failed to fetch invoices");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchAllEmails = createAsyncThunk(
  "emails/fetchAllEmails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await get("/api/user/v1/names");
      return response.data?.empList; // Assuming response.data.empList is the list of emails
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch emails"
      );
    }
  }
);
export const fetchAllQuotationNo = createAsyncThunk(
  "emails/fetchAllQuotationNo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await get("/api/user/v1/get-quotationNo");
      return response.data?.data; // Assuming response.data.empList is the list of emails
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch emails"
      );
    }
  }
);
export const fetchServiceRequest = createAsyncThunk(
  "serviceRequest/fetchDetails",
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
  "serviceRequest/updateStatus",
  async (payload, thunkAPI) => {
    try {
      const response = await put("/api/user/v1/update-existing-sr", payload);
      return response.data;
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchAllocatedRequests = createAsyncThunk(
  "requests/fetchAllocatedRequests",
  async (email, { rejectWithValue }) => {
    try {
      const response = await post("/api/user/v1/get-allocated-spc", { email }); // Send email in the body
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "An error occurred"
      );
    }
  }
);
// fetch service request by status
export const fetchServiceRequestByStatus = createAsyncThunk(
  "serviceRequests/fetch",
  async ({ billingProgressStatus, quoteStatus }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (billingProgressStatus)
        queryParams.append("billingProgressStatus", billingProgressStatus);
      if (quoteStatus) queryParams.append("quoteStatus", quoteStatus);

      const response = await get(
        `/api/user/get-service-status?${queryParams.toString()}`
      );
      return response.data.serviceRequests;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch data");
    }
  }
);
export const revokeBillingEditStatus = createAsyncThunk(
  "serviceRequest/revokeBillingEditStatus",
  async (serviceRequestId, { rejectWithValue }) => {
    console.log("🚀 ~ serviceRequestId:", serviceRequestId);
    try {
      const response = await put(
        "/api/user/v1/revokeBillingEditStatus",
        serviceRequestId
      );

      console.log("🚀 ~ response:", response);
      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      console.error("Error revoking billing status:", error);
      return rejectWithValue(error.message || "Something went wrong.");
    }
  }
);
// Create slice for invoices
const serviceRequestSlice = createSlice({
  name: "invoices",
  initialState: {
    invoices: [],
    invoicesByStatus: [],
    emailList: [],
    quotationNoList: [],
    statusCounts: {
      srStatusCounts: {},
      quoteStatusCounts: {},
      billingEditCounts: {},
    },
    spcAllocated: [],
    selectedZone: "All",
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedZone: (state, action) => {
      state.selectedZone = action.payload;

      const filteredInvoices =
        state.selectedZone === "All"
          ? state.invoices
          : state.invoices.filter(
              (invoice) => invoice.zone === state.selectedZone
            );

      const srCounts = {};
      const quoteCounts = {};
      const billingEditCounts = {};

      filteredInvoices.forEach((invoice) => {
        const { billingProgressStatus, quoteStatus, billingEditStatus } =
          invoice;

        // Count srStatus
        if (billingProgressStatus) {
          srCounts[billingProgressStatus] =
            (srCounts[billingProgressStatus] || 0) + 1;
        }
        // Count quoteStatus
        if (quoteStatus) {
          quoteCounts[quoteStatus] = (quoteCounts[quoteStatus] || 0) + 1;
        }
        // Count billingEditStatus
        if (billingEditStatus) {
          billingEditCounts[billingEditStatus] =
            (billingEditCounts[billingEditStatus] || 0) + 1;
        }
      });

      state.statusCounts = {
        srStatusCounts: srCounts,
        quoteStatusCounts: quoteCounts,
        onHoldStatusCounts: billingEditCounts,
      };
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;

        // Calculate srStatusCounts, quoteStatusCounts, and billingEditCounts
        const srCounts = {};
        const quoteCounts = {};
        const billingEditCounts = {};

        action.payload.forEach((invoice) => {
          const { billingProgressStatus, quoteStatus, billingEditStatus } =
            invoice;

          // Count billingEditStatus
          billingEditCounts[billingEditStatus] =
            (billingEditCounts[billingEditStatus] || 0) + 1;

          // Only count srStatus and quoteStatus if billingEditStatus is not "OnHold" or "Rejected"
          if (
            billingEditStatus !== "OnHold" &&
            billingEditStatus !== "Rejected"
          ) {
            if (billingProgressStatus) {
              srCounts[billingProgressStatus] =
                (srCounts[billingProgressStatus] || 0) + 1;
            }

            if (quoteStatus) {
              quoteCounts[quoteStatus] = (quoteCounts[quoteStatus] || 0) + 1;
            }
          }
        });

        state.statusCounts = {
          srStatusCounts: srCounts,
          quoteStatusCounts: quoteCounts,
          billingEditCounts,
        };
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //   fetch emails
      .addCase(fetchAllEmails.pending, (state) => {
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

      //   fetch all quotation no
      .addCase(fetchAllQuotationNo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllQuotationNo.fulfilled, (state, action) => {
        state.loading = false;
        state.quotationNoList = action.payload;
      })
      .addCase(fetchAllQuotationNo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch service request
      .addCase(fetchServiceRequest.pending, (state) => {
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
      .addCase(updateServiceRequestStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateServiceRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.details = {
          ...state.details,
          billingProgressStatus: action.payload.billingProgressStatus,
        }; // Update status in state
      })
      .addCase(updateServiceRequestStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // for allocated spc
      .addCase(fetchAllocatedRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocatedRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.spcAllocated = action.payload;
      })
      .addCase(fetchAllocatedRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetch service request by status
      .addCase(fetchServiceRequestByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceRequestByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.invoicesByStatus = action.payload;
      })
      .addCase(fetchServiceRequestByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // revoke billing edit status
      .addCase(revokeBillingEditStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(revokeBillingEditStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.map((invoice) =>
          invoice.serviceRequestId === action.meta.arg
            ? { ...invoice, billingEditStatus: "None" }
            : invoice
        );
      })
      .addCase(revokeBillingEditStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to revoke billing status.";
      });
  },
});
export const { setSelectedZone } = serviceRequestSlice.actions;
export default serviceRequestSlice.reducer;
