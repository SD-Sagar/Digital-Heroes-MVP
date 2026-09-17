import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import scoreReducer from './scoreSlice';
import charityReducer from './charitySlice';
import subscriptionReducer from './subscriptionSlice';
import drawReducer from './drawSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    score: scoreReducer,
    charity: charityReducer,
    subscription: subscriptionReducer,
    draw: drawReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
