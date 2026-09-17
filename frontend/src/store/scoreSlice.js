import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchScores = createAsyncThunk('scores/fetch', async () => {
  const { data } = await api.get('/scores');
  return data;
});

export const addScore = createAsyncThunk('scores/add', async (scoreData) => {
  const { data } = await api.post('/scores', scoreData);
  return data;
});

export const updateScore = createAsyncThunk('scores/update', async ({ id, scoreData }) => {
  const { data } = await api.put(`/scores/${id}`, scoreData);
  return data;
});

export const deleteScore = createAsyncThunk('scores/delete', async (id) => {
  await api.delete(`/scores/${id}`);
  return id;
});

const scoreSlice = createSlice({
  name: 'scores',
  initialState: {
    scores: [],
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
      .addCase(fetchScores.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchScores.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = action.payload;
      })
      .addCase(fetchScores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addScore.fulfilled, (state, action) => {
        state.scores = [action.payload, ...state.scores.slice(0, 4)];
      })
      .addCase(updateScore.fulfilled, (state, action) => {
        const index = state.scores.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.scores[index] = action.payload;
        }
      })
      .addCase(deleteScore.fulfilled, (state, action) => {
        state.scores = state.scores.filter(s => s._id !== action.payload);
      });
  }
});

export const { clearError } = scoreSlice.actions;
export default scoreSlice.reducer;
