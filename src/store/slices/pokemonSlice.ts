import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Pokemon, PokemonSpecies, EvolutionChain } from '../../core/types';
import * as pokemonApi from '../../infrastructure/api/pokemonApi';

interface PokemonState {
  pokemonList: Pokemon[];
  currentPokemon: Pokemon | null;
  currentSpecies: PokemonSpecies | null;
  currentEvolution: EvolutionChain | null;
  loading: boolean;
  error: string | null;
  cachedPokemon: { [key: string]: Pokemon };
  cachedSpecies: { [key: string]: PokemonSpecies };
  cachedEvolutions: { [key: string]: EvolutionChain };
  currentGeneration: number;
}

const initialState: PokemonState = {
  pokemonList: [],
  currentPokemon: null,
  currentSpecies: null,
  currentEvolution: null,
  loading: false,
  error: null,
  cachedPokemon: {},
  cachedSpecies: {},
  cachedEvolutions: {},
  currentGeneration: 1,
};

export const fetchPokemonByGeneration = createAsyncThunk(
  'pokemon/fetchByGeneration',
  async (generation: number) => {
    const pokemonList = await pokemonApi.getPokemonByGeneration(generation);
    const detailedPokemon = await Promise.all(
      pokemonList.map(p => pokemonApi.getPokemonDetails(p.id))
    );
    return detailedPokemon;
  }
);

export const fetchPokemonDetails = createAsyncThunk(
  'pokemon/fetchDetails',
  async (idOrName: string | number) => {
    const pokemon = await pokemonApi.getPokemonDetails(idOrName);
    const species = await pokemonApi.getPokemonSpecies(idOrName);
    const evolutionResponse = await fetch(species.evolution_chain.url);
    const evolution = await evolutionResponse.json();
    return { pokemon, species, evolution };
  }
);

const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState,
  reducers: {
    setCurrentGeneration: (state, action: PayloadAction<number>) => {
      state.currentGeneration = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    cachePokemon: (state, action: PayloadAction<Pokemon>) => {
      state.cachedPokemon[action.payload.id] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPokemonByGeneration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPokemonByGeneration.fulfilled, (state, action) => {
        state.loading = false;
        state.pokemonList = action.payload;
        action.payload.forEach(pokemon => {
          state.cachedPokemon[pokemon.id] = pokemon;
        });
      })
      .addCase(fetchPokemonByGeneration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch Pokémon';
      })
      .addCase(fetchPokemonDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPokemonDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPokemon = action.payload.pokemon;
        state.currentSpecies = action.payload.species;
        state.currentEvolution = action.payload.evolution;
        state.cachedPokemon[action.payload.pokemon.id] = action.payload.pokemon;
        state.cachedSpecies[action.payload.pokemon.id] = action.payload.species;
        state.cachedEvolutions[action.payload.pokemon.id] = action.payload.evolution;
      })
      .addCase(fetchPokemonDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch Pokémon details';
      });
  },
});

export const { setCurrentGeneration, clearError, cachePokemon } = pokemonSlice.actions;
export default pokemonSlice.reducer;