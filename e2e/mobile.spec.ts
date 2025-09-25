import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 13']
});

test.describe('Mobile Experience', () => {
  test('mobile layout displays correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Check viewport is mobile size
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(768);

    // Cards should be displayed in mobile layout
    const firstCard = page.getByTestId('pokemon-card').first();
    const cardBox = await firstCard.boundingBox();

    if (cardBox && viewport) {
      // Cards should take most of the width on mobile
      expect(cardBox.width).toBeGreaterThan(viewport.width * 0.8);
    }
  });

  test('mobile navigation works with touch', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Tap on a Pokemon card
    const firstCard = page.getByTestId('pokemon-card').first();
    await firstCard.tap();

    // Should navigate to details
    await expect(page).toHaveURL(/\/pokemon\/\d+/);

    // Check back navigation
    const backButton = page.locator('button:has-text("Back"), a:has-text("Back")').first();
    if (await backButton.isVisible()) {
      await backButton.tap();
      await expect(page).toHaveURL('/');
    }
  });

  test('mobile search is accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Tap search input
    const searchInput = page.getByTestId('search-input');
    await searchInput.tap();

    // Keyboard should appear (simulated by typing)
    await searchInput.type('Charmander');

    // Tap search button
    await page.getByTestId('search-button').tap();

    // Should show search results
    await expect(page.getByTestId('pokemon-card')).toContainText(/Charmander/i);
  });

  test('mobile scrolling works smoothly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Swipe up to scroll down
    await page.locator('body').evaluate(el => {
      el.scrollTo(0, 500);
    });

    // Check scroll position changed
    const newScroll = await page.evaluate(() => window.scrollY);
    expect(newScroll).toBeGreaterThan(initialScroll);

    // More cards should be visible or loaded
    const visibleCards = await page.getByTestId('pokemon-card').count();
    expect(visibleCards).toBeGreaterThan(0);
  });

  test('mobile menu/filters are accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Tap generation filter
    const filterButton = page.getByTestId('filter-select');
    await filterButton.tap();

    // Filter dropdown should be visible and touchable
    await expect(page.locator('.generation-dropdown')).toBeVisible();

    // Tap a generation
    await page.getByText('Generation II').tap();

    // Filter should be applied
    await page.waitForLoadState('networkidle');
    const firstCard = page.getByTestId('pokemon-card').first();
    const pokemonId = await firstCard.locator('.pokemon-id').textContent();

    // Gen II starts at #152
    expect(parseInt(pokemonId?.replace('#', '') || '0')).toBeGreaterThanOrEqual(152);
  });

  test('mobile details page is optimized', async ({ page }) => {
    await page.goto('/pokemon/6'); // Charizard
    await page.waitForSelector('.pokemon-detail');

    const viewport = page.viewportSize();

    // Check image size on mobile
    const pokemonImage = page.locator('.pokemon-image, img[alt*="Charizard"]').first();
    const imageBox = await pokemonImage.boundingBox();

    if (imageBox && viewport) {
      // Image should be appropriately sized for mobile
      expect(imageBox.width).toBeLessThanOrEqual(viewport.width);
      expect(imageBox.width).toBeGreaterThan(200); // But not too small
    }

    // Stats should be readable on mobile
    const statsSection = page.locator('text=/Stats|Base Stats/i');
    await expect(statsSection).toBeVisible();

    // Check text is not too small
    const fontSize = await statsSection.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });

    const fontSizeValue = parseInt(fontSize);
    expect(fontSizeValue).toBeGreaterThanOrEqual(14); // Minimum readable size
  });

  test('mobile orientation change is handled', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Switch to landscape
    await context.setViewportSize({ width: 812, height: 375 });

    // Content should adapt
    await page.waitForTimeout(500); // Wait for layout adjustment

    const cards = page.getByTestId('pokemon-card');
    const firstCard = cards.first();
    const cardBox = await firstCard.boundingBox();

    // In landscape, cards might be in a grid
    if (cardBox) {
      expect(cardBox.width).toBeLessThan(812); // Not full width in landscape
    }

    // Switch back to portrait
    await context.setViewportSize({ width: 390, height: 844 });

    await page.waitForTimeout(500);

    // Check layout adapts back
    const newCardBox = await firstCard.boundingBox();
    if (newCardBox) {
      expect(newCardBox.width).toBeGreaterThan(300); // Wider in portrait
    }
  });
});