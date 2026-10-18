export interface GenerationInfo {
  id: number;
  /** Display name, e.g. "Generation IV". */
  name: string;
  region: string;
  /** National Dex range, inclusive. */
  range: [number, number];
  color: string;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

const REGIONS: [string, [number, number], string][] = [
  ['Kanto', [1, 151], '#FF6B6B'],
  ['Johto', [152, 251], '#4ECDC4'],
  ['Hoenn', [252, 386], '#45B7D1'],
  ['Sinnoh', [387, 493], '#96CEB4'],
  ['Unova', [494, 649], '#FFEAA7'],
  ['Kalos', [650, 721], '#DDA0DD'],
  ['Alola', [722, 809], '#FFA07A'],
  ['Galar', [810, 905], '#98D8C8'],
  ['Paldea', [906, 1025], '#FFB6C1'],
];

export const GENERATIONS: GenerationInfo[] = REGIONS.map(([region, range, color], i) => ({
  id: i + 1,
  name: `Generation ${ROMAN[i]}`,
  region,
  range,
  color,
}));

/** Highest National Dex number covered by the app. */
export const MAX_POKEMON_ID = GENERATIONS[GENERATIONS.length - 1].range[1];

const romanToInt = (roman: string): number => {
  const values: Record<string, number> = { i: 1, v: 5, x: 10 };
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = values[roman[i]];
    const next = values[roman[i + 1]] ?? 0;
    if (current === undefined) return NaN;
    total += current < next ? -current : current;
  }
  return total;
};

/**
 * Resolves a PokéAPI generation reference (`{ name: "generation-iv", url: ".../generation/4/" }`)
 * to our generation metadata. Uses the roman numeral in the name, falling back to the id in the URL.
 */
export const generationFromApi = (generation: { name: string; url?: string }): GenerationInfo | undefined => {
  const match = /^generation-([ivx]+)$/.exec(generation.name);
  let id = match ? romanToInt(match[1]) : NaN;
  if (Number.isNaN(id) && generation.url) {
    const fromUrl = /\/generation\/(\d+)\/?$/.exec(generation.url);
    if (fromUrl) id = Number(fromUrl[1]);
  }
  return GENERATIONS.find((gen) => gen.id === id);
};
