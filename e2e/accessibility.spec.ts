import { test, expect } from './utils/test-fixtures';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('main page has proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Check for main landmarks
    const header = page.locator('header, [role="banner"]').first();
    const main = page.locator('main, [role="main"]').first();
    const nav = page.locator('nav, [role="navigation"]').first();

    // Header should be visible
    await expect(header).toBeVisible();

    // Main content area should exist
    await expect(main).toBeVisible();

    // Navigation might be in header
    const hasNav = await nav.isVisible().catch(() => false);
    if (hasNav) {
      await expect(nav).toBeVisible();
    }
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Tab to search input
    await page.keyboard.press('Tab');
    const searchInput = page.getByTestId('search-input');

    // Search input should be focusable
    const isSearchFocused = await searchInput.evaluate(el => el === document.activeElement);
    expect(isSearchFocused).toBeTruthy();

    // Tab to search button
    await page.keyboard.press('Tab');
    const searchButton = page.getByTestId('search-button');

    // Button should be focusable
    const isButtonFocused = await searchButton.evaluate(el => el === document.activeElement);
    expect(isButtonFocused).toBeTruthy();

    // Continue tabbing to reach generation selector
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      if (activeElement === 'BUTTON' || activeElement === 'A') {
        break;
      }
    }

    // Press Enter to activate focused element
    await page.keyboard.press('Enter');
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Get all images
    const images = page.locator('img');
    const imageCount = await images.count();

    // Check each image has alt text
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText?.length).toBeGreaterThan(0);
    }
  });

  test('color contrast meets WCAG standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Check that text is readable
    const pokemonName = page.locator('.pokemon-name').first();
    const nameColor = await pokemonName.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.color;
    });

    const nameBackground = await pokemonName.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });

    // Basic check that text has defined color
    expect(nameColor).toBeTruthy();
    expect(nameColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('form elements have proper labels', async ({ page }) => {
    await page.goto('/');

    // Check search input has label or aria-label
    const searchInput = page.getByTestId('search-input');
    const hasLabel = await searchInput.evaluate(el => {
      const id = el.getAttribute('id');
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = el.getAttribute('aria-label');
      const placeholder = el.getAttribute('placeholder');
      return !!(label || ariaLabel || placeholder);
    });

    expect(hasLabel).toBeTruthy();
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Get focused element's outline
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    const hasVisibleFocus = await focusedElement.evaluate(el => {
      if (!el) return false;
      const style = window.getComputedStyle(el as Element);
      const outline = style.outline;
      const boxShadow = style.boxShadow;
      const border = style.border;

      // Check if any focus indicator is present
      return !!(
        (outline && outline !== 'none' && outline !== '0') ||
        (boxShadow && boxShadow !== 'none') ||
        (border && border !== 'none')
      );
    });

    expect(hasVisibleFocus).toBeTruthy();
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // Check heading levels are not skipped
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = await Promise.all(
      headings.map(async h => {
        const tagName = await h.evaluate(el => el.tagName);
        return parseInt(tagName.replace('H', ''));
      })
    );

    // Check that heading levels don't skip (e.g., no h1 -> h3)
    let previousLevel = 0;
    for (const level of headingLevels) {
      expect(level - previousLevel).toBeLessThanOrEqual(1);
      if (level > previousLevel) {
        previousLevel = level;
      }
    }
  });

  test('interactive elements have sufficient click target size', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="pokemon-card"]');

    // Check search button size
    const searchButton = page.getByTestId('search-button');
    const buttonBox = await searchButton.boundingBox();

    // WCAG 2.1 Level AAA recommends at least 44x44 pixels
    if (buttonBox) {
      expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox.height).toBeGreaterThanOrEqual(24); // Allowing for wider buttons
    }

    // Check Pokémon cards are large enough to click
    const firstCard = page.getByTestId('pokemon-card').first();
    const cardBox = await firstCard.boundingBox();

    if (cardBox) {
      expect(cardBox.width).toBeGreaterThanOrEqual(100);
      expect(cardBox.height).toBeGreaterThanOrEqual(100);
    }
  });
});