export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny?: string;
    back_default?: string;
    back_shiny?: string;
    other: {
      'official-artwork': {
        front_default: string;
        front_shiny?: string;
      }
    }
    versions?: {
      'generation-v'?: {
        'black-white'?: {
          animated?: {
            front_default?: string;
            front_shiny?: string;
          }
        }
      }
    }
  };
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    }
  }[];
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    }
  }[];
  height: number;
  weight: number;
  abilities: {
    ability: {
      name: string;
      url: string;
    }
    is_hidden: boolean;
    slot: number;
  }[];
  species: {
    name: string;
    url: string;
  };
  moves: {
    move: {
      name: string;
      url: string;
    }
    version_group_details: {
      level_learned_at: number;
      move_learn_method: {
        name: string;
        url: string;
      }
      version_group: {
        name: string;
        url: string;
      }
    }[]
  }[];
  base_experience?: number;
  held_items: any[];
  location_area_encounters: string;
  order: number;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: {
    name: string;
    url: string;
  };
  pokedex_numbers: {
    entry_number: number;
    pokedex: {
      name: string;
      url: string;
    }
  }[];
  egg_groups: {
    name: string;
    url: string;
  }[];
  color: {
    name: string;
    url: string;
  };
  shape: {
    name: string;
    url: string;
  };
  evolves_from_species: {
    name: string;
    url: string;
  } | null;
  evolution_chain: {
    url: string;
  };
  habitat: {
    name: string;
    url: string;
  } | null;
  generation: {
    name: string;
    url: string;
  };
  names: {
    name: string;
    language: {
      name: string;
      url: string;
    }
  }[];
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
      url: string;
    }
    version: {
      name: string;
      url: string;
    }
  }[];
  form_descriptions: any[];
  genera: {
    genus: string;
    language: {
      name: string;
      url: string;
    }
  }[];
  varieties: {
    is_default: boolean;
    pokemon: {
      name: string;
      url: string;
    }
  }[];
}

export interface EvolutionChain {
  id: number;
  baby_trigger_item: any | null;
  chain: EvolutionDetail;
}

export interface EvolutionDetail {
  is_baby: boolean;
  species: {
    name: string;
    url: string;
  };
  evolution_details: {
    item: any | null;
    trigger: {
      name: string;
      url: string;
    };
    gender: number | null;
    held_item: any | null;
    known_move: any | null;
    known_move_type: any | null;
    location: any | null;
    min_level: number | null;
    min_happiness: number | null;
    min_beauty: number | null;
    min_affection: number | null;
    needs_overworld_rain: boolean;
    party_species: any | null;
    party_type: any | null;
    relative_physical_stats: number | null;
    time_of_day: string;
    trade_species: any | null;
    turn_upside_down: boolean;
  }[];
  evolves_to: EvolutionDetail[];
}

export interface Move {
  id: number;
  name: string;
  accuracy: number | null;
  effect_chance: number | null;
  pp: number;
  priority: number;
  power: number | null;
  damage_class: {
    name: string;
    url: string;
  };
  effect_entries: {
    effect: string;
    language: {
      name: string;
      url: string;
    }
    short_effect: string;
  }[];
  type: {
    name: string;
    url: string;
  };
  target: {
    name: string;
    url: string;
  };
  meta: {
    ailment: {
      name: string;
      url: string;
    };
    category: {
      name: string;
      url: string;
    };
    min_hits: number | null;
    max_hits: number | null;
    min_turns: number | null;
    max_turns: number | null;
    drain: number;
    healing: number;
    crit_rate: number;
    ailment_chance: number;
    flinch_chance: number;
    stat_chance: number;
  };
}

export interface Type {
  id: number;
  name: string;
  damage_relations: {
    no_damage_to: { name: string; url: string }[];
    half_damage_to: { name: string; url: string }[];
    double_damage_to: { name: string; url: string }[];
    no_damage_from: { name: string; url: string }[];
    half_damage_from: { name: string; url: string }[];
    double_damage_from: { name: string; url: string }[];
  };
  pokemon: {
    pokemon: {
      name: string;
      url: string;
    };
    slot: number;
  }[];
  moves: {
    name: string;
    url: string;
  }[];
}

