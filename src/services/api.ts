import { Pokemon } from '../types/pokemon';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemonList = async (limit: number = 20, offset: number = 0) => {
  const response = await fetch(`${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error('Failed to fetch pokemon list');
  return response.json();
};

export const fetchPokemonDetails = async (url: string): Promise<Pokemon> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch pokemon details');
  return response.json();
};

export const fetchPokemonById = async (id: number): Promise<Pokemon> => {
  const response = await fetch(`${API_BASE_URL}/pokemon/${id}`);
  if (!response.ok) throw new Error('Failed to fetch pokemon');
  return response.json();
};

export const fetchPokemonSpecies = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/pokemon-species/${id}`);
  if (!response.ok) throw new Error('Failed to fetch species');
  return response.json();
};

export const fetchEvolutionChain = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch evolution chain');
  return response.json();
};

export interface PokemonIndexEntry {
  id: number;
  name: string;
}

const idFromUrl = (url: string) => Number(/\/pokemon\/(\d+)\/?$/.exec(url)?.[1]);

/** Lightweight list (id + name only): one request, whatever the size of the range. */
export const fetchPokemonIndex = async (limit: number, offset: number): Promise<PokemonIndexEntry[]> => {
  const data: { results: { name: string; url: string }[] } = await fetchPokemonList(limit, offset);
  return data.results.map((p) => ({ id: idFromUrl(p.url), name: p.name }));
};

/** Pokémon having a given type, as a map of Pokémon id -> type slot (1 = primary type). */
export const fetchTypeMembers = async (type: string): Promise<Map<number, number>> => {
  const response = await fetch(`${API_BASE_URL}/type/${type}`);
  if (!response.ok) throw new Error(`Failed to fetch type ${type}`);
  const data: { pokemon: { slot: number; pokemon: { url: string } }[] } = await response.json();
  return new Map(data.pokemon.map((p) => [idFromUrl(p.pokemon.url), p.slot]));
};

/** Default sprite URL, derived from the id so cards can render before their details are loaded. */
export const spriteUrl = (id: number, shiny = false) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? 'shiny/' : ''}${id}.png`;
