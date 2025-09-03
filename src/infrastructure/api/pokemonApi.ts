import axios from 'axios';
import { Pokemon, PokemonSpecies, EvolutionChain, Move, Type, Ability, Generation } from '../../core/types';

const API_URL = 'https://pokeapi.co/api/v2';
const TCG_API_URL = 'https://api.pokemontcg.io/v2';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const cache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCached = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCached = <T>(key: string, data: T): T => {
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};

export const GENERATIONS = [
  { id: 1, name: 'Generation I', region: 'Kanto', limit: 151, offset: 0 },
  { id: 2, name: 'Generation II', region: 'Johto', limit: 100, offset: 151 },
  { id: 3, name: 'Generation III', region: 'Hoenn', limit: 135, offset: 251 },
  { id: 4, name: 'Generation IV', region: 'Sinnoh', limit: 107, offset: 386 },
  { id: 5, name: 'Generation V', region: 'Unova', limit: 156, offset: 493 },
  { id: 6, name: 'Generation VI', region: 'Kalos', limit: 72, offset: 649 },
  { id: 7, name: 'Generation VII', region: 'Alola', limit: 88, offset: 721 },
  { id: 8, name: 'Generation VIII', region: 'Galar', limit: 96, offset: 809 },
  { id: 9, name: 'Generation IX', region: 'Paldea', limit: 105, offset: 905 },
];

export const getPokemonList = async (limit: number = 50, offset: number = 0): Promise<{ id: number; name: string; url: string }[]> => {
  const cacheKey = `pokemon-list-${limit}-${offset}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axiosInstance.get(`/pokemon?limit=${limit}&offset=${offset}`);
    const results = response.data.results.map((pokemon: any, index: number) => ({
      ...pokemon,
      id: offset + index + 1
    }));
    return setCached(cacheKey, results);
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
};

export const getPokemonByGeneration = async (generationId: number): Promise<{ id: number; name: string; url: string }[]> => {
  const genInfo = GENERATIONS.find(gen => gen.id === generationId);
  if (!genInfo) {
    throw new Error(`Generation ${generationId} not found`);
  }
  return getPokemonList(genInfo.limit, genInfo.offset);
};

export const getPokemonDetails = async (idOrName: number | string): Promise<Pokemon> => {
  const cacheKey = `pokemon-${idOrName}`;
  const cached = getCached<Pokemon>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axiosInstance.get(`/pokemon/${idOrName}`);
    return setCached(cacheKey, response.data);
  } catch (error) {
    console.error(`Error fetching Pokemon details for ${idOrName}:`, error);
    throw error;
  }
};

export const getPokemonSpecies = async (idOrName: number | string): Promise<PokemonSpecies> => {
  const cacheKey = `species-${idOrName}`;
  const cached = getCached<PokemonSpecies>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axiosInstance.get(`/pokemon-species/${idOrName}`);
    return setCached(cacheKey, response.data);
  } catch (error) {
    console.error(`Error fetching Pokemon species for ${idOrName}:`, error);
    throw error;
  }
};

export const getEvolutionChain = async (url: string): Promise<EvolutionChain> => {
  const cacheKey = `evolution-${url}`;
  const cached = getCached<EvolutionChain>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(url);
    return setCached(cacheKey, response.data);
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    throw error;
  }
};

export const getMove = async (idOrName: number | string): Promise<Move> => {
  const cacheKey = `move-${idOrName}`;
  const cached = getCached<Move>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axiosInstance.get(`/move/${idOrName}`);
    return setCached(cacheKey, response.data);
  } catch (error) {
    console.error(`Error fetching move ${idOrName}:`, error);
    throw error;
  }
};

export const getType = async (name: string): Promise<Type> => {
  const cacheKey = `type-${name}`;
  const cached = getCached<Type>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axiosInstance.get(`/type/${name}`);
    return setCached(cacheKey, response.data);
  } catch (error) {
    console.error(`Error fetching type ${name}:`, error);
    throw error;
  }
};

export const getAbility = async (idOrName: number | string): Promise<Ability> => {
  const cacheKey = `ability-${idOrName}`;
  const cached = getCached<Ability>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axiosInstance.get(`/ability/${idOrName}`);
    return setCached(cacheKey, response.data);
  } catch (error) {
    console.error(`Error fetching ability ${idOrName}:`, error);
    throw error;
  }
};

export const getTypeColor = (type: string): string => {
  const typeColors: Record<string, string> = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
  };
  
  return typeColors[type.toLowerCase()] || '#777777';
};

export const getAnimatedSprite = (pokemon: Pokemon, shiny: boolean = false): string => {
  if (shiny && pokemon.sprites.front_shiny) {
    return pokemon.sprites.front_shiny;
  }
  
  const animatedSprite = pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default;
  if (animatedSprite) {
    return animatedSprite;
  }
  
  const showdownSprite = shiny ? 
    `https://play.pokemonshowdown.com/sprites/ani-shiny/${pokemon.name.toLowerCase()}.gif` :
    `https://play.pokemonshowdown.com/sprites/ani/${pokemon.name.toLowerCase()}.gif`;
  
  return showdownSprite;
};

export const getPokemonCry = (id: number): string => {
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
};

export const getLegacyCry = (id: number): string => {
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${id}.ogg`;
};

export const searchPokemon = async (query: string): Promise<Pokemon[]> => {
  const results: Pokemon[] = [];
  const lowerQuery = query.toLowerCase();
  
  try {
    if (!isNaN(Number(query))) {
      const pokemon = await getPokemonDetails(Number(query));
      results.push(pokemon);
    } else {
      const allPokemon = await getPokemonList(1010, 0);
      const matches = allPokemon.filter(p => 
        p.name.toLowerCase().includes(lowerQuery)
      ).slice(0, 20);
      
      const detailedPokemon = await Promise.all(
        matches.map(p => getPokemonDetails(p.id))
      );
      results.push(...detailedPokemon);
    }
  } catch (error) {
    console.error('Error searching Pokemon:', error);
  }
  
  return results;
};

export const getAllTypes = async (): Promise<string[]> => {
  const cacheKey = 'all-types';
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axiosInstance.get('/type');
    const types = response.data.results.map((t: any) => t.name);
    return setCached(cacheKey, types);
  } catch (error) {
    console.error('Error fetching types:', error);
    throw error;
  }
};

export const getAllAbilities = async (): Promise<{ name: string; url: string }[]> => {
  const cacheKey = 'all-abilities';
  const cached = getCached<any[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axiosInstance.get('/ability?limit=500');
    return setCached(cacheKey, response.data.results);
  } catch (error) {
    console.error('Error fetching abilities:', error);
    throw error;
  }
};

export const getAllEggGroups = async (): Promise<string[]> => {
  const cacheKey = 'all-egg-groups';
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axiosInstance.get('/egg-group');
    const groups = response.data.results.map((g: any) => g.name);
    return setCached(cacheKey, groups);
  } catch (error) {
    console.error('Error fetching egg groups:', error);
    throw error;
  }
};