import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchCharities = createAsyncThunk('charities/fetch', async () => {
  const { data } = await api.get('/charities');
  return data;
});

export const selectCharity = createAsyncThunk('charities/select', async (selectionData) => {
  const { data } = await api.post('/charities/select', selectionData);
  return data;
});

export const fetchMySelection = createAsyncThunk('charities/mySelection', async () => {
  const { data } = await api.get('/charities/my/selection');
  return data;
});

const charitySlice = createSlice({
  name: 'charities',
  initialState: {
    charities: [],
    mySelection: null,
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
      .addCase(fetchCharities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCharities.fulfilled, (state, action) => {
        state.loading = false;
        state.charities = action.payload;
      })
      .addCase(fetchCharities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchMySelection.fulfilled, (state, action) => {
        state.mySelection = action.payload;
      });
  }
});

export const { clearError } = charitySlice.actions;
export default charitySlice.reducer;
