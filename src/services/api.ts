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