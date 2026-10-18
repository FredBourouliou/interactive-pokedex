import { test as base, expect, type Page } from '@playwright/test';

/**
 * Deterministic stand-in for PokéAPI so the E2E suite does not depend on a
 * third-party service. Only the fields the app actually reads are returned.
 */

const API = 'https://pokeapi.co/api/v2';
const MAX_ID = 1025;

const KNOWN: Record<number, { name: string; types: string[] }> = {
  1: { name: 'bulbasaur', types: ['grass', 'poison'] },
  4: { name: 'charmander', types: ['fire'] },
  5: { name: 'charmeleon', types: ['fire'] },
  6: { name: 'charizard', types: ['fire', 'flying'] },
  25: { name: 'pikachu', types: ['electric'] },
  26: { name: 'raichu', types: ['electric'] },
  152: { name: 'chikorita', types: ['grass'] },
};

const nameOf = (id: number) => KNOWN[id]?.name ?? `testmon-${id}`;
const typesOf = (id: number) => KNOWN[id]?.types ?? ['normal'];
const idFromName = (name: string) => {
  const hit = Object.entries(KNOWN).find(([, v]) => v.name === name);
  if (hit) return Number(hit[0]);
  const m = /^testmon-(\d+)$/.exec(name);
  return m ? Number(m[1]) : NaN;
};

// 1x1 transparent PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);
const SPRITE = 'https://sprites.test/sprite.png';

const pokemon = (id: number) => ({
  id,
  name: nameOf(id),
  height: 4,
  weight: 60,
  sprites: {
    front_default: SPRITE,
    front_shiny: SPRITE,
    other: { 'official-artwork': { front_default: SPRITE } },
  },
  types: typesOf(id).map((name, i) => ({ slot: i + 1, type: { name } })),
  stats: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map((name, i) => ({
    base_stat: 40 + i * 5,
    stat: { name },
  })),
  abilities: [{ ability: { name: 'static' } }],
  species: { url: `${API}/pokemon-species/${id}/` },
});

// Last National Dex number of each generation (I..IX), as in PokéAPI.
const GENERATION_ENDS = [151, 251, 386, 493, 649, 721, 809, 905, 1025];
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix'];
const generationOf = (id: number) => {
  const index = GENERATION_ENDS.findIndex((end) => id <= end);
  return { name: `generation-${ROMAN[index]}`, url: `${API}/generation/${index + 1}/` };
};

const species = (id: number) => ({
  flavor_text_entries: [{ flavor_text: `Test description for ${nameOf(id)}.`, language: { name: 'en' } }],
  genera: [{ genus: 'Test Pokémon', language: { name: 'en' } }],
  color: { name: 'yellow' },
  generation: generationOf(id),
});

const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

/** `/type/{name}`: every Pokémon having that type, with the slot it occupies. */
const typeMembers = (type: string) => {
  const pokemon = [];
  for (let id = 1; id <= MAX_ID; id++) {
    const slot = typesOf(id).indexOf(type);
    if (slot >= 0) pokemon.push({ slot: slot + 1, pokemon: { name: nameOf(id), url: `${API}/pokemon/${id}/` } });
  }
  return { name: type, pokemon };
};

const resolveId = (raw: string) => (/^\d+$/.test(raw) ? Number(raw) : idFromName(raw));

export async function mockPokeApi(page: Page) {
  await page.route(`${API}/**`, async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^\/api\/v2\//, '').replace(/\/$/, '');
    const [resource, key] = path.split('/');

    if (resource === 'pokemon' && !key) {
      const limit = Number(url.searchParams.get('limit') ?? 20);
      const offset = Number(url.searchParams.get('offset') ?? 0);
      const results = [];
      for (let id = offset + 1; id <= Math.min(offset + limit, MAX_ID); id++) {
        results.push({ name: nameOf(id), url: `${API}/pokemon/${id}/` });
      }
      return route.fulfill({ json: { count: MAX_ID, results } });
    }

    if (resource === 'type') {
      return TYPES.includes(key)
        ? route.fulfill({ json: typeMembers(key) })
        : route.fulfill({ status: 404, body: 'Not Found' });
    }

    const id = key ? resolveId(key) : NaN;
    if (!Number.isInteger(id) || id < 1 || id > MAX_ID) {
      return route.fulfill({ status: 404, body: 'Not Found' });
    }
    if (resource === 'pokemon') return route.fulfill({ json: pokemon(id) });
    if (resource === 'pokemon-species') return route.fulfill({ json: species(id) });
    return route.fulfill({ status: 404, body: 'Not Found' });
  });

  // Sprites (PokéAPI CDN, Showdown GIFs, test placeholder) and web fonts.
  await page.route(/^https:\/\/(sprites\.test|raw\.githubusercontent\.com|play\.pokemonshowdown\.com)\//, (route) =>
    route.fulfill({ body: PNG, contentType: 'image/png' }),
  );
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) =>
    route.fulfill({ body: '', contentType: 'text/css' }),
  );
}

/** `test` with PokéAPI mocked for every page. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await mockPokeApi(page);
    await use(page);
  },
});

export { expect };
