import { test, expect } from './utils/test-fixtures';

test.describe('Error States', () => {
  test('handles network errors gracefully', async ({ page }) => {
    // Intercept API calls and make them fail
    await page.route('**/api.pokemontcg.io/**', route => route.abort('failed'));
    await page.route('**/pokeapi.co/**', route => route.abort('failed'));

    // Try to navigate to the page
    await page.goto('/');

    // Should show error message
    const errorBanner = page.getByTestId('error-banner').or(
      page.locator('text=/error|failed|try again|offline/i')
    );

    await expect(errorBanner).toBeVisible({ timeout: 10000 });

    // Check for retry button if available
    const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again")');
    if (await retryButton.isVisible()) {
      // Remove route interception to allow retry
      await page.unroute('**/api.pokemontcg.io/**');
      await page.unroute('**/pokeapi.co/**');

      // Click retry
      await retryButton.click();

      // Should eventually show Pokémon cards
      await expect(page.getByTestId('pokemon-card').first()).toBeVisible({ timeout: 15000 });
    }
  });

  test('shows loading state while fetching data', async ({ page }) => {
    // Delay API responses to see loading state
    await page.route('**/pokeapi.co/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    // Navigate to page
    await page.goto('/');

    // Should show loading indicator
    const loadingIndicator = page.locator(
      '.loading, .spinner, [role="progressbar"], text=/loading/i'
    );

    await expect(loadingIndicator).toBeVisible();

    // Wait for content to load
    await expect(page.getByTestId('pokemon-card').first()).toBeVisible({ timeout: 15000 });

    // Loading should disappear
    await expect(loadingIndicator).not.toBeVisible();
  });

  test('handles slow network gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/pokeapi.co/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    // Navigate to page
    await page.goto('/');

    // Should eventually show content (with extended timeout)
    await expect(page.getByTestId('pokemon-card').first()).toBeVisible({ timeout: 20000 });
  });

  test('displays error when Pokémon details fail to load', async ({ page }) => {
    // Make only the detail API call fail
    await page.route('**/pokeapi.co/api/v2/pokemon/25', route => route.abort('failed'));

    // Navigate to Pikachu's page
    await page.goto('/pokemon/25');

    // Should show error message
    const errorMessage = page.locator('text=/error|failed|could not load/i');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('handles 404 for non-existent Pokémon', async ({ page }) => {
    // Mock 404 response for a specific Pokémon
    await page.route('**/pokeapi.co/api/v2/pokemon/99999', route => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ detail: 'Not found.' })
      });
    });

    // Try to access non-existent Pokémon
    await page.goto('/pokemon/99999');

    // Should show appropriate error or redirect
    const notFoundMessage = page.locator('text=/not found|does not exist|404/i');
    const isRedirected = page.url().endsWith('/');

    // Either show 404 message or redirect to home
    if (!isRedirected) {
      await expect(notFoundMessage).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByTestId('pokemon-card').first()).toBeVisible();
    }
  });
});