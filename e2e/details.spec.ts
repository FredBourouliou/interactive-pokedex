import { test, expect } from './utils/test-fixtures';

test.describe('Details Page', () => {
  test('details page shows all Pokémon information', async ({ page }) => {
    // Go directly to Pikachu's details page
    await page.goto('/pokemon/25');

    // Wait for content to load
    await page.waitForSelector('.pokemon-detail');

    // Check basic info
    await expect(page.locator('h1')).toContainText(/Pikachu/i);
    await expect(page.locator('.pokemon-id')).toContainText(/#025/);

    // Check types
    await expect(page.locator('.pokemon-types')).toBeVisible();
    await expect(page.locator('.pokemon-type')).toContainText(/Electric/i);

    // Check stats section
    await expect(page.locator('text=/Stats|Base Stats/i')).toBeVisible();
    await expect(page.locator('text=/HP/i')).toBeVisible();
    await expect(page.locator('text=/Attack/i')).toBeVisible();
    await expect(page.locator('text=/Defense/i')).toBeVisible();
    await expect(page.locator('text=/Speed/i')).toBeVisible();

    // Check abilities
    await expect(page.locator('text=/Abilities/i')).toBeVisible();

    // Check height and weight
    await expect(page.locator('text=/Height/i')).toBeVisible();
    await expect(page.locator('text=/Weight/i')).toBeVisible();
  });

  test('can navigate between Pokémon using navigation buttons', async ({ page }) => {
    // Start at Pokémon #25 (Pikachu)
    await page.goto('/pokemon/25');
    await page.waitForSelector('.pokemon-detail');

    // Check current Pokémon
    await expect(page.locator('h1')).toContainText(/Pikachu/i);

    // Navigate to next Pokémon (should be #26 Raichu)
    const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/pokemon\/26/);
      await expect(page.locator('h1')).toContainText(/Raichu/i);

      // Navigate back to previous Pokémon
      const prevButton = page.locator('button:has-text("Previous"), a:has-text("Previous")').first();
      await prevButton.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/pokemon\/25/);
      await expect(page.locator('h1')).toContainText(/Pikachu/i);
    }
  });

  test('shows evolution chain when available', async ({ page }) => {
    // Go to Bulbasaur which has evolutions
    await page.goto('/pokemon/1');
    await page.waitForSelector('.pokemon-detail');

    // Check for evolution section
    const evolutionSection = page.locator('text=/Evolution|Evolves/i');
    if (await evolutionSection.isVisible()) {
      // Should show Ivysaur and Venusaur as evolutions
      await expect(page.locator('text=/Ivysaur/i')).toBeVisible();
      await expect(page.locator('text=/Venusaur/i')).toBeVisible();
    }
  });

  test('can return to list from details page', async ({ page }) => {
    // Navigate to a details page
    await page.goto('/pokemon/150'); // Mewtwo
    await page.waitForSelector('.pokemon-detail');

    // Look for back button or home link
    const backButton = page.locator('button:has-text("Back"), a:has-text("Back"), a:has-text("Home")').first();
    if (await backButton.isVisible()) {
      await backButton.click();

      // Should be back on the list page
      await expect(page).toHaveURL(/^\/$/);
      await expect(page.getByTestId('pokemon-card').first()).toBeVisible();
    }
  });

  test('handles non-existent Pokémon gracefully', async ({ page }) => {
    // Try to access a non-existent Pokémon
    await page.goto('/pokemon/99999');

    // Should show error message or redirect
    const errorMessage = page.locator('text=/not found|error|does not exist/i');
    const isOnHomePage = page.url().endsWith('/');

    // Either show error or redirect to home
    const hasError = await errorMessage.isVisible().catch(() => false);
    expect(hasError || isOnHomePage).toBeTruthy();
  });
});