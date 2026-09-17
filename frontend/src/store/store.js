import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import subscriptionReducer from './subscriptionSlice';
import scoreReducer from './scoreSlice';
import charityReducer from './charitySlice';
import drawReducer from './drawSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subscription: subscriptionReducer,
    score: scoreReducer,
    charity: charityReducer,
    draw: drawReducer
  }
});
