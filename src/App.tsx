import { useState, useEffect, useRef } from 'react';

interface PokemonType {
  type: {
    name: string;
  };
}

interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface Pokemon {
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
}

interface PokemonFormDetail {
  name: string;
  form_name: string;
  displayName: string;
  spriteDefault: string;
  spriteShiny?: string;
}

interface VarietyItem {
  name: string;
  url: string;
}

interface EvolutionNode {
  name: string;
  id: number;
  condition?: string;
  evolves_to: EvolutionNode[];
}

interface TcgCardBrief {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

interface TcgCardDetail {
  id: string;
  name: string;
  image?: string;
  rarity?: string;
  illustrator?: string;
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

interface QuickPokemon {
  name: string;
  id: number;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  normal: { bg: 'bg-slate-400/20', text: 'text-slate-300', border: 'border-slate-400/30', glow: 'shadow-slate-400/10' },
  fire: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', glow: 'shadow-rose-500/25' },
  water: { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30', glow: 'shadow-sky-500/25' },
  grass: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/25' },
  electric: { bg: 'bg-amber-400/20', text: 'text-amber-300', border: 'border-amber-400/30', glow: 'shadow-amber-400/25' },
  ice: { bg: 'bg-cyan-400/20', text: 'text-cyan-300', border: 'border-cyan-400/30', glow: 'shadow-cyan-400/25' },
  fighting: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-red-500/25' },
  poison: { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', glow: 'shadow-fuchsia-500/25' },
  ground: { bg: 'bg-amber-600/20', text: 'text-amber-500', border: 'border-amber-600/30', glow: 'shadow-amber-600/25' },
  flying: { bg: 'bg-indigo-400/20', text: 'text-indigo-300', border: 'border-indigo-400/30', glow: 'shadow-indigo-400/25' },
  psychic: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', glow: 'shadow-pink-500/25' },
  bug: { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/30', glow: 'shadow-lime-500/25' },
  rock: { bg: 'bg-stone-400/20', text: 'text-stone-300', border: 'border-stone-400/30', glow: 'shadow-stone-400/20' },
  ghost: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30', glow: 'shadow-violet-500/25' },
  dragon: { bg: 'bg-purple-600/20', text: 'text-purple-400', border: 'border-purple-600/30', glow: 'shadow-purple-600/25' },
  steel: { bg: 'bg-zinc-500/20', text: 'text-zinc-300', border: 'border-zinc-500/30', glow: 'shadow-zinc-500/20' },
  fairy: { bg: 'bg-rose-400/20', text: 'text-rose-300', border: 'border-rose-400/30', glow: 'shadow-rose-400/25' },
};

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad',
};

const STAT_COLORS: Record<string, string> = {
  hp: 'bg-rose-500 shadow-rose-500/20',
  attack: 'bg-amber-500 shadow-amber-500/20',
  defense: 'bg-blue-500 shadow-blue-500/20',
  'special-attack': 'bg-fuchsia-500 shadow-fuchsia-500/20',
  'special-defense': 'bg-emerald-500 shadow-emerald-500/20',
  speed: 'bg-sky-500 shadow-sky-500/20',
};

const formatMegaName = (fullName: string, baseName: string) => {
  const suffix = fullName.replace(baseName, '').replace(/^-+|-+$/g, '');
  if (suffix === 'mega') return 'Mega';
  if (suffix === 'mega-x') return 'Mega X';
  if (suffix === 'mega-y') return 'Mega Y';
  if (suffix === 'mega-z') return 'Mega Z';
  if (suffix === 'gmax') return 'G-Max';
  if (suffix === 'primal') return 'Primal';
  
  return suffix
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatPokemonTitleName = (fullName: string, speciesName: string) => {
  const cleanSpecies = speciesName.toLowerCase();
  const cleanFull = fullName.toLowerCase();
  
  if (cleanFull === cleanSpecies) {
    return cleanSpecies.charAt(0).toUpperCase() + cleanSpecies.slice(1);
  }

  const suffix = cleanFull.replace(cleanSpecies, '').replace(/^-+|-+$/g, '');
  const titleSpecies = cleanSpecies.charAt(0).toUpperCase() + cleanSpecies.slice(1);

  if (suffix === 'mega') return `${titleSpecies} Mega`;
  if (suffix === 'mega-x') return `${titleSpecies} Mega X`;
  if (suffix === 'mega-y') return `${titleSpecies} Mega Y`;
  if (suffix === 'mega-z') return `${titleSpecies} Mega Z`;
  if (suffix === 'gmax') return `${titleSpecies} G-Max`;
  if (suffix === 'primal') return `Primal ${titleSpecies}`;
  if (suffix === 'alola') return `${titleSpecies} de Alola`;
  if (suffix === 'galar') return `${titleSpecies} de Galar`;
  if (suffix === 'hisui') return `${titleSpecies} de Hisui`;
  if (suffix === 'paldea') return `${titleSpecies} de Paldea`;
  
  // Custom alternate forms
  if (suffix === '50') return `${titleSpecies} (Forma 50%)`;
  if (suffix === '10' || suffix === '10-power-construct') return `${titleSpecies} (Forma 10%)`;
  if (suffix === '50-power-construct') return `${titleSpecies} (Forma 50%)`;
  if (suffix === 'complete') return `${titleSpecies} (Forma Completa)`;
  if (suffix.includes('single-strike')) return `${titleSpecies} (Golpe Brusco)`;
  if (suffix.includes('rapid-strike')) return `${titleSpecies} (Golpe Fluido)`;
  if (suffix.includes('family-of-three')) return `${titleSpecies} (Familia de 3)`;
  if (suffix.includes('family-of-four')) return `${titleSpecies} (Familia de 4)`;
  if (suffix === 'altered') return `${titleSpecies} (Forma Modificada)`;
  if (suffix === 'origin') return `${titleSpecies} (Forma Origen)`;
  if (suffix === 'normal') return `${titleSpecies} (Forma Normal)`;
  if (suffix === 'attack') return `${titleSpecies} (Forma Ataque)`;
  if (suffix === 'defense') return `${titleSpecies} (Forma Defensa)`;
  if (suffix === 'speed') return `${titleSpecies} (Forma Velocidad)`;
  if (suffix === 'land') return `${titleSpecies} (Forma Tierra)`;
  if (suffix === 'sky') return `${titleSpecies} (Forma Cielo)`;
  if (suffix === 'amped') return `${titleSpecies} (Forma Aguda)`;
  if (suffix === 'low-key') return `${titleSpecies} (Forma Grave)`;
  if (suffix === 'midday') return `${titleSpecies} (Forma Diurna)`;
  if (suffix === 'midnight') return `${titleSpecies} (Forma Nocturna)`;
  if (suffix === 'dusk') return `${titleSpecies} (Forma Crepuscular)`;
  if (suffix === 'heat') return `${titleSpecies} (Calor)`;
  if (suffix === 'wash') return `${titleSpecies} (Lavado)`;
  if (suffix === 'frost') return `${titleSpecies} (Frío)`;
  if (suffix === 'fan') return `${titleSpecies} (Ventilador)`;
  if (suffix === 'mow') return `${titleSpecies} (Corte)`;

  const suffixFormatted = suffix
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `${titleSpecies} ${suffixFormatted}`;
};

const getEvolutionCondition = (details: any[], targetName?: string) => {
  if (targetName?.toLowerCase() === 'clodsire') {
    return 'Nv. 20 (Paldea)';
  }
  if (!details || details.length === 0) return '';
  const d = details[0];
  let cond = '';
  
  if (d.min_level) {
    cond = `Nv. ${d.min_level}`;
    if (d.relative_physical_stats === 1) cond += ' (Atk > Def)';
    else if (d.relative_physical_stats === -1) cond += ' (Def > Atk)';
    else if (d.relative_physical_stats === 0) cond += ' (Atk = Def)';
  } else if (d.item) {
    cond = d.item.name.replace(/-/g, ' ');
  } else if (d.held_item) {
    cond = `Con ${d.held_item.name.replace(/-/g, ' ')}`;
  } else if (d.min_happiness) {
    cond = d.time_of_day ? `Amistad (${d.time_of_day})` : 'Amistad';
  } else if (d.trigger?.name === 'trade') {
    cond = d.held_item ? `Intercambio (${d.held_item.name.replace(/-/g, ' ')})` : 'Intercambio';
  } else if (d.known_move) {
    cond = `Mov. ${d.known_move.name.replace(/-/g, ' ')}`;
  } else if (d.location) {
    cond = d.location.name.replace(/-/g, ' ');
  } else {
    cond = 'Evolución';
  }

  return cond;
};

const parseEvolutionTree = (chainNode: any, stage = 1): EvolutionNode => {
  const id = parseInt(chainNode.species.url.split('/').filter(Boolean).pop() || '1', 10);
  const condition = stage > 1 ? getEvolutionCondition(chainNode.evolution_details, chainNode.species.name) : undefined;
  
  const children: EvolutionNode[] = (chainNode.evolves_to || []).map((child: any) =>
    parseEvolutionTree(child, stage + 1)
  );

  return {
    name: chainNode.species.name,
    id,
    condition,
    evolves_to: children,
  };
};

const getRegionalButtonLabel = (name: string, isActive: boolean) => {
  if (isActive) return '↩️ Normal';
  if (name.includes('alola')) return '🌴 Alola';
  if (name.includes('galar')) return '⚔️ Galar';
  if (name.includes('hisui')) return '🏯 Hisui';
  if (name.includes('paldea')) return '💎 Paldea';
  return '🌍 Regional';
};

const getRegionalButtonStyle = (name: string, isActive: boolean) => {
  if (!isActive) {
    return 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200';
  }
  if (name.includes('alola')) {
    return 'bg-teal-500/25 text-teal-300 border-teal-500/40 shadow-md shadow-teal-500/10';
  }
  if (name.includes('galar')) {
    return 'bg-indigo-500/25 text-indigo-300 border-indigo-500/40 shadow-md shadow-indigo-500/10';
  }
  if (name.includes('hisui')) {
    return 'bg-amber-600/25 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/10';
  }
  if (name.includes('paldea')) {
    return 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-500/10';
  }
  return 'bg-sky-500/25 text-sky-300 border-sky-500/40 shadow-md shadow-sky-500/10';
};

const getFormButtonLabel = (name: string, baseName: string, isActive: boolean) => {
  if (isActive) return '↩️ Base';
  const suffix = name.replace(baseName.toLowerCase(), '').replace(/^-+|-+$/g, '');
  if (suffix === '10' || suffix === '10-power-construct') return '🐕 Forma 10%';
  if (suffix === 'complete') return '👑 Forma Completa';
  if (suffix.includes('rapid-strike')) return '🌊 Golpe Fluido';
  if (suffix.includes('single-strike')) return '👊 Golpe Brusco';
  if (suffix.includes('family-of-three')) return '👨‍👧 Familia de 3';
  if (suffix.includes('family-of-four')) return '👨‍👩‍👧‍👦 Familia de 4';
  if (suffix === 'origin') return '🌀 Origen';
  if (suffix === 'sky') return '🦅 Forma Cielo';
  if (suffix === 'land') return '🌸 Forma Tierra';
  if (suffix === 'attack') return '⚔️ Ataque';
  if (suffix === 'defense') return '🛡️ Defensa';
  if (suffix === 'speed') return '⚡ Velocidad';
  if (suffix === 'midnight') return '🌙 Medianoche';
  if (suffix === 'dusk') return '🌅 Crepúsculo';
  if (suffix === 'low-key') return '🎸 Grave';
  if (suffix === 'heat') return '🔥 Microondas';
  if (suffix === 'wash') return '💧 Lavadora';
  if (suffix === 'frost') return '❄️ Nevera';
  if (suffix === 'fan') return '🌪️ Ventilador';
  if (suffix === 'mow') return '🌱 Cortacésped';

  return `🔄 ${suffix.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
};

function App() {
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [currentPokemonData, setCurrentPokemonData] = useState<Pokemon | null>(null);
  
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'info' | 'tcg'>('info');

  // Persistence & Quick access
  const [favorites, setFavorites] = useState<QuickPokemon[]>(() => {
    try {
      const saved = localStorage.getItem('poke_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentSearches, setRecentSearches] = useState<QuickPokemon[]>(() => {
    try {
      const saved = localStorage.getItem('poke_recents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showFavoritesList, setShowFavoritesList] = useState(false);

  // Autocomplete suggestions
  const [allPokemonList, setAllPokemonList] = useState<QuickPokemon[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Pre-load all 1025 Pokemon species names for instant real-time suggestions
  useEffect(() => {
    const loadSpeciesList = async () => {
      try {
        const cached = localStorage.getItem('poke_species_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllPokemonList(parsed);
            return;
          }
        }
        const res = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1025');
        if (res.ok) {
          const data = await res.json();
          const list: QuickPokemon[] = data.results.map((r: any) => {
            const id = parseInt(r.url.split('/').filter(Boolean).pop() || '0', 10);
            return { name: r.name, id };
          });
          setAllPokemonList(list);
          try {
            localStorage.setItem('poke_species_cache', JSON.stringify(list));
          } catch {}
        }
      } catch (err) {
        console.error('Error loading species list:', err);
      }
    };
    loadSpeciesList();
  }, []);

  // Handle clicking outside to close suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute matching suggestions based on current query
  const suggestions = query.trim().length >= 1
    ? allPokemonList
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.trim().toLowerCase()) ||
            p.id.toString() === query.trim() ||
            p.id.toString().startsWith(query.trim())
        )
        .sort((a, b) => {
          const q = query.trim().toLowerCase();
          const aStarts = a.name.toLowerCase().startsWith(q);
          const bStarts = b.name.toLowerCase().startsWith(q);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.id - b.id;
        })
        .slice(0, 6)
    : [];

  // Transform / Special forms
  const [megaVarieties, setMegaVarieties] = useState<VarietyItem[]>([]);
  const [activeMegaIndex, setActiveMegaIndex] = useState<number | null>(null);
  const [gmaxVarieties, setGmaxVarieties] = useState<VarietyItem[]>([]);
  const [isGmax, setIsGmax] = useState(false);
  const [primalVarieties, setPrimalVarieties] = useState<VarietyItem[]>([]);
  const [isPrimal, setIsPrimal] = useState(false);
  const [regionalVarieties, setRegionalVarieties] = useState<VarietyItem[]>([]);
  const [activeRegionalIndex, setActiveRegionalIndex] = useState<number | null>(null);
  const [formVarieties, setFormVarieties] = useState<VarietyItem[]>([]);
  const [activeFormIndex, setActiveFormIndex] = useState<number | null>(null);

  // Audio Cry & Evolution chain
  const [isPlayingCry, setIsPlayingCry] = useState(false);
  const [evolutionTree, setEvolutionTree] = useState<EvolutionNode | null>(null);

  // TCG Cards state
  const [tcgCards, setTcgCards] = useState<TcgCardBrief[]>([]);
  const [tcgLoading, setTcgLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<TcgCardDetail | null>(null);
  const [cardModalLoading, setCardModalLoading] = useState(false);
  
  // Pokédex Description & Category
  const [description, setDescription] = useState<string>('');
  const [genus, setGenus] = useState<string>('');

  // Cosmetic Forms (Vivillon motifs, Unown, Alcremie, Furfrou, etc.)
  const [pokemonForms, setPokemonForms] = useState<PokemonFormDetail[]>([]);
  const [selectedFormIndex, setSelectedFormIndex] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isShiny, setIsShiny] = useState(false);

  // Toggle favorite status
  const toggleFavorite = (poke: QuickPokemon) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === poke.id);
      let updated: QuickPokemon[];
      if (exists) {
        updated = prev.filter((f) => f.id !== poke.id);
      } else {
        updated = [poke, ...prev];
      }
      try {
        localStorage.setItem('poke_favorites', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving favorites:', err);
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('poke_recents');
    } catch (err) {
      console.error('Error clearing recents:', err);
    }
  };

  const getTcgQuery = (speciesName: string) => {
    const s = speciesName.toLowerCase().trim();
    if (s === 'ho-oh') return 'ho-oh';
    if (s === 'porygon-z') return 'porygon-z';
    if (s.startsWith('mr-')) return s.replace('mr-', 'mr. ');
    if (s.startsWith('tapu-')) return s.replace('-', ' ');
    if (s === 'mime-jr') return 'mime jr.';
    if (s === 'type-null') return 'type: null';
    if (s.includes('-')) return s.replace(/-/g, ' ');
    return s;
  };

  // Fetch TCG cards in background from TCGdex API
  const fetchTcgCards = async (pokeName: string) => {
    setTcgLoading(true);
    setTcgCards([]);
    try {
      const clean = getTcgQuery(pokeName);
      let res = await fetch(`https://api.tcgdex.net/v2/es/cards?name=${encodeURIComponent(clean)}`);
      let cardsData: TcgCardBrief[] = [];
      if (res.ok) {
        cardsData = await res.json();
      }
      if (!Array.isArray(cardsData) || cardsData.length === 0) {
        const enRes = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(clean)}`);
        if (enRes.ok) {
          cardsData = await enRes.json();
        }
      }
      if (Array.isArray(cardsData)) {
        // Strict word boundary filter to eliminate false substring positives (e.g. Hoppip when searching Ho-Oh, Mewtwo when searching Mew)
        const escaped = clean.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '[\\s\\-\\.]*');
        const pattern = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');

        const validCards = cardsData.filter((c) => c.image && pattern.test(c.name));
        setTcgCards(validCards);
      }
    } catch (err) {
      console.error('Error fetching TCG cards:', err);
    } finally {
      setTcgLoading(false);
    }
  };

  const handleCardClick = async (card: TcgCardBrief) => {
    setCardModalLoading(true);
    setSelectedCard(null);
    try {
      let res = await fetch(`https://api.tcgdex.net/v2/es/cards/${card.id}`);
      if (!res.ok) {
        res = await fetch(`https://api.tcgdex.net/v2/en/cards/${card.id}`);
      }
      if (res.ok) {
        const detail: TcgCardDetail = await res.json();
        setSelectedCard(detail);
      } else {
        setSelectedCard({
          id: card.id,
          name: card.name,
          image: card.image,
        });
      }
    } catch (err) {
      console.error('Error fetching card details:', err);
      setSelectedCard({
        id: card.id,
        name: card.name,
        image: card.image,
      });
    } finally {
      setCardModalLoading(false);
    }
  };

  const executeSearch = async (searchTerm: string) => {
    const cleanQuery = searchTerm.trim().toLowerCase();
    if (!cleanQuery) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setIsShiny(false);
    setActiveMegaIndex(null);
    setIsGmax(false);
    setIsPrimal(false);
    setActiveRegionalIndex(null);
    setActiveFormIndex(null);
    setMegaVarieties([]);
    setGmaxVarieties([]);
    setPrimalVarieties([]);
    setRegionalVarieties([]);
    setFormVarieties([]);
    setEvolutionTree(null);
    setIsPlayingCry(false);
    setSelectedCard(null);
    setShowSuggestions(false);
    setDescription('');
    setGenus('');
    setPokemonForms([]);
    setSelectedFormIndex(null);

    try {
      let data: Pokemon;
      // 1. Try fetching from /pokemon/{query}
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanQuery}`);
      if (res.ok) {
        data = await res.json();
      } else {
        // 2. If not found in /pokemon, check /pokemon-species/{query}
        // (Supports Zygarde, Urshifu, Maushold, Giratina, Deoxys, Toxtricity, Shaymin, etc.)
        const fallbackSpeciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${cleanQuery}`);
        if (!fallbackSpeciesRes.ok) {
          throw new Error(`¡El Pokémon "${cleanQuery}" no fue encontrado! Verifica el nombre o ID.`);
        }
        const speciesInfo = await fallbackSpeciesRes.json();
        const defaultVariety =
          speciesInfo.varieties.find((v: any) => v.is_default) || speciesInfo.varieties[0];
        if (!defaultVariety) {
          throw new Error(`¡El Pokémon "${cleanQuery}" no tiene formas registradas!`);
        }
        const varietyRes = await fetch(defaultVariety.pokemon.url);
        if (!varietyRes.ok) {
          throw new Error(`Error al obtener los datos de "${cleanQuery}".`);
        }
        data = await varietyRes.json();
      }
      
