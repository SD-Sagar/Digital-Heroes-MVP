import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchSubscription = createAsyncThunk('subscription/fetch', async () => {
  const { data } = await api.get('/subscriptions/my-subscription');
  return data;
});

export const createSubscription = createAsyncThunk('subscription/create', async (plan) => {
  const { data } = await api.post('/subscriptions', { plan });
  return data;
});

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    subscription: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.subscription = action.payload;
      });
  }
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
