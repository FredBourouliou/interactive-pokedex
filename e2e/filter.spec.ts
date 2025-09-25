import { test, expect } from './utils/test-fixtures';

test.describe('Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');
  });

  test('filter by generation shows correct Pokémon range', async ({ page }) => {
    // Click generation selector
    await page.getByTestId('filter-select').click();

    // Select Generation III (Hoenn - IDs 252-386)
    await page.getByText('Generation III').click();

    // Wait for filtered results
    await page.waitForLoadState('networkidle');

    // Check that all visible Pokémon are from Gen III
    const cards = page.getByTestId('pokemon-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Check first and last Pokémon IDs
    const firstId = await cards.first().locator('.pokemon-id').textContent();
    const lastId = await cards.last().locator('.pokemon-id').textContent();

    const firstNum = parseInt(firstId?.replace('#', '') || '0');
    const lastNum = parseInt(lastId?.replace('#', '') || '0');

    // Generation III is Pokémon #252-386
    expect(firstNum).toBeGreaterThanOrEqual(252);
    expect(lastNum).toBeLessThanOrEqual(386);
  });

  test('switching between generations updates the list', async ({ page }) => {
    // Start with Generation I
    const genSelector = page.getByTestId('filter-select');
    await genSelector.click();
    await page.getByText('Generation I').click();
    await page.waitForLoadState('networkidle');

    // Get first Pokémon ID from Gen I
    const gen1FirstId = await page.getByTestId('pokemon-card').first().locator('.pokemon-id').textContent();
    const gen1Num = parseInt(gen1FirstId?.replace('#', '') || '0');
    expect(gen1Num).toBeLessThanOrEqual(151);

    // Switch to Generation V
    await genSelector.click();
    await page.getByText('Generation V').click();
    await page.waitForLoadState('networkidle');

    // Get first Pokémon ID from Gen V
    const gen5FirstId = await page.getByTestId('pokemon-card').first().locator('.pokemon-id').textContent();
    const gen5Num = parseInt(gen5FirstId?.replace('#', '') || '0');

    // Generation V starts at #494
    expect(gen5Num).toBeGreaterThanOrEqual(494);
  });

  test('generation filter persists when navigating to detail and back', async ({ page }) => {
    // Select Generation IV
    await page.getByTestId('filter-select').click();
    await page.getByText('Generation IV').click();
    await page.waitForLoadState('networkidle');

    // Click on a Pokémon to go to details
    const firstCard = page.getByTestId('pokemon-card').first();
    const pokemonId = await firstCard.locator('.pokemon-id').textContent();
    await firstCard.click();

    // Should be on details page
    await expect(page).toHaveURL(/\/pokemon\/\d+/);

    // Go back to list
    await page.goBack();

    // Generation IV should still be selected
    await expect(page.getByTestId('filter-select')).toContainText('Generation IV');

    // Should still show Gen IV Pokémon
    const currentFirstId = await page.getByTestId('pokemon-card').first().locator('.pokemon-id').textContent();
    expect(currentFirstId).toBe(pokemonId);
  });
});