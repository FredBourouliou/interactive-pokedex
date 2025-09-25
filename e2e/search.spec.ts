import { test, expect } from './utils/test-fixtures';
import { searchPokemon } from './utils/test-fixtures';

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');
  });

  test('search by name shows correct results', async ({ page }) => {
    // Search for Pikachu
    await searchPokemon(page, 'Pikachu');

    // Should show Pikachu card
    const cards = page.getByTestId('pokemon-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText(/Pikachu/i);
  });

  test('search by ID shows correct Pokémon', async ({ page }) => {
    // Search for Pokémon #25 (Pikachu)
    await searchPokemon(page, '25');

    // Should show Pikachu
    const cards = page.getByTestId('pokemon-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText(/Pikachu/i);
    await expect(cards.first()).toContainText(/#025/);
  });

  test('search with partial name matches multiple Pokémon', async ({ page }) => {
    // Search for 'char' (should match Charmander, Charmeleon, Charizard)
    await searchPokemon(page, 'char');

    // Should show multiple results
    const cards = page.getByTestId('pokemon-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // All results should contain 'char' in their names
    for (let i = 0; i < count; i++) {
      const name = await cards.nth(i).locator('.pokemon-name').textContent();
      expect(name?.toLowerCase()).toContain('char');
    }
  });

  test('search empty resets to default list', async ({ page }) => {
    // First search for something
    await searchPokemon(page, 'Pikachu');
    await expect(page.getByTestId('pokemon-card')).toHaveCount(1);

    // Clear search and submit
    await page.getByTestId('search-input').clear();
    await page.getByTestId('search-button').click();
    await page.waitForLoadState('networkidle');

    // Should show default list again
    await expect(page.getByTestId('pokemon-card')).toHaveCount(20);
  });

  test('invalid search shows no results message', async ({ page }) => {
    // Search for non-existent Pokémon
    await searchPokemon(page, 'nonexistentpokemonxyz123');

    // Should show no results
    const cards = page.getByTestId('pokemon-card');
    await expect(cards).toHaveCount(0);

    // Should show a no results message or empty state
    await expect(page.locator('text=/no.*pokemon.*found|no.*results/i')).toBeVisible();
  });
});