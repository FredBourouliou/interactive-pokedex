import { test, expect } from './utils/pokeapi-mock';

const cards = '.pokemon-card-enhanced';

test.describe('Pokédex list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await expect(page.locator(cards).first()).toBeVisible();
  });

  test('loads the 151 Kanto Pokémon by default', async ({ page }) => {
    await expect(page.locator(cards)).toHaveCount(151);
    await expect(page.locator(cards).first()).toContainText('#001');
    await expect(page.locator(cards).first()).toContainText('bulbasaur');
  });

  test('search filters by name', async ({ page }) => {
    await page.getByPlaceholder('Search by name or ID...').fill('char');
    await expect(page.locator(cards)).toHaveCount(3);
    await expect(page.locator(`${cards} .pokemon-name`)).toHaveText(['charmander', 'charmeleon', 'charizard']);
  });

  test('search with no match shows an empty list', async ({ page }) => {
    await page.getByPlaceholder('Search by name or ID...').fill('nothing-matches-this');
    await expect(page.locator(cards)).toHaveCount(0);
    await expect(page.getByText('Discover and explore 0 Pokémon')).toBeVisible();
  });

  test('type filter keeps only Pokémon of that type', async ({ page }) => {
    const typeGroup = page.locator('.filter-group').filter({ has: page.locator('label', { hasText: /^Type$/ }) });
    await typeGroup.locator('select').selectOption('electric');
    await expect(page.locator(`${cards} .pokemon-name`)).toHaveText(['pikachu', 'raichu']);
  });

  test('region selector loads the matching ID range', async ({ page }) => {
    await page.getByRole('button', { name: /Johto/ }).click();
    await expect(page.locator(cards)).toHaveCount(100);
    await expect(page.locator(cards).first()).toContainText('#152');
    await expect(page.locator(cards).first()).toContainText('chikorita');
  });
});

test.describe('Pokémon detail', () => {
  test('opens from the list and shows API data', async ({ page }) => {
    await page.goto('./');
    await page.getByPlaceholder('Search by name or ID...').fill('pikachu');
    await page.locator(cards).first().click();

    await expect(page).toHaveURL(/#\/pokemon\/25$/);
    await expect(page.locator('.detail-name')).toHaveText('pikachu');
    await expect(page.locator('.detail-id')).toHaveText('#025');
    await expect(page.locator('.pokemon-type')).toHaveText(['electric']);
    await expect(page.getByText('Test description for pikachu.')).toBeVisible();
  });

  test('deep link survives a page reload (hash routing)', async ({ page }) => {
    await page.goto('./#/pokemon/6');
    await expect(page.locator('.detail-name')).toHaveText('charizard');
    await page.reload();
    await expect(page.locator('.detail-name')).toHaveText('charizard');
  });

  // Regression: the badge used to read "Generation I" for any generation name containing an "i".
  for (const [id, badge] of [
    [25, 'Generation I (Kanto)'],
    [152, 'Generation II (Johto)'],
    [448, 'Generation IV (Sinnoh)'],
    [700, 'Generation VI (Kalos)'],
    [810, 'Generation VIII (Galar)'],
    [1000, 'Generation IX (Paldea)'],
  ] as const) {
    test(`generation badge for #${id} reads "${badge}"`, async ({ page }) => {
      await page.goto(`./#/pokemon/${id}`);
      await expect(page.locator('.generation-badge')).toHaveText(badge);
    });
  }

  test('unknown Pokémon shows an error message', async ({ page }) => {
    await page.goto('./#/pokemon/99999');
    await expect(page.getByText('Failed to fetch Pokémon data')).toBeVisible();
  });
});

test.describe('Other pages', () => {
  test('header navigation reaches every page', async ({ page }) => {
    await page.goto('./');
    const nav = page.locator('.nav-section');
    const pages: [string, RegExp, string][] = [
      ['Teams', /#\/teams$/, 'Team Builder'],
      ['Compare', /#\/comparison$/, 'Pokémon Comparison Tool'],
      ['Calculator', /#\/calculator$/, 'Damage Calculator'],
      ['Favorites', /#\/favorites$/, 'My Favorites'],
    ];
    for (const [label, url, heading] of pages) {
      await nav.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole('heading', { level: 1, name: new RegExp(heading) })).toBeVisible();
    }
  });

  test('a created team is persisted in localStorage', async ({ page }) => {
    await page.goto('./#/teams');
    await page.getByRole('button', { name: /New Team/ }).click();
    await page.getByPlaceholder('Enter team name...').fill('E2E Team');
    await page.getByRole('button', { name: 'Create Team' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'E2E Team' })).toBeVisible();

    await page.reload();
    await expect(page.getByText('E2E Team').first()).toBeVisible();
  });

  test('comparison adds Pokémon side by side', async ({ page }) => {
    await page.goto('./#/comparison');
    for (const name of ['bulbasaur', 'charmander']) {
      await page.getByRole('button', { name: /Add Pokémon/ }).click();
      await page.locator('.selector-pokemon', { hasText: name }).click();
    }
    await expect(page.locator('.comparison-pokemon-card')).toHaveCount(2);
    await expect(page.locator('.selection-count')).toHaveText('2');
  });

  test('damage calculator computes the default scenario', async ({ page }) => {
    await page.goto('./#/calculator');
    await page.getByRole('button', { name: /Calculate Damage/ }).click();
    // Level 50, 100 Atk vs 100 Def, 80 BP, neutral: floor(37.2 * 0.85) .. floor(37.2)
    await expect(page.locator('.damage-number')).toHaveText(['31', '37']);
  });
});
