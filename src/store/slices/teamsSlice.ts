import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Team, TeamPokemon } from '../../core/types';
import { v4 as uuidv4 } from 'uuid';

interface TeamsState {
  teams: Team[];
  currentTeam: Team | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  teams: JSON.parse(localStorage.getItem('teams') || '[]'),
  currentTeam: null,
  loading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    createTeam: (state, action: PayloadAction<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newTeam: Team = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.teams.push(newTeam);
      localStorage.setItem('teams', JSON.stringify(state.teams));
    },
    updateTeam: (state, action: PayloadAction<Team>) => {
      const index = state.teams.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.teams[index] = {
          ...action.payload,
          updatedAt: new Date(),
        };
        localStorage.setItem('teams', JSON.stringify(state.teams));
      }
    },
    deleteTeam: (state, action: PayloadAction<string>) => {
      state.teams = state.teams.filter(t => t.id !== action.payload);
      localStorage.setItem('teams', JSON.stringify(state.teams));
    },
    setCurrentTeam: (state, action: PayloadAction<Team | null>) => {
      state.currentTeam = action.payload;
    },
    addPokemonToTeam: (state, action: PayloadAction<{ teamId: string; pokemon: TeamPokemon }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team && team.pokemon.length < 6) {
        team.pokemon.push(action.payload.pokemon);
        team.updatedAt = new Date();
        localStorage.setItem('teams', JSON.stringify(state.teams));
      }
    },
    removePokemonFromTeam: (state, action: PayloadAction<{ teamId: string; pokemonIndex: number }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        team.pokemon.splice(action.payload.pokemonIndex, 1);
        team.updatedAt = new Date();
        localStorage.setItem('teams', JSON.stringify(state.teams));
      }
    },
    reorderTeamPokemon: (state, action: PayloadAction<{ teamId: string; fromIndex: number; toIndex: number }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        const [removed] = team.pokemon.splice(action.payload.fromIndex, 1);
        team.pokemon.splice(action.payload.toIndex, 0, removed);
        team.updatedAt = new Date();
        localStorage.setItem('teams', JSON.stringify(state.teams));
      }
    },
  },
});

export const {
  createTeam,
  updateTeam,
  deleteTeam,
  setCurrentTeam,
  addPokemonToTeam,
  removePokemonFromTeam,
  reorderTeamPokemon,
} = teamsSlice.actions;

export default teamsSlice.reducer;