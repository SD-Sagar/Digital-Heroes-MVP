import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase, DRAW_ENGINE_URL } from '@/lib/supabase';
import type { Draw, DrawSimulationResult, Winner } from '@/types';

interface DrawState {
  draws: Draw[];
  publishedDraws: Draw[];
  simulationResult: DrawSimulationResult | null;
  winners: Winner[];
  allWinners: Winner[];
  loading: boolean;
  error: string | null;
}

const initialState: DrawState = {
  draws: [],
  publishedDraws: [],
  simulationResult: null,
  winners: [],
  allWinners: [],
  loading: false,
  error: null,
};

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export const fetchDraws = createAsyncThunk(
  'draw/fetchDraws',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const fetchPublishedDraws = createAsyncThunk(
  'draw/fetchPublishedDraws',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const createDraw = createAsyncThunk(
  'draw/createDraw',
  async ({ periodMonth, drawType }: { periodMonth: string; drawType: 'random' | 'algorithmic' }, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('draws')
      .insert({
        period_month: periodMonth,
        draw_type: drawType,
        status: 'draft',
      })
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const simulateDraw = createAsyncThunk(
  'draw/simulateDraw',
  async ({ drawType, drawId }: { drawType: string; drawId?: string }, { rejectWithValue }) => {
    const token = await getAuthToken();
    if (!token) return rejectWithValue('Not authenticated');

    const response = await fetch(DRAW_ENGINE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'simulate', drawType, drawId }),
    });

    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.error || 'Simulation failed');
    return data as DrawSimulationResult;
  }
);

export const publishDraw = createAsyncThunk(
  'draw/publishDraw',
  async (drawId: string, { rejectWithValue }) => {
    const token = await getAuthToken();
    if (!token) return rejectWithValue('Not authenticated');

    const response = await fetch(DRAW_ENGINE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'publish', drawId }),
    });

    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.error || 'Publish failed');
    return data;
  }
);

export const fetchWinners = createAsyncThunk(
  'draw/fetchWinners',
  async (_, { rejectWithValue }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return rejectWithValue('Not authenticated');

    const { data, error } = await supabase
      .from('winners')
      .select('*, draws!inner(period_month, generated_numbers)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const fetchAllWinners = createAsyncThunk(
  'draw/fetchAllWinners',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('winners')
      .select('*, draws!inner(period_month, generated_numbers), profiles!inner(name, email)')
      .order('created_at', { ascending: false });

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const uploadProof = createAsyncThunk(
  'draw/uploadProof',
  async ({ winnerId, file }: { winnerId: string; file: File }, { rejectWithValue }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return rejectWithValue('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${winnerId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('winner-proof')
      .upload(fileName, file, { upsert: true });

    if (uploadError) return rejectWithValue(uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from('winner-proof')
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from('winners')
      .update({ proof_url: publicUrl })
      .eq('id', winnerId)
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const updateWinnerStatus = createAsyncThunk(
  'draw/updateWinnerStatus',
  async ({ winnerId, verificationStatus, payoutStatus }: {
    winnerId: string;
    verificationStatus?: 'pending' | 'approved' | 'rejected';
    payoutStatus?: 'pending' | 'paid';
  }, { rejectWithValue }) => {
    const updates: Record<string, string> = {};
    if (verificationStatus) updates.verification_status = verificationStatus;
    if (payoutStatus) updates.payout_status = payoutStatus;

    const { data, error } = await supabase
      .from('winners')
      .update(updates)
      .eq('id', winnerId)
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

const drawSlice = createSlice({
  name: 'draw',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSimulation(state) {
      state.simulationResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDraws.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDraws.fulfilled, (state, action) => {
        state.loading = false;
        state.draws = action.payload;
      })
      .addCase(fetchDraws.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPublishedDraws.fulfilled, (state, action) => {
        state.publishedDraws = action.payload;
      })
      .addCase(createDraw.fulfilled, (state, action) => {
        if (action.payload) state.draws.unshift(action.payload);
      })
      .addCase(simulateDraw.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(simulateDraw.fulfilled, (state, action) => {
        state.loading = false;
        state.simulationResult = action.payload;
      })
      .addCase(simulateDraw.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(publishDraw.fulfilled, (state) => {
        state.simulationResult = null;
      })
      .addCase(fetchWinners.fulfilled, (state, action) => {
        state.winners = action.payload;
      })
      .addCase(fetchAllWinners.fulfilled, (state, action) => {
        state.allWinners = action.payload;
      })
      .addCase(uploadProof.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.winners.findIndex(w => w.id === action.payload!.id);
          if (idx !== -1) state.winners[idx] = action.payload;
        }
      })
      .addCase(updateWinnerStatus.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.allWinners.findIndex(w => w.id === action.payload!.id);
          if (idx !== -1) state.allWinners[idx] = action.payload;
        }
      });
  },
});

export const { clearError: clearDrawError, clearSimulation } = drawSlice.actions;
export default drawSlice.reducer;
