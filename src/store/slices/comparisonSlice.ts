import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pokemon } from '../../core/types';

interface ComparisonState {
  selectedPokemon: Pokemon[];
  maxSelection: number;
  isComparing: boolean;
  comparisonMode: 'stats' | 'types' | 'abilities' | 'moves' | 'all';
}

const initialState: ComparisonState = {
  selectedPokemon: [],
  maxSelection: 6,
  isComparing: false,
  comparisonMode: 'all',
};

const comparisonSlice = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    addToComparison: (state, action: PayloadAction<Pokemon>) => {
      if (state.selectedPokemon.length < state.maxSelection) {
        const exists = state.selectedPokemon.find(p => p.id === action.payload.id);
        if (!exists) {
          state.selectedPokemon.push(action.payload);
        }
      }
    },
    removeFromComparison: (state, action: PayloadAction<number>) => {
      state.selectedPokemon = state.selectedPokemon.filter(p => p.id !== action.payload);
    },
    clearComparison: (state) => {
      state.selectedPokemon = [];
      state.isComparing = false;
    },
    setComparisonMode: (state, action: PayloadAction<ComparisonState['comparisonMode']>) => {
      state.comparisonMode = action.payload;
    },
    toggleComparing: (state) => {
      state.isComparing = !state.isComparing;
    },
    setMaxSelection: (state, action: PayloadAction<number>) => {
      state.maxSelection = Math.min(Math.max(2, action.payload), 6);
    },
  },
});

export const {
  addToComparison,
  removeFromComparison,
  clearComparison,
  setComparisonMode,
  toggleComparing,
  setMaxSelection,
} = comparisonSlice.actions;

export default comparisonSlice.reducer;