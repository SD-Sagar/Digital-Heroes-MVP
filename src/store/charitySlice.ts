import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import type { Charity } from '@/types';

interface CharityState {
  charities: Charity[];
  selectedCharity: Charity | null;
  loading: boolean;
  error: string | null;
}

const initialState: CharityState = {
  charities: [],
  selectedCharity: null,
  loading: false,
  error: null,
};

export const fetchCharities = createAsyncThunk(
  'charity/fetchCharities',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const fetchAllCharities = createAsyncThunk(
  'charity/fetchAllCharities',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const createCharity = createAsyncThunk(
  'charity/createCharity',
  async (charity: Omit<Charity, 'id' | 'created_at' | 'active'>, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('charities')
      .insert({ ...charity, active: true })
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const updateCharity = createAsyncThunk(
  'charity/updateCharity',
  async ({ id, ...updates }: Partial<Charity> & { id: string }, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('charities')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const deleteCharity = createAsyncThunk(
  'charity/deleteCharity',
  async (id: string, { rejectWithValue }) => {
    const { error } = await supabase.from('charities').delete().eq('id', id);
    if (error) return rejectWithValue(error.message);
    return id;
  }
);

const charitySlice = createSlice({
  name: 'charity',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharities.fulfilled, (state, action) => {
        state.loading = false;
        state.charities = action.payload;
      })
      .addCase(fetchCharities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllCharities.fulfilled, (state, action) => {
        state.charities = action.payload;
      })
      .addCase(createCharity.fulfilled, (state, action) => {
        if (action.payload) state.charities.unshift(action.payload);
      })
      .addCase(updateCharity.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.charities.findIndex(c => c.id === action.payload!.id);
          if (idx !== -1) state.charities[idx] = action.payload;
        }
      })
      .addCase(deleteCharity.fulfilled, (state, action) => {
        state.charities = state.charities.filter(c => c.id !== action.payload);
      });
  },
});

export const { clearError: clearCharityError } = charitySlice.actions;
export default charitySlice.reducer;
