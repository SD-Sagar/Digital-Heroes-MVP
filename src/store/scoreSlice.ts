import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import type { Score } from '@/types';

interface ScoreState {
  scores: Score[];
  loading: boolean;
  error: string | null;
}

const initialState: ScoreState = {
  scores: [],
  loading: false,
  error: null,
};

export const fetchScores = createAsyncThunk(
  'score/fetchScores',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .order('score_date', { ascending: false })
      .limit(5);

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const addScore = createAsyncThunk(
  'score/addScore',
  async ({ score, date }: { score: number; date: string }, { rejectWithValue }) => {
    const { data, error } = await supabase.rpc('add_score', {
      p_score: score,
      p_score_date: date,
    });

    if (error) return rejectWithValue(error.message);

    // Refetch to get the clean list
    const { data: allScores, error: fetchError } = await supabase
      .from('scores')
      .select('*')
      .order('score_date', { ascending: false })
      .limit(5);

    if (fetchError) return rejectWithValue(fetchError.message);
    return allScores;
  }
);

export const updateScore = createAsyncThunk(
  'score/updateScore',
  async ({ id, score }: { id: string; score: number }, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('scores')
      .update({ score })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const deleteScore = createAsyncThunk(
  'score/deleteScore',
  async (id: string, { rejectWithValue }) => {
    const { error } = await supabase.from('scores').delete().eq('id', id);
    if (error) return rejectWithValue(error.message);
    return id;
  }
);

const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScores.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = action.payload;
      })
      .addCase(fetchScores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addScore.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = action.payload;
      })
      .addCase(addScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateScore.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.scores.findIndex(s => s.id === action.payload!.id);
          if (idx !== -1) state.scores[idx] = action.payload;
        }
      })
      .addCase(deleteScore.fulfilled, (state, action) => {
        state.scores = state.scores.filter(s => s.id !== action.payload);
      });
  },
});

export const { clearError: clearScoreError } = scoreSlice.actions;
export default scoreSlice.reducer;
