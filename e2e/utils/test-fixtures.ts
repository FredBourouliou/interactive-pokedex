import { test as base } from '@playwright/test';

type Fixtures = {
  // Helper fixtures can be added here if needed
  // Examples: auth state, storage helpers, API mocks, etc.
};

export const test = base.extend<Fixtures>({
  // Add custom fixtures here as needed
});

export const expect = test.expect;

// Helper functions
export const waitForPokemonList = async (page: any) => {
  await page.waitForSelector('[data-testid="pokemon-card"]', { timeout: 10000 });
};

export const searchPokemon = async (page: any, searchTerm: string) => {
  const searchInput = page.getByTestId('search-input');
  await searchInput.clear();
  await searchInput.fill(searchTerm);
  await page.getByTestId('search-button').click();
  await page.waitForLoadState('networkidle');
};