      // Update recent searches in state & localStorage (using clean species name if available)
      const displayName = data.species.name || data.name;
      setRecentSearches((prev) => {
        const filtered = prev.filter((p) => p.id !== data.id && p.name.toLowerCase() !== displayName.toLowerCase());
        const updated = [{ name: displayName, id: data.id }, ...filtered].slice(0, 6);
        try {
          localStorage.setItem('poke_recents', JSON.stringify(updated));
        } catch (err) {
          console.error('Error saving recents:', err);
        }
        return updated;
      });

      // Fetch species data to check varieties and evolution chain
      let megas: VarietyItem[] = [];
      let gmaxes: VarietyItem[] = [];
      let primals: VarietyItem[] = [];
      let regionals: VarietyItem[] = [];
      let forms: VarietyItem[] = [];
      const regionalSuffixes = ['-alola', '-galar', '-hisui', '-paldea'];

      try {
        const speciesRes = await fetch(data.species.url);
        if (speciesRes.ok) {
          const speciesData = await speciesRes.json();
          
          if (speciesData.varieties && Array.isArray(speciesData.varieties)) {
            // Mega
            megas = speciesData.varieties
              .filter((v: any) => !v.is_default && v.pokemon.name.includes('-mega'))
              .map((v: any) => ({ name: v.pokemon.name, url: v.pokemon.url }));

            // G-Max
            gmaxes = speciesData.varieties
              .filter((v: any) => !v.is_default && v.pokemon.name.includes('-gmax'))
              .map((v: any) => ({ name: v.pokemon.name, url: v.pokemon.url }));

            // Primal
            primals = speciesData.varieties
              .filter((v: any) => !v.is_default && v.pokemon.name.includes('-primal'))
              .map((v: any) => ({ name: v.pokemon.name, url: v.pokemon.url }));

            // Regional forms
            regionals = speciesData.varieties
              .filter((v: any) => !v.is_default && regionalSuffixes.some(s => v.pokemon.name.includes(s)))
              .map((v: any) => ({ name: v.pokemon.name, url: v.pokemon.url }));

            // Alternate forms (Zygarde 10%, Urshifu Rapid Strike, Maushold 3, Giratina Origin, Deoxys forms, etc.)
            forms = speciesData.varieties
              .filter((v: any) => 
                !v.is_default && 
                !v.pokemon.name.includes('-mega') && 
                !v.pokemon.name.includes('-gmax') && 
                !v.pokemon.name.includes('-primal') && 
                !regionalSuffixes.some(s => v.pokemon.name.includes(s))
              )
              .map((v: any) => ({ name: v.pokemon.name, url: v.pokemon.url }));
          }

          // Fetch Evolution Chain
          if (speciesData.evolution_chain?.url) {
            try {
              const evoRes = await fetch(speciesData.evolution_chain.url);
              if (evoRes.ok) {
                const evoData = await evoRes.json();
                const parsed = parseEvolutionTree(evoData.chain);
                setEvolutionTree(parsed);
              }
            } catch (evoErr) {
              console.error('Error fetching evolution chain:', evoErr);
            }
          }
          // Extract Pokédex description (prefer Spanish, fallback to English)
          const esEntry = speciesData.flavor_text_entries?.find((e: any) => e.language.name === 'es');
          const enEntry = speciesData.flavor_text_entries?.find((e: any) => e.language.name === 'en');
          const flavorText = (esEntry?.flavor_text || enEntry?.flavor_text || '').replace(/[\n\f\r]/g, ' ');
          setDescription(flavorText);

          // Extract category / genus (prefer Spanish, fallback to English)
          const esGenus = speciesData.genera?.find((g: any) => g.language.name === 'es');
          const enGenus = speciesData.genera?.find((g: any) => g.language.name === 'en');
          setGenus(esGenus?.genus || enGenus?.genus || '');
        }
      } catch (speciesErr) {
        console.error('Error fetching species data:', speciesErr);
      }

