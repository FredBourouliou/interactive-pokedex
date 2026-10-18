import { test, expect } from '@playwright/test';

// Smoke test against the real PokéAPI. Opt-in (E2E_LIVE=1) because it depends
// on a third-party service and on network conditions.
test.skip(!process.env.E2E_LIVE, 'set E2E_LIVE=1 to run against the real PokéAPI');

test('loads real data from PokéAPI', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.pokemon-card-enhanced')).toHaveCount(151, { timeout: 30_000 });
  await expect(page.locator('.pokemon-card-enhanced').first()).toContainText('bulbasaur');

  await page.goto('./#/pokemon/25');
  await expect(page.locator('.detail-name')).toHaveText('pikachu', { timeout: 15_000 });
});
