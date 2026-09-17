import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchDraws = createAsyncThunk('draws/fetch', async (status) => {
  const { data } = await api.get('/draws', { params: { status } });
  return data;
});

export const fetchMyParticipations = createAsyncThunk('draws/myParticipations', async () => {
  const { data } = await api.get('/draws/my-participations');
  return data;
});

export const createDraw = createAsyncThunk('draws/create', async (drawData) => {
  const { data } = await api.post('/draws', drawData);
  return data;
});

export const simulateDraw = createAsyncThunk('draws/simulate', async (drawId) => {
  const { data } = await api.post(`/draws/${drawId}/simulate`);
  return data;
});

export const publishDraw = createAsyncThunk('draws/publish', async (drawId) => {
  const { data } = await api.post(`/draws/${drawId}/publish`);
  return data;
});

const drawSlice = createSlice({
  name: 'draws',
  initialState: {
    draws: [],
    participations: [],
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
      .addCase(fetchDraws.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDraws.fulfilled, (state, action) => {
        state.loading = false;
        state.draws = action.payload;
      })
      .addCase(fetchDraws.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchMyParticipations.fulfilled, (state, action) => {
        state.participations = action.payload;
      })
      .addCase(createDraw.fulfilled, (state, action) => {
        state.draws.unshift(action.payload);
      })
      .addCase(simulateDraw.fulfilled, (state, action) => {
        const index = state.draws.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.draws[index] = action.payload;
        }
      })
      .addCase(publishDraw.fulfilled, (state, action) => {
        const index = state.draws.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.draws[index] = action.payload;
        }
      });
  }
});

export const { clearError } = drawSlice.actions;
export default drawSlice.reducer;