      // Fetch cosmetic forms if data.forms > 1 (e.g. Vivillon motifs, Unown, Alcremie, Furfrou)
      let loadedForms: PokemonFormDetail[] = [];
      if (data.forms && data.forms.length > 1) {
        try {
          const formResponses = await Promise.all(
            data.forms.map((f: any) => fetch(f.url).then((r) => (r.ok ? r.json() : null)))
          );
          loadedForms = formResponses
            .filter(Boolean)
            .map((f: any) => {
              const esNameObj = f.form_names?.find((fn: any) => fn.language.name === 'es');
              const enNameObj = f.form_names?.find((fn: any) => fn.language.name === 'en');
              const rawName = f.form_name || f.name.replace(`${data.name}-`, '');
              const formattedFallback = rawName
                .split('-')
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
              const displayName = esNameObj?.name || enNameObj?.name || formattedFallback;

              return {
                name: f.name,
                form_name: f.form_name || rawName,
                displayName,
                spriteDefault: f.sprites?.front_default || data.sprites.front_default,
                spriteShiny: f.sprites?.front_shiny || data.sprites.front_shiny,
              };
            });
        } catch (formErr) {
          console.error('Error fetching Pokemon forms:', formErr);
        }
      }
      setPokemonForms(loadedForms);
      if (loadedForms.length > 0) {
        setSelectedFormIndex(0);
      }

