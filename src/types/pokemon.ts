export interface PokemonType {
  type: {
    name: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: PokemonStat[];
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
        front_shiny?: string;
      };
    };
    front_default: string;
    front_shiny?: string;
  };
  species: {
    name?: string;
    url: string;
  };
  cries?: {
    latest?: string;
    legacy?: string;
  };
  forms?: {
    name: string;
    url: string;
  }[];
  abilities?: PokemonAbility[];
}

export interface PokemonFormDetail {
  name: string;
  form_name: string;
  displayName: string;
  spriteDefault: string;
  spriteShiny?: string;
}

export interface VarietyItem {
  name: string;
  url: string;
  id?: number;
  displayName?: string;
  spriteDefault?: string;
  spriteShiny?: string;
}

export interface EvolutionNode {
  name: string;
  id: number;
  condition?: string;
  evolves_to: EvolutionNode[];
}

export interface TcgCardBrief {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  price?: number;
}

export interface TcgSetBrief {
  id: string;
  name: string;
  symbol?: string;
  logo?: string;
  cardCount?: {
    total?: number;
    official?: number;
  };
}

export interface UserCollectionItem {
  id: string;
  name: string;
  localId: string;
  image?: string;
  rarity?: string;
  price?: number;
  addedAt: number;
}

export interface TcgAttack {
  cost?: string[];
  name: string;
  effect?: string;
  damage?: string | number;
}

export interface TcgAbility {
  type?: string;
  name: string;
  effect?: string;
}

export interface TcgCardDetail {
  id: string;
  localId?: string;
  name: string;
  category?: string;
  image?: string;
  rarity?: string;
  illustrator?: string;
  hp?: number;
  stage?: string;
  types?: string[];
  abilities?: TcgAbility[];
  attacks?: TcgAttack[];
  weaknesses?: { type: string; value: string }[];
  resistances?: { type: string; value: string }[];
  retreat?: number;
  legal?: {
    standard?: boolean;
    expanded?: boolean;
  };
  set?: {
    name: string;
    logo?: string;
  };
  pricing?: {
    tcgplayer?: {
      marketPrice?: number;
      holofoil?: { marketPrice?: number };
      normal?: { marketPrice?: number };
    };
    cardmarket?: {
      avg?: number;
      trend?: number;
    };
  };
}

export interface QuickPokemon {
  name: string;
  id: number;
}

export interface GenerationInfo {
  id: number;
  name: string;
  region: string;
  startId: number;
  endId: number;
}

export interface TypeMatchups {
  quadWeak: string[];
  doubleWeak: string[];
  halfResist: string[];
  quadResist: string[];
  immune: string[];
}
