import { configureStore } from '@reduxjs/toolkit';
import pokemonReducer from './slices/pokemonSlice';
import teamsReducer from './slices/teamsSlice';
import comparisonReducer from './slices/comparisonSlice';
import favoritesReducer from './slices/favoritesSlice';
import settingsReducer from './slices/settingsSlice';
import filtersReducer from './slices/filtersSlice';

export const store = configureStore({
  reducer: {
    pokemon: pokemonReducer,
    teams: teamsReducer,
    comparison: comparisonReducer,
    favorites: favoritesReducer,
    settings: settingsReducer,
    filters: filtersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;