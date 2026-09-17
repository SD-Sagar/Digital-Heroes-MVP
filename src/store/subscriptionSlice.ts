import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import type { Subscription } from '@/types';

interface SubscriptionState {
  subscription: Subscription | null;
  allSubscriptions: Subscription[];
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  subscription: null,
  allSubscriptions: [],
  loading: false,
  error: null,
};

export const fetchSubscription = createAsyncThunk(
  'subscription/fetchSubscription',
  async (_, { rejectWithValue }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return rejectWithValue('Not authenticated');

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async ({ plan, amount }: { plan: 'monthly' | 'yearly'; amount: number }, { rejectWithValue }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return rejectWithValue('Not authenticated');

    const now = new Date();
    const renewalDate = new Date(now);
    if (plan === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan,
        status: 'active',
        amount,
        start_date: now.toISOString(),
        renewal_date: renewalDate.toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (id: string, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const fetchAllSubscriptions = createAsyncThunk(
  'subscription/fetchAllSubscriptions',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, profiles!inner(name, email)')
      .order('created_at', { ascending: false });

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.subscription = action.payload;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        if (action.payload) state.subscription = action.payload;
      })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
        state.allSubscriptions = action.payload;
      });
  },
});

export const { clearError: clearSubscriptionError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
