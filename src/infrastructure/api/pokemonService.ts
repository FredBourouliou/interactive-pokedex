import axios from 'axios';

export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      }
    }
    versions?: {
      'generation-v'?: {
        'black-white'?: {
          animated?: {
            front_default?: string;
          }
        }
      }
    }
  };
  types: {
    type: {
      name: string;
    }
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    }
  }[];
  height: number;
  weight: number;
  abilities: {
    ability: {
      name: string;
    }
  }[];
  species: {
    url: string;
  };
}

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    }
  }[];
  color: {
    name: string;
  };
  genera: {
    genus: string;
    language: {
      name: string;
    }
  }[];
  generation: {
    name: string;
    url: string;
  };
}

export interface Generation {
  id: number;
  name: string;
  pokemon_species: {
    name: string;
    url: string;
  }[];
  main_region: {
    name: string;
  };
}

const API_URL = 'https://pokeapi.co/api/v2';

// Structure des limites de Pokémon par génération
export const GENERATIONS = [
  { id: 1, name: 'Generation I', region: 'Kanto', limit: 151, offset: 0 },
  { id: 2, name: 'Generation II', region: 'Johto', limit: 100, offset: 151 },
  { id: 3, name: 'Generation III', region: 'Hoenn', limit: 135, offset: 251 },
  { id: 4, name: 'Generation IV', region: 'Sinnoh', limit: 107, offset: 386 },
  { id: 5, name: 'Generation V', region: 'Unova', limit: 156, offset: 493 },
  { id: 6, name: 'Generation VI', region: 'Kalos', limit: 72, offset: 649 },
  { id: 7, name: 'Generation VII', region: 'Alola', limit: 88, offset: 721 },
  { id: 8, name: 'Generation VIII', region: 'Galar', limit: 89, offset: 809 },
  { id: 9, name: 'Generation IX', region: 'Paldea', limit: 103, offset: 898 },
];

export const getPokemonList = async (limit: number = 50, offset: number = 0): Promise<{ id: number; name: string; url: string }[]> => {
  try {
    const response = await axios.get(`${API_URL}/pokemon?limit=${limit}&offset=${offset}`);
    return response.data.results.map((pokemon: any, index: number) => ({
      ...pokemon,
      id: offset + index + 1
    }));
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
};

export const getGenerationDetails = async (generationId: number): Promise<Generation> => {
  try {
    const response = await axios.get(`${API_URL}/generation/${generationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching generation details for ${generationId}:`, error);
    throw error;
  }
};

export const getPokemonByGeneration = async (generationId: number): Promise<{ id: number; name: string; url: string }[]> => {
  try {
    const genInfo = GENERATIONS.find(gen => gen.id === generationId);
    
    if (!genInfo) {
      throw new Error(`Generation ${generationId} not found`);
    }
    
    return getPokemonList(genInfo.limit, genInfo.offset);
  } catch (error) {
    console.error(`Error fetching Pokemon for generation ${generationId}:`, error);
    throw error;
  }
};

export const getPokemonDetails = async (idOrName: number | string): Promise<Pokemon> => {
  try {
    const response = await axios.get(`${API_URL}/pokemon/${idOrName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pokemon details for ${idOrName}:`, error);
    throw error;
  }
};

export const getPokemonSpecies = async (idOrName: number | string): Promise<PokemonSpecies> => {
  try {
    const response = await axios.get(`${API_URL}/pokemon-species/${idOrName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pokemon species for ${idOrName}:`, error);
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

// Fonction pour récupérer les gifs animés
export const getAnimatedSprite = (pokemon: Pokemon): string => {
  // Essayer d'abord d'obtenir le sprite animé de la génération 5
  const animatedSprite = pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default;
  
  // Si l'animé est disponible, l'utiliser
  if (animatedSprite) {
    return animatedSprite;
  }
  
  // Sinon, chercher une alternative animée sur un service externe
  // Pokémon Showdown a des GIFs animés pour presque tous les Pokémon
  return `https://play.pokemonshowdown.com/sprites/ani/${pokemon.name.toLowerCase().replace(/-/g, '').replace(/\./g, '').replace(/'/g, '')}.gif`;
}; 