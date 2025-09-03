import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserPreferences } from '../../core/types';

const defaultSettings: UserPreferences = {
  theme: 'auto',
  language: 'en',
  showAnimatedSprites: true,
  soundEnabled: true,
  reducedMotion: false,
  defaultGeneration: 1,
  favoritesPokemon: [],
  teams: [],
  compactView: false,
  showShinySprites: false,
};

const loadSettings = (): UserPreferences => {
  const saved = localStorage.getItem('userSettings');
  if (saved) {
    return { ...defaultSettings, ...JSON.parse(saved) };
  }
  return defaultSettings;
};

const initialState = loadSettings();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<UserPreferences['theme']>) => {
      state.theme = action.payload;
      localStorage.setItem('userSettings', JSON.stringify(state));
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      localStorage.setItem('userSettings', JSON.stringify(state));
    },
    toggleAnimatedSprites: (state) => {
      state.showAnimatedSprites = !state.showAnimatedSprites;
      localStorage.setItem('userSettings', JSON.stringify(state));
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem('userSettings', JSON.stringify(state));
    },
    toggleReducedMotion: (state) => {
      state.reducedMotion = !state.reducedMotion;
      localStorage.setItem('userSettings', JSON.stringify(state));
    },
    toggleShinySprites: (state) => {
      state.showShinySprites = !state.showShinySprites;
      localStorage.setItem('userSettings', JSON.stringify(state));
    },
    toggleCompactView: (state) => {
      state.compactView = !state.compactView;
      localStorage.setItem('userSettings', JSON.stringify(state));
    },
    setDefaultGeneration: (state, action: PayloadAction<number>) => {
      state.defaultGeneration = action.payload;
      localStorage.setItem('userSettings', JSON.stringify(state));
    },
    updateSettings: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      Object.assign(state, action.payload);
      localStorage.setItem('userSettings', JSON.stringify(state));
    },
    resetSettings: () => {
      localStorage.removeItem('userSettings');
      return defaultSettings;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  toggleAnimatedSprites,
  toggleSound,
  toggleReducedMotion,
  toggleShinySprites,
  toggleCompactView,
  setDefaultGeneration,
  updateSettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;