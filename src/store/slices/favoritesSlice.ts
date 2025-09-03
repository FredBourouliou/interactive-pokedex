import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FavoritesState {
  favoriteIds: number[];
  collections: {
    id: string;
    name: string;
    description?: string;
    pokemonIds: number[];
    createdAt: Date;
  }[];
}

const initialState: FavoritesState = {
  favoriteIds: JSON.parse(localStorage.getItem('favoritePokemon') || '[]'),
  collections: JSON.parse(localStorage.getItem('pokemonCollections') || '[]'),
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const index = state.favoriteIds.indexOf(action.payload);
      if (index === -1) {
        state.favoriteIds.push(action.payload);
      } else {
        state.favoriteIds.splice(index, 1);
      }
      localStorage.setItem('favoritePokemon', JSON.stringify(state.favoriteIds));
    },
    addToCollection: (state, action: PayloadAction<{ collectionId: string; pokemonId: number }>) => {
      const collection = state.collections.find(c => c.id === action.payload.collectionId);
      if (collection && !collection.pokemonIds.includes(action.payload.pokemonId)) {
        collection.pokemonIds.push(action.payload.pokemonId);
        localStorage.setItem('pokemonCollections', JSON.stringify(state.collections));
      }
    },
    removeFromCollection: (state, action: PayloadAction<{ collectionId: string; pokemonId: number }>) => {
      const collection = state.collections.find(c => c.id === action.payload.collectionId);
      if (collection) {
        collection.pokemonIds = collection.pokemonIds.filter(id => id !== action.payload.pokemonId);
        localStorage.setItem('pokemonCollections', JSON.stringify(state.collections));
      }
    },
    createCollection: (state, action: PayloadAction<{ name: string; description?: string }>) => {
      const newCollection = {
        id: Date.now().toString(),
        name: action.payload.name,
        description: action.payload.description,
        pokemonIds: [],
        createdAt: new Date(),
      };
      state.collections.push(newCollection);
      localStorage.setItem('pokemonCollections', JSON.stringify(state.collections));
    },
    deleteCollection: (state, action: PayloadAction<string>) => {
      state.collections = state.collections.filter(c => c.id !== action.payload);
      localStorage.setItem('pokemonCollections', JSON.stringify(state.collections));
    },
    clearAllFavorites: (state) => {
      state.favoriteIds = [];
      localStorage.setItem('favoritePokemon', JSON.stringify([]));
    },
  },
});

export const {
  toggleFavorite,
  addToCollection,
  removeFromCollection,
  createCollection,
  deleteCollection,
  clearAllFavorites,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;