      setPokemon(data);
      setCurrentPokemonData(data);
      setMegaVarieties(megas);
      setGmaxVarieties(gmaxes);
      setPrimalVarieties(primals);
      setRegionalVarieties(regionals);
      setFormVarieties(forms);

      // Trigger TCG card search using clean species name
      fetchTcgCards(data.species.name || data.name);
    } catch (err) {
      setPokemon(null);
      setCurrentPokemonData(null);
      setMegaVarieties([]);
      setGmaxVarieties([]);
      setPrimalVarieties([]);
      setRegionalVarieties([]);
      setFormVarieties([]);
      setPokemonForms([]);
      setSelectedFormIndex(null);
      setEvolutionTree(null);
      setTcgCards([]);
      setDescription('');
      setGenus('');
      setError(err instanceof Error ? err.message : 'Error desconocido.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const searchByName = (name: string) => {
    setQuery(name);
    executeSearch(name);
  };

  const handleRandomSearch = () => {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    setQuery(randomId.toString());
    executeSearch(randomId.toString());
  };

  const handlePrevPokemon = () => {
    if (!pokemon || pokemon.id <= 1) return;
    const prevId = pokemon.id - 1;
    setQuery(prevId.toString());
    executeSearch(prevId.toString());
  };

  const handleNextPokemon = () => {
    if (!pokemon || pokemon.id >= 1025) return;
    const nextId = pokemon.id + 1;
    setQuery(nextId.toString());
    executeSearch(nextId.toString());
  };

  const playPokemonCry = () => {
    const cryUrl = currentPokemonData?.cries?.latest || currentPokemonData?.cries?.legacy;
    if (!cryUrl) return;
    const audio = new Audio(cryUrl);
    audio.volume = 0.6;
    setIsPlayingCry(true);
    audio.onended = () => setIsPlayingCry(false);
    audio.onerror = () => setIsPlayingCry(false);
    audio.play().catch(() => setIsPlayingCry(false));
  };

  const handleMegaToggle = async () => {
    if (megaVarieties.length === 0 || !pokemon) return;

    setLoading(true);
    setError(null);
    setIsGmax(false);
    setIsPrimal(false);
    setActiveRegionalIndex(null);
    setActiveFormIndex(null);

    try {
      if (activeMegaIndex === null) {
        const res = await fetch(megaVarieties[0].url);
        if (!res.ok) throw new Error('Error al cargar la Mega Evolución.');
        const data = await res.json();
        setCurrentPokemonData(data);
        setActiveMegaIndex(0);
      } else if (activeMegaIndex === 0 && megaVarieties.length > 1) {
        const res = await fetch(megaVarieties[1].url);
        if (!res.ok) throw new Error('Error al cargar la Mega Evolución.');
        const data = await res.json();
        setCurrentPokemonData(data);
        setActiveMegaIndex(1);
      } else {
        setCurrentPokemonData(pokemon);
        setActiveMegaIndex(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar de forma.');
    } finally {
      setLoading(false);
    }
  };

  const handleGmaxToggle = async () => {
    if (gmaxVarieties.length === 0 || !pokemon) return;

    setLoading(true);
    setError(null);
    setActiveMegaIndex(null);
    setIsPrimal(false);
    setActiveRegionalIndex(null);
    setActiveFormIndex(null);

    try {
      if (!isGmax) {
        const res = await fetch(gmaxVarieties[0].url);
        if (!res.ok) throw new Error('Error al cargar los datos de Gigantamax.');
        const data = await res.json();
        setCurrentPokemonData(data);
        setIsGmax(true);
      } else {
        setCurrentPokemonData(pokemon);
        setIsGmax(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar de forma.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrimalToggle = async () => {
    if (primalVarieties.length === 0 || !pokemon) return;

    setLoading(true);
    setError(null);
    setActiveMegaIndex(null);
    setIsGmax(false);
    setActiveRegionalIndex(null);
    setActiveFormIndex(null);

    try {
      if (!isPrimal) {
        const res = await fetch(primalVarieties[0].url);
        if (!res.ok) throw new Error('Error al cargar la Regresión Primigenia.');
        const data = await res.json();
        setCurrentPokemonData(data);
        setIsPrimal(true);
      } else {
        setCurrentPokemonData(pokemon);
        setIsPrimal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar de forma.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegionalToggle = async (index: number) => {
    if (regionalVarieties.length === 0 || !pokemon) return;

    setLoading(true);
    setError(null);
    setActiveMegaIndex(null);
    setIsGmax(false);
    setIsPrimal(false);
    setActiveFormIndex(null);

    try {
      if (activeRegionalIndex === index) {
        setCurrentPokemonData(pokemon);
        setActiveRegionalIndex(null);
      } else {
        const res = await fetch(regionalVarieties[index].url);
        if (!res.ok) throw new Error('Error al cargar la variante regional.');
        const data = await res.json();
        setCurrentPokemonData(data);
        setActiveRegionalIndex(index);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar de forma.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormToggle = async (index: number) => {
    if (formVarieties.length === 0 || !pokemon) return;

    setLoading(true);
    setError(null);
    setActiveMegaIndex(null);
    setIsGmax(false);
    setIsPrimal(false);
    setActiveRegionalIndex(null);

    try {
      if (activeFormIndex === index) {
        setCurrentPokemonData(pokemon);
        setActiveFormIndex(null);
      } else {
        const res = await fetch(formVarieties[index].url);
        if (!res.ok) throw new Error('Error al cargar la forma alternativa.');
        const data = await res.json();
        setCurrentPokemonData(data);
        setActiveFormIndex(index);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar de forma.');
    } finally {
      setLoading(false);
    }
  };

  const getMegaButtonLabel = () => {
    if (megaVarieties.length === 0 || !pokemon) return '';
    if (activeMegaIndex === null) {
      return `💥 ${formatMegaName(megaVarieties[0].name, pokemon.species.name || pokemon.name)}`;
    }
    if (activeMegaIndex === 0) {
      if (megaVarieties.length > 1) {
        return `💥 ${formatMegaName(megaVarieties[1].name, pokemon.species.name || pokemon.name)}`;
      }
      return '↩️ Normal';
    }
    return '↩️ Normal';
  };

  const getPrimalButtonLabel = () => {
    if (primalVarieties.length === 0) return '';
    return isPrimal ? '↩️ Normal' : (pokemon?.name.includes('kyogre') ? '🌀 Primigenio' : '🌋 Primigenio');
  };

  const getPrimalButtonStyle = () => {
    if (!pokemon) return '';
    if (pokemon.name.includes('kyogre')) {
      return isPrimal
        ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40 shadow-md shadow-cyan-500/10'
        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200';
    }
    if (pokemon.name.includes('groudon')) {
      return isPrimal
        ? 'bg-orange-600/25 text-orange-400 border-orange-500/40 shadow-md shadow-orange-600/10'
        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200';
    }
    return isPrimal
      ? 'bg-red-500/25 text-red-300 border-red-500/40 shadow-md shadow-red-500/10'
      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200';
  };

  const getPrimaryTypeColor = (poke: Pokemon) => {
    const type = poke.types[0]?.type.name;
    return TYPE_COLORS[type] || { bg: 'bg-slate-800/40', text: 'text-slate-350', border: 'border-slate-850', glow: 'shadow-slate-500/10' };
  };

  const isCurrentFavorite = pokemon ? favorites.some((f) => f.id === pokemon.id) : false;

  const renderEvolutionNode = (node: EvolutionNode): React.ReactNode => {
    const isCurrent =
      pokemon?.species.name?.toLowerCase() === node.name.toLowerCase() ||
      pokemon?.name.toLowerCase() === node.name.toLowerCase() ||
      currentPokemonData?.name.toLowerCase().includes(node.name.toLowerCase());

    return (
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Node Card */}
        <button
          type="button"
          onClick={() => searchByName(node.name)}
          className={`group relative flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer min-w-[84px] sm:min-w-[96px] ${
            isCurrent
              ? 'bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/15 scale-105 ring-1 ring-rose-500/30'
              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${node.id}.png`}
            alt={node.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${node.id}.png`;
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md transition-transform group-hover:scale-110"
          />
          <span className="text-xs font-bold capitalize text-slate-200 mt-1.5 text-center">
            {node.name}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            #{node.id.toString().padStart(3, '0')}
          </span>
        </button>

        {/* Children branches */}
        {node.evolves_to.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col gap-3 py-1">
              {node.evolves_to.map((child) => (
                <div key={child.name} className="flex items-center gap-2 sm:gap-4">
                  {/* Arrow and condition badge */}
                  <div className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px]">
                    {child.condition && (
                      <span
                        className="text-[9px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full mb-1 text-center max-w-[85px] sm:max-w-[110px] leading-tight"
                        title={child.condition}
                      >
                        {child.condition}
                      </span>
                    )}
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Recursive child subtree */}
                  {renderEvolutionNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-rose-500 selection:text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-rose-400 uppercase">Buscador en Tiempo Real + TCG</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2 bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
            PokéSearch
          </h1>
          <p className="text-slate-400 text-sm">
            Escribe el nombre o ID de un Pokémon para ver sus detalles, evoluciones, variantes y cartas TCG.
          </p>
        </div>

        {/* Search Card Container */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Search Form + Random Button */}
          <div className="space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 sm:gap-3">
              <div ref={searchContainerRef} className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={query}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Escribe un Pokémon (ej: Zygarde, Urshifu, Charizard, Maushold)..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-white placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-sm font-medium"
                />

                {/* Real-time Matches Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden py-1 animate-scale-up divide-y divide-slate-800/40">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setQuery(p.name);
                          setShowSuggestions(false);
                          executeSearch(p.name);
                        }}
                        className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-800/70 text-slate-200 hover:text-white transition-colors cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                            alt={p.name}
                            className="w-7 h-7 object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
                            loading="lazy"
                          />
                          <span className="capitalize text-sm font-semibold group-hover:text-rose-400 transition-colors">
                            {p.name}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-slate-400">
                          #{p.id.toString().padStart(3, '0')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Random Button */}
              <button
                type="button"
                onClick={handleRandomSearch}
                title="Pokémon aleatorio (1 al 1025)"
                disabled={loading}
                className="px-3.5 sm:px-4 py-3 bg-slate-800/80 hover:bg-slate-750 disabled:opacity-50 text-amber-300 font-bold rounded-2xl border border-slate-750 hover:border-slate-600 transition-all text-sm cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>🎲</span>
                <span className="hidden sm:inline text-xs font-semibold">Azar</span>
              </button>

              {/* Submit Search */}
              <button
                type="submit"
                disabled={loading}
                className="px-5 sm:px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-800 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all text-sm cursor-pointer"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </form>

            {/* Quick Access Row: Recents & Favorites */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {/* Recents */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Recientes:</span>
                {recentSearches.length === 0 && (
                  <span className="text-[11px] text-slate-600 italic">Ninguno</span>
                )}
                {recentSearches.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => searchByName(rec.name)}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-950/60 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white capitalize text-[11px] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{rec.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono">#{rec.id}</span>
                  </button>
                ))}
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    title="Borrar historial de búsquedas recientes"
                    className="text-[10px] text-slate-500 hover:text-rose-400 px-1.5 py-0.5 rounded-md hover:bg-rose-500/10 transition-all cursor-pointer ml-1 font-medium flex items-center gap-0.5"
                  >
                    <span>✕</span>
                    <span>Borrar</span>
                  </button>
                )}
              </div>

              {/* Favorites toggle button */}
              {favorites.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowFavoritesList(!showFavoritesList)}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer ml-auto"
                >
                  <span>⭐ Favoritos ({favorites.length})</span>
                </button>
              )}
            </div>

            {/* Expandable Favorites Panel */}
            {showFavoritesList && favorites.length > 0 && (
              <div className="p-3 bg-slate-950/60 border border-amber-500/30 rounded-2xl animate-fade-in space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  <span>Tus Pokémon Favoritos</span>
                  <button
                    type="button"
                    onClick={() => setShowFavoritesList(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    Cerrar ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {favorites.map((fav) => (
                    <button
                      key={fav.id}
                      type="button"
                      onClick={() => searchByName(fav.name)}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 capitalize text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>⭐</span>
                      <span>{fav.name}</span>
                      <span className="text-[10px] text-amber-400/60 font-mono">#{fav.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Block */}
          <div className="min-h-[200px] flex flex-col justify-center">
            {loading && (
              /* Pulsing Pokéball Loader */
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="relative w-16 h-16 animate-bounce">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-slate-950 border-2 border-slate-800 rounded-full" />
                </div>
                <p className="text-slate-400 text-xs font-semibold tracking-wider animate-pulse">Obteniendo datos de PokéAPI y TCG...</p>
              </div>
            )}

            {!loading && error && (
              /* Clean Error Message */
              <div className="text-center py-8 px-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-scale-up">
                <div className="inline-flex p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Error de búsqueda</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">{error}</p>
              </div>
            )}

            {!loading && !error && currentPokemonData && (
              <div className="space-y-6 animate-scale-up">
                {/* Tab Switcher */}
                <div className="flex border-b border-slate-800/80 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                      activeTab === 'info'
                        ? 'border-rose-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🎮 Ficha Técnica</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tcg')}
                    className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                      activeTab === 'tcg'
                        ? 'border-rose-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🃏 Cartas TCG</span>
                    {tcgCards.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {tcgCards.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Tab 1: Info General */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    {/* Visual Section (Image & Glow) */}
                    <div className="relative flex flex-col items-center justify-center py-6 bg-slate-950/40 border border-slate-800/60 rounded-3xl overflow-hidden group">
                      {/* Dynamic glow base on primary type */}
                      <div className={`absolute w-36 h-36 rounded-full opacity-35 blur-3xl ${getPrimaryTypeColor(currentPokemonData).bg.replace('/20', '/60')}`} />
                      
                      {/* Navigation Prev & Next Controls + Badge ID */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                        <button
                          type="button"
                          disabled={pokemon!.id <= 1 || loading}
                          onClick={handlePrevPokemon}
                          title={pokemon!.id > 1 ? `Ir al Nº ${(pokemon!.id - 1).toString().padStart(3, '0')}` : undefined}
                          className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer active:scale-95"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <span className="text-xs font-mono font-bold text-slate-400 px-1">
                          Nº {currentPokemonData.id.toString().padStart(3, '0')}
                        </span>

                        <button
                          type="button"
                          disabled={pokemon!.id >= 1025 || loading}
                          onClick={handleNextPokemon}
                          title={pokemon!.id < 1025 ? `Ir al Nº ${(pokemon!.id + 1).toString().padStart(3, '0')}` : undefined}
                          className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer active:scale-95"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* Top Action Buttons (Shiny, Mega, G-Max, Primal, Regional & Forms) */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20 max-w-[65%]">
                        {/* Shiny Toggle Button */}
                        <button
                          type="button"
                          onClick={() => setIsShiny(!isShiny)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border backdrop-blur-md transition-all cursor-pointer ${
                            isShiny
                              ? 'bg-amber-400/25 text-amber-300 border-amber-400/40 shadow-md shadow-amber-400/10'
                              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          ✨ Shiny
                        </button>

                        {/* Mega Evolution Toggle Button */}
                        {megaVarieties.length > 0 && (
                          <button
                            type="button"
                            onClick={handleMegaToggle}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border backdrop-blur-md transition-all cursor-pointer ${
                              activeMegaIndex !== null
                            ? 'bg-rose-500/25 text-rose-350 border-rose-500/40 shadow-md shadow-rose-500/10'
                            : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            {getMegaButtonLabel()}
                          </button>
                        )}

                        {/* G-Max Evolution Toggle Button */}
                        {gmaxVarieties.length > 0 && (
                          <button
                            type="button"
                            onClick={handleGmaxToggle}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border backdrop-blur-md transition-all cursor-pointer ${
                              isGmax
                                ? 'bg-purple-500/25 text-purple-300 border-purple-500/40 shadow-md shadow-purple-500/10'
                                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            {isGmax ? '↩️ Normal' : '⚡ G-Max'}
                          </button>
                        )}

                        {/* Primal Reversion Toggle Button */}
                        {primalVarieties.length > 0 && (
                          <button
                            type="button"
                            onClick={handlePrimalToggle}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border backdrop-blur-md transition-all cursor-pointer ${getPrimalButtonStyle()}`}
                          >
                            {getPrimalButtonLabel()}
                          </button>
                        )}

                        {/* Regional Forms Toggle Buttons */}
                        {regionalVarieties.map((reg, idx) => (
                          <button
                            key={reg.name}
                            type="button"
                            onClick={() => handleRegionalToggle(idx)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border backdrop-blur-md transition-all cursor-pointer ${getRegionalButtonStyle(
                              reg.name,
                              activeRegionalIndex === idx
                            )}`}
                          >
                            {getRegionalButtonLabel(reg.name, activeRegionalIndex === idx)}
                          </button>
                        ))}

                        {/* Alternate Forms Toggle Buttons (Zygarde 10%, Urshifu Rapid, Maushold 3, Giratina Origin, etc.) */}
                        {formVarieties.map((form, idx) => (
                          <button
                            key={form.name}
                            type="button"
                            onClick={() => handleFormToggle(idx)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border backdrop-blur-md transition-all cursor-pointer ${
                              activeFormIndex === idx
                                ? 'bg-sky-500/25 text-sky-300 border-sky-500/40 shadow-md shadow-sky-500/10'
                                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            {getFormButtonLabel(form.name, pokemon!.species.name || pokemon!.name, activeFormIndex === idx)}
                          </button>
                        ))}
                      </div>

                      <img
                        src={
                          selectedFormIndex !== null && pokemonForms[selectedFormIndex]
                            ? (isShiny && pokemonForms[selectedFormIndex].spriteShiny
                                ? pokemonForms[selectedFormIndex].spriteShiny
                                : pokemonForms[selectedFormIndex].spriteDefault)
                            : isShiny
                            ? (currentPokemonData.sprites.other['official-artwork'].front_shiny || currentPokemonData.sprites.front_shiny || currentPokemonData.sprites.other['official-artwork'].front_default || currentPokemonData.sprites.front_default)
                            : (currentPokemonData.sprites.other['official-artwork'].front_default || currentPokemonData.sprites.front_default)
                        }
                        alt={currentPokemonData.name}
                        className="w-36 h-36 object-contain relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-105 mt-6 sm:mt-2"
                      />

                      {/* Title, Audio Cry & Favorite Button */}
                      <div className="flex items-center justify-center gap-2 mt-4 px-4 text-center flex-wrap">
                        <h2 className="text-2xl font-extrabold text-white capitalize tracking-tight">
                          {formatPokemonTitleName(currentPokemonData.name, pokemon!.species.name || pokemon!.name)}
                          {selectedFormIndex !== null && pokemonForms.length > 1 && pokemonForms[selectedFormIndex] && (
                            <span className="text-rose-400 font-bold ml-2 text-lg sm:text-xl block sm:inline">
                              ({pokemonForms[selectedFormIndex].displayName})
                            </span>
                          )}
                        </h2>

                        {/* Audio Cry Button */}
                        {(currentPokemonData.cries?.latest || currentPokemonData.cries?.legacy) && (
                          <button
                            type="button"
                            onClick={playPokemonCry}
                            title="Escuchar grito del Pokémon"
                            className={`p-1.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer flex items-center justify-center ${
                              isPlayingCry
                                ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/40 scale-110 animate-pulse'
                                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </button>
                        )}

                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={() => toggleFavorite({ name: pokemon!.species.name || pokemon!.name, id: pokemon!.id })}
                          title={isCurrentFavorite ? "Eliminar de favoritos" : "Guardar en favoritos"}
                          className={`p-1.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer flex items-center justify-center ${
                            isCurrentFavorite
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/20'
                              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-amber-400 hover:border-slate-700'
                          }`}
                        >
                          <svg className="w-4 h-4" fill={isCurrentFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>

                      {/* Types Row */}
                      <div className="flex gap-2 mt-2">
                        {currentPokemonData.types.map((t) => {
                          const badgeColor = TYPE_COLORS[t.type.name] || { bg: 'bg-slate-800', text: 'text-slate-450', border: 'border-slate-700', glow: '' };
                          return (
                            <span
                              key={t.type.name}
                              className={`px-3 py-1 rounded-full text-xs font-bold capitalize border transition-all ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border} ${badgeColor.glow}`}
                            >
                              {t.type.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cosmetic Forms / Motifs Strip (Vivillon, Unown, Alcremie, Furfrou, etc.) */}
                    {pokemonForms.length > 1 && (
                      <div className="space-y-2 p-3.5 bg-slate-950/40 border border-slate-850 rounded-3xl animate-fade-in">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            <span>🦋</span>
                            <span>Formas y Motivos ({pokemonForms.length})</span>
                          </span>
                          <span className="text-[11px] font-bold text-rose-400">
                            {selectedFormIndex !== null && pokemonForms[selectedFormIndex] ? pokemonForms[selectedFormIndex].displayName : ''}
                          </span>
                        </div>

                        {/* Horizontal Scrollable Motifs Badges with Mini Sprites */}
                        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                          {pokemonForms.map((form, idx) => (
                            <button
                              key={form.name}
                              type="button"
                              onClick={() => setSelectedFormIndex(idx)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                                selectedFormIndex === idx
                                  ? 'bg-rose-500/25 text-white border-rose-500/50 shadow-md shadow-rose-500/10 scale-105'
                                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              <img
                                src={isShiny && form.spriteShiny ? form.spriteShiny : form.spriteDefault}
                                alt={form.displayName}
                                className="w-7 h-7 object-contain drop-shadow-sm"
                                loading="lazy"
                              />
                              <span>{form.displayName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pokédex Entry & Physical Attributes */}
                    {(description || genus) && (
                      <div className="space-y-3">
                        {description && (
                          <div className="relative p-4 rounded-3xl bg-slate-950/40 border border-slate-850 text-center space-y-1.5 shadow-inner">
                            {genus && (
                              <span className="inline-block text-[11px] font-bold text-rose-400 tracking-wider uppercase">
                                {genus}
                              </span>
                            )}
                            <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed max-w-lg mx-auto font-normal">
                              "{description}"
                            </p>
                          </div>
                        )}

                        {/* Height, Weight & Category Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-2xl text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Altura</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-200">{(currentPokemonData.height / 10).toFixed(1)} m</span>
                          </div>
                          <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-2xl text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Peso</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-200">{(currentPokemonData.weight / 10).toFixed(1)} kg</span>
                          </div>
                          <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-2xl text-center col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Categoría</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-200 truncate block">{genus || 'Pokémon'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Statistics Grid */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Estadísticas Base</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {currentPokemonData.stats.map((stat) => {
                          const label = STAT_LABELS[stat.stat.name] || stat.stat.name.toUpperCase();
                          const color = STAT_COLORS[stat.stat.name] || 'bg-slate-500';
                          const percent = Math.min((stat.base_stat / 255) * 100, 100);
                          return (
                            <div
                              key={stat.stat.name}
                              className="bg-slate-950/40 border border-slate-850 p-3 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                                <span className="text-sm font-black text-white">{stat.base_stat}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-900 border border-slate-850/50 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${color}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Evolution Tree Section */}
                    {evolutionTree && evolutionTree.evolves_to.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                          Línea Evolutiva
                        </h3>
                        <div className="overflow-x-auto p-4 bg-slate-950/40 border border-slate-850 rounded-3xl flex justify-start md:justify-center">
                          <div className="min-w-fit">
                            {renderEvolutionNode(evolutionTree)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: TCG Cards */}
                {activeTab === 'tcg' && (
                  <div className="space-y-4">
                    {tcgLoading && (
                      <div className="py-12 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-3 border-slate-800 border-t-rose-500 rounded-full animate-spin" />
                        <p className="text-xs text-slate-400 font-semibold">Consultando cartas en TCGdex...</p>
                      </div>
                    )}

                    {!tcgLoading && tcgCards.length === 0 && (
                      <div className="text-center py-12 px-4 bg-slate-950/30 border border-slate-850 rounded-2xl">
                        <p className="text-slate-400 text-xs">No se encontraron cartas TCG para este Pokémon.</p>
                      </div>
                    )}

                    {!tcgLoading && tcgCards.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>Mostrando {tcgCards.length} cartas encontradas</span>
                          <span className="text-[10px] text-slate-500 font-medium">Haz clic en una carta para ver detalles y precios</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
                          {tcgCards.map((card) => (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => handleCardClick(card)}
                              className="group relative flex flex-col items-center bg-slate-950/40 border border-slate-850 hover:border-rose-500/40 rounded-2xl p-2.5 transition-all hover:scale-[1.03] hover:shadow-lg hover:shadow-rose-500/10 cursor-pointer text-left"
                            >
                              <div className="w-full aspect-[2.5/3.5] rounded-xl overflow-hidden bg-slate-900/60 mb-2 relative">
                                <img
                                  src={`${card.image}/low.webp`}
                                  alt={card.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              </div>
                              <p className="text-xs font-bold text-slate-200 truncate w-full group-hover:text-rose-400 transition-colors">
                                {card.name}
                              </p>
                              <span className="text-[10px] font-mono text-slate-500 w-full truncate">
                                #{card.localId}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {!loading && !error && !currentPokemonData && (
              /* Idle/Empty State */
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto bg-slate-955 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-350">Comienza tu búsqueda</h3>
                  <p className="text-slate-500 text-xs max-w-xs mx-auto mt-1 leading-relaxed">
                    {searched
                      ? 'Introduce un nombre válido para ver los datos del Pokémon.'
                      : 'Escribe el nombre de tu Pokémon favorito, presiona "Sorpréndeme" o selecciona un favorito.'}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Card Inspector Modal */}
      {(selectedCard || cardModalLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              type="button"
              onClick={() => { setSelectedCard(null); setCardModalLoading(false); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors cursor-pointer z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {cardModalLoading && (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 border-4 border-slate-800 border-t-rose-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-semibold">Cargando detalles de la carta...</p>
              </div>
            )}

            {!cardModalLoading && selectedCard && (
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                {/* High-res card image */}
                <div className="w-48 sm:w-52 flex-shrink-0 aspect-[2.5/3.5] rounded-2xl overflow-hidden shadow-2xl shadow-rose-500/10 border border-slate-800 bg-slate-950">
                  <img
                    src={selectedCard.image ? `${selectedCard.image}/high.webp` : ''}
                    alt={selectedCard.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>

                {/* Details column */}
                <div className="flex-1 w-full space-y-3 text-left">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                      {selectedCard.rarity || 'Carta Pokémon TCG'}
                    </span>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">
                      {selectedCard.name}
                    </h3>
                    {selectedCard.set && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>Expansión:</span>
                        <span className="text-slate-200 font-semibold">{selectedCard.set.name}</span>
                      </p>
                    )}
                  </div>

                  {selectedCard.illustrator && (
                    <div className="text-xs text-slate-400">
                      <span>Ilustrador: </span>
                      <span className="text-slate-200 font-medium">{selectedCard.illustrator}</span>
                    </div>
                  )}

                  {/* Pricing Section */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Precios de Mercado
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* TCGPlayer */}
                      <div className="bg-slate-950/50 border border-slate-800 p-2.5 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block">TCGPlayer (USD)</span>
                        <span className="text-sm font-extrabold text-emerald-400">
                          {selectedCard.pricing?.tcgplayer?.holofoil?.marketPrice
                            ? `$${selectedCard.pricing.tcgplayer.holofoil.marketPrice.toFixed(2)}`
                            : selectedCard.pricing?.tcgplayer?.normal?.marketPrice
                            ? `$${selectedCard.pricing.tcgplayer.normal.marketPrice.toFixed(2)}`
                            : selectedCard.pricing?.tcgplayer?.marketPrice
                            ? `$${selectedCard.pricing.tcgplayer.marketPrice.toFixed(2)}`
                            : 'No disponible'}
                        </span>
                      </div>

                      {/* Cardmarket */}
                      <div className="bg-slate-950/50 border border-slate-800 p-2.5 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block">Cardmarket (EUR)</span>
                        <span className="text-sm font-extrabold text-sky-400">
                          {selectedCard.pricing?.cardmarket?.avg
                            ? `€${selectedCard.pricing.cardmarket.avg.toFixed(2)}`
                            : selectedCard.pricing?.cardmarket?.trend
                            ? `€${selectedCard.pricing.cardmarket.trend.toFixed(2)}`
                            : 'No disponible'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
