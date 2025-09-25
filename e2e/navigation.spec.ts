import { test, expect } from './utils/test-fixtures';

test.describe('Navigation', () => {
  test('landing page renders and lists initial Pokémon', async ({ page }) => {
    await page.goto('/');

    // Check title is present
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Interactive Pokédex/i);

    // Check Pokémon cards are visible
    await expect(page.getByTestId('pokemon-card').first()).toBeVisible();

    // Should have multiple Pokémon cards
    const cards = page.getByTestId('pokemon-card');
    await expect(cards).toHaveCount(20); // Default page size
  });

  test('can navigate to details page from list', async ({ page }) => {
    await page.goto('/');

    // Wait for cards to load
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Click on the first Pokémon card
    const firstCard = page.getByTestId('pokemon-card').first();
    const pokemonName = await firstCard.locator('.pokemon-name').textContent();

    await firstCard.click();

    // Should navigate to details page
    await expect(page).toHaveURL(/\/pokemon\/\d+/);

    // Details page should show Pokémon name
    await expect(page.locator('.pokemon-detail')).toBeVisible();
    await expect(page.locator('h1')).toContainText(pokemonName || '');
  });

  test('can navigate between generations', async ({ page }) => {
    await page.goto('/');

    // Click generation selector
    await page.getByTestId('filter-select').click();

    // Select Generation II
    await page.getByText('Generation II').click();

    // Wait for new Pokémon to load
    await page.waitForLoadState('networkidle');

    // Should show Generation II Pokémon (IDs 152-251)
    const firstCard = page.getByTestId('pokemon-card').first();
    await expect(firstCard).toBeVisible();
    const pokemonId = await firstCard.locator('.pokemon-id').textContent();

    // Generation II starts at #152
    expect(parseInt(pokemonId?.replace('#', '') || '0')).toBeGreaterThanOrEqual(152);
  });
});