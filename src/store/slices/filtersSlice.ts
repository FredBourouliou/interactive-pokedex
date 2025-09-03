import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterOptions } from '../../core/types';

interface FiltersState extends FilterOptions {
  isFilterPanelOpen: boolean;
  activeFiltersCount: number;
}

const initialState: FiltersState = {
  types: [],
  generations: [],
  stats: {},
  abilities: [],
  height: {},
  weight: {},
  searchTerm: '',
  isLegendary: undefined,
  isMythical: undefined,
  isBaby: undefined,
  hasGenderDifferences: undefined,
  eggGroups: [],
  colors: [],
  isFilterPanelOpen: false,
  activeFiltersCount: 0,
};

const countActiveFilters = (state: FiltersState): number => {
  let count = 0;
  if (state.types && state.types.length > 0) count++;
  if (state.generations && state.generations.length > 0) count++;
  if (state.abilities && state.abilities.length > 0) count++;
  if (state.eggGroups && state.eggGroups.length > 0) count++;
  if (state.colors && state.colors.length > 0) count++;
  if (state.searchTerm) count++;
  if (state.isLegendary !== undefined) count++;
  if (state.isMythical !== undefined) count++;
  if (state.isBaby !== undefined) count++;
  if (state.hasGenderDifferences !== undefined) count++;
  if (state.height?.min || state.height?.max) count++;
  if (state.weight?.min || state.weight?.max) count++;
  if (state.stats && Object.keys(state.stats).length > 0) {
    count += Object.keys(state.stats).length;
  }
  return count;
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setTypeFilter: (state, action: PayloadAction<string[]>) => {
      state.types = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setGenerationFilter: (state, action: PayloadAction<number[]>) => {
      state.generations = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setStatsFilter: (state, action: PayloadAction<FilterOptions['stats']>) => {
      state.stats = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setAbilitiesFilter: (state, action: PayloadAction<string[]>) => {
      state.abilities = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setHeightFilter: (state, action: PayloadAction<FilterOptions['height']>) => {
      state.height = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setWeightFilter: (state, action: PayloadAction<FilterOptions['weight']>) => {
      state.weight = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setLegendaryFilter: (state, action: PayloadAction<boolean | undefined>) => {
      state.isLegendary = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setMythicalFilter: (state, action: PayloadAction<boolean | undefined>) => {
      state.isMythical = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setBabyFilter: (state, action: PayloadAction<boolean | undefined>) => {
      state.isBaby = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setGenderDifferencesFilter: (state, action: PayloadAction<boolean | undefined>) => {
      state.hasGenderDifferences = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setEggGroupsFilter: (state, action: PayloadAction<string[]>) => {
      state.eggGroups = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    setColorsFilter: (state, action: PayloadAction<string[]>) => {
      state.colors = action.payload;
      state.activeFiltersCount = countActiveFilters(state);
    },
    toggleFilterPanel: (state) => {
      state.isFilterPanelOpen = !state.isFilterPanelOpen;
    },
    clearAllFilters: () => initialState,
    applyFilters: (state, action: PayloadAction<FilterOptions>) => {
      Object.assign(state, action.payload);
      state.activeFiltersCount = countActiveFilters(state);
    },
  },
});

export const {
  setTypeFilter,
  setGenerationFilter,
  setStatsFilter,
  setAbilitiesFilter,
  setHeightFilter,
  setWeightFilter,
  setSearchTerm,
  setLegendaryFilter,
  setMythicalFilter,
  setBabyFilter,
  setGenderDifferencesFilter,
  setEggGroupsFilter,
  setColorsFilter,
  toggleFilterPanel,
  clearAllFilters,
  applyFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;