export interface Ability {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: {
    name: string;
    url: string;
  };
  names: {
    name: string;
    language: {
      name: string;
      url: string;
    }
  }[];
  effect_entries: {
    effect: string;
    language: {
      name: string;
      url: string;
    }
    short_effect: string;
  }[];
  pokemon: {
    is_hidden: boolean;
    slot: number;
    pokemon: {
      name: string;
      url: string;
    }
  }[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  pokemon: TeamPokemon[];
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  format?: 'singles' | 'doubles' | 'vgc' | 'smogon';
}

export interface TeamPokemon {
  pokemon: Pokemon;
  nickname?: string;
  level: number;
  nature?: Nature;
  ability?: string;
  item?: string;
  moves: string[];
  evs?: Stats;
  ivs?: Stats;
  shiny?: boolean;
}

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Nature {
  id: number;
  name: string;
  decreased_stat: { name: string } | null;
  increased_stat: { name: string } | null;
  likes_flavor: { name: string } | null;
  hates_flavor: { name: string } | null;
}

export interface Generation {
  id: number;
  name: string;
  region: string;
  pokemon_species: {
    name: string;
    url: string;
  }[];
  main_region: {
    name: string;
  };
  limit: number;
  offset: number;
}

export interface FilterOptions {
  types?: string[];
  generations?: number[];
  stats?: {
    hp?: { min?: number; max?: number };
    attack?: { min?: number; max?: number };
    defense?: { min?: number; max?: number };
    specialAttack?: { min?: number; max?: number };
    specialDefense?: { min?: number; max?: number };
    speed?: { min?: number; max?: number };
    total?: { min?: number; max?: number };
  };
  abilities?: string[];
  height?: { min?: number; max?: number };
  weight?: { min?: number; max?: number };
  searchTerm?: string;
  isLegendary?: boolean;
  isMythical?: boolean;
  isBaby?: boolean;
  hasGenderDifferences?: boolean;
  eggGroups?: string[];
  colors?: string[];
}

export interface ComparisonData {
  pokemonIds: number[];
  compareStats: boolean;
  compareTypes: boolean;
  compareAbilities: boolean;
  compareMoves: boolean;
  compareEvolutions: boolean;
}

export interface DamageCalculation {
  attacker: Pokemon;
  defender: Pokemon;
  move: Move;
  attackerLevel: number;
  defenderLevel: number;
  weather?: 'sun' | 'rain' | 'sandstorm' | 'hail' | 'none';
  terrain?: 'electric' | 'grassy' | 'misty' | 'psychic' | 'none';
  isCritical: boolean;
  effectiveness: number;
  damage: {
    min: number;
    max: number;
    average: number;
  };
  description: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto' | string;
  language: string;
  showAnimatedSprites: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  defaultGeneration: number;
  favoritesPokemon: number[];
  teams: Team[];
  compactView: boolean;
  showShinySprites: boolean;
}

export interface TCGCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  level?: string;
  hp?: string;
  types?: string[];
  attacks?: {
    name: string;
    cost: string[];
    damage: string;
    text: string;
  }[];
  weaknesses?: {
    type: string;
    value: string;
  }[];
  resistances?: {
    type: string;
    value: string;
  }[];
  retreatCost?: string[];
  set: {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    releaseDate: string;
    updatedAt: string;
    images: {
      symbol: string;
      logo: string;
    };
  };
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: {
      normal?: {
        low: number;
        mid: number;
        high: number;
        market: number;
      };
      holofoil?: {
        low: number;
        mid: number;
        high: number;
        market: number;
      };
    };
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices?: {
      averageSellPrice: number;
      lowPrice: number;
      trendPrice: number;
    };
  };
}

export interface CompetitiveData {
  usage: {
    rank: number;
    usagePercent: number;
    tier: string;
  };
  sets: {
    name: string;
    description: string;
    ability: string;
    item: string;
    nature: string;
    evs: Stats;
    ivs?: Stats;
    moves: string[];
    usage: number;
  }[];
  checks: string[];
  counters: string[];
  teammates: string[];
}