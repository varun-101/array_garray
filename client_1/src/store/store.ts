import { configureStore } from '@reduxjs/toolkit';
import projectsReducer from './slices/projectsSlice';
import authReducer from './slices/authSlice';
import filtersReducer from './slices/filtersSlice';

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    auth: authReducer,
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;