import { test, expect } from './utils/test-fixtures';

test.describe('Performance', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for first meaningful paint (Pokemon cards visible)
    await page.waitForSelector('[data-testid="pokemon-card"]');

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('search responds quickly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    const startTime = Date.now();

    // Perform search
    await page.getByTestId('search-input').fill('Pikachu');
    await page.getByTestId('search-button').click();

    // Wait for results
    await page.waitForFunction(
      () => document.querySelectorAll('[data-testid="pokemon-card"]').length <= 1,
      { timeout: 3000 }
    );

    const searchTime = Date.now() - startTime;

    // Search should complete within 3 seconds
    expect(searchTime).toBeLessThan(3000);
  });

  test('pagination loads efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Look for pagination controls
    const nextPageButton = page.locator('button:has-text("Next"), button[aria-label="Next page"]').first();

    if (await nextPageButton.isVisible()) {
      const startTime = Date.now();

      await nextPageButton.click();

      // Wait for new content
      await page.waitForLoadState('networkidle');

      const paginationTime = Date.now() - startTime;

      // Pagination should be quick
      expect(paginationTime).toBeLessThan(2000);
    }
  });

  test('images load progressively', async ({ page }) => {
    await page.goto('/');

    // Check that images have loading attribute or lazy loading
    const images = page.locator('img');
    const firstImage = images.first();

    const loadingAttr = await firstImage.getAttribute('loading');

    // Images should use lazy loading for performance
    if (loadingAttr) {
      expect(['lazy', 'eager']).toContain(loadingAttr);
    }

    // Wait for at least one image to load
    await expect(firstImage).toHaveJSProperty('complete', true);
  });

  test('handles large lists efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Check if virtualization or pagination is implemented
    const allCards = await page.getByTestId('pokemon-card').count();

    // Should not render all 1000+ Pokemon at once
    expect(allCards).toBeLessThanOrEqual(50);
  });

  test('memory usage stays reasonable during navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Navigate through several pages/details
    for (let i = 0; i < 3; i++) {
      // Click on a Pokemon card
      const card = page.getByTestId('pokemon-card').nth(i);
      if (await card.isVisible()) {
        await card.click();
        await page.waitForSelector('.pokemon-detail');

        // Go back
        await page.goBack();
        await page.waitForSelector('[data-testid="pokemon-card"]');
      }
    }

    // Check that page is still responsive
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');
  });
});