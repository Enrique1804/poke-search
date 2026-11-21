import { useState, useEffect, useRef, useMemo } from 'react';
import type {
  Pokemon,
  PokemonFormDetail,
  VarietyItem,
  EvolutionNode,
  TcgCardBrief,
  TcgSetBrief,
  UserCollectionItem,
  TcgCardDetail,
  QuickPokemon,
} from './types/pokemon';
import {
  TYPE_COLORS,
  TYPE_HEX_COLORS,
  TYPE_TRANSLATIONS,
  ALL_TYPES,
  GENERATIONS,
  calculateTypeMatchups,
  STAT_LABELS,
  STAT_COLORS,
  formatMegaName,
  formatPokemonTitleName,
  parseEvolutionTree,
  getRegionalButtonLabel,
  getRegionalButtonStyle,
  getFormButtonLabel,
} from './constants/pokemon';
import { StatRadarChart } from './components/StatRadarChart';
import { CardInspectorModal } from './components/CardInspectorModal';
import { PokedexGridView } from './components/PokedexGridView';
import { TcgExplorerView } from './components/TcgExplorerView';
import { TcgAlbumView } from './components/TcgAlbumView';
import { WhoIsThatPokemon } from './components/WhoIsThatPokemon';

function App() {
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [currentPokemonData, setCurrentPokemonData] = useState<Pokemon | null>(null);
  
  // Navigation tabs: Ficha Técnica, Combate y Versus, Cartas TCG
  const [activeTab, setActiveTab] = useState<'info' | 'combat' | 'tcg'>('info');

  // Main View Mode: 'detail' (Ficha individual), 'grid' (Catálogo Pokédex), 'tcg_explorer' (Explorador TCG Global), 'album' (Mi Álbum TCG) o 'minigame' (Trivia)
  const [viewMode, setViewMode] = useState<'detail' | 'grid' | 'tcg_explorer' | 'album' | 'minigame'>('detail');

  // Global TCG Explorer state
  const [tcgExplorerQuery, setTcgExplorerQuery] = useState<string>('');
  const [tcgExplorerCards, setTcgExplorerCards] = useState<TcgCardBrief[]>([]);
  const [tcgExplorerLoading, setTcgExplorerLoading] = useState<boolean>(false);
  const [tcgExplorerSets, setTcgExplorerSets] = useState<TcgSetBrief[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [tcgExplorerSortBy, setTcgExplorerSortBy] = useState<'default' | 'price_desc' | 'price_asc' | 'name_asc'>('default');
  const [tcgExplorerDisplayCount, setTcgExplorerDisplayCount] = useState<number>(36);

  // Album view filters & sort
  const [albumSearchQuery, setAlbumSearchQuery] = useState<string>('');
  const [albumSortBy, setAlbumSortBy] = useState<'date_desc' | 'price_desc' | 'price_asc' | 'name_asc'>('date_desc');

  // Grid Catalog Filters & Sort
  const [selectedGen, setSelectedGen] = useState<number | null>(null); // null = todas
  const [selectedType, setSelectedType] = useState<string | null>(null); // null = todos
  const [gridSearchQuery, setGridSearchQuery] = useState('');
  const [gridSortBy, setGridSortBy] = useState<'id_asc' | 'id_desc' | 'name_asc' | 'name_desc'>('id_asc');
  const [gridDisplayCount, setGridDisplayCount] = useState<number>(36);
  const [showFullPokedex, setShowFullPokedex] = useState<boolean>(false);
  const [pokemonTypesMap, setPokemonTypesMap] = useState<Record<number, string[]>>({});

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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // UX feedback: Toast & Scroll-to-Top button
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 360);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // PWA Install / Home Screen Shortcut state
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as any).standalone)
    );
  });

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setIsStandaloneApp(true);
      showToast('📲 ¡PokéSearch instalada en tu dispositivo!');
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallShortcut = async () => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredInstallPrompt(null);
        }
      } catch {
        setShowInstallModal(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

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

  // Pre-load all 18 Pokemon elemental types to map ID -> types[] for instant filtering
  useEffect(() => {
    const loadTypesMap = async () => {
      try {
        const cached = localStorage.getItem('poke_types_map_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && Object.keys(parsed).length >= 1000) {
            setPokemonTypesMap(parsed);
            return;
          }
        }
        const promises = ALL_TYPES.map((typeName) =>
          fetch(`https://pokeapi.co/api/v2/type/${typeName}`).then((r) => (r.ok ? r.json() : null))
        );
        const results = await Promise.all(promises);
        const map: Record<number, string[]> = {};
        results.forEach((tData) => {
          if (!tData || !tData.pokemon) return;
          tData.pokemon.forEach((p: any) => {
            const id = parseInt(p.pokemon.url.split('/').filter(Boolean).pop() || '0', 10);
            if (id > 0 && id <= 1025) {
              if (!map[id]) map[id] = [];
              if (!map[id].includes(tData.name)) {
                map[id].push(tData.name);
              }
            }
          });
        });
        if (Object.keys(map).length > 0) {
          setPokemonTypesMap(map);
          try {
            localStorage.setItem('poke_types_map_cache', JSON.stringify(map));
          } catch {}
        }
      } catch (err) {
        console.error('Error pre-loading Pokemon types map:', err);
      }
    };
    loadTypesMap();
  }, []);

  // Pre-load TCG Sets for Global TCG Explorer (stale-while-revalidate + newest first)
  useEffect(() => {
    const loadTcgSets = async () => {
      try {
        const cached = localStorage.getItem('poke_tcg_sets_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTcgExplorerSets([...parsed].reverse());
          }
        }
        let res = await fetch('https://api.tcgdex.net/v2/es/sets');
        let setsData: TcgSetBrief[] = [];
        if (res.ok) {
          setsData = await res.json();
        }
        if (!Array.isArray(setsData) || setsData.length === 0) {
          const enRes = await fetch('https://api.tcgdex.net/v2/en/sets');
          if (enRes.ok) {
            setsData = await enRes.json();
          }
        }
        if (Array.isArray(setsData) && setsData.length > 0) {
          setTcgExplorerSets([...setsData].reverse());
          try {
            localStorage.setItem('poke_tcg_sets_cache', JSON.stringify(setsData));
          } catch {}
        }
      } catch (err) {
        console.error('Error loading TCG sets:', err);
      }
    };
    loadTcgSets();
  }, []);

  // Handle clicking outside to close suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (opponentContainerRef.current && !opponentContainerRef.current.contains(e.target as Node)) {
        setShowOpponentSuggestions(false);
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

  // TCG Cards state & filters
  const [tcgCards, setTcgCards] = useState<TcgCardBrief[]>([]);
  const [tcgLoading, setTcgLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<TcgCardDetail | null>(null);
  const [cardModalLoading, setCardModalLoading] = useState(false);
  const [tcgSortBy, setTcgSortBy] = useState<'default' | 'price_desc' | 'price_asc' | 'name_asc'>('default');
  const [tcgRarityFilter, setTcgRarityFilter] = useState<string>('all');
  const [tcgSearchQuery, setTcgSearchQuery] = useState<string>('');
  const [tcgViewOnlyCollection, setTcgViewOnlyCollection] = useState<boolean>(false);

  // User TCG Collection ("Mi Álbum")
  const [userCollection, setUserCollection] = useState<UserCollectionItem[]>(() => {
    try {
      const saved = localStorage.getItem('poke_tcg_collection');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Pokédex Description & Category
  const [description, setDescription] = useState<string>('');
  const [genus, setGenus] = useState<string>('');

  // Cosmetic Forms (Vivillon motifs, Unown, Alcremie, Furfrou, etc.)
  const [pokemonForms, setPokemonForms] = useState<PokemonFormDetail[]>([]);
  const [selectedFormIndex, setSelectedFormIndex] = useState<number | null>(null);

  // Versus / Comparison Mode
  const [opponentQuery, setOpponentQuery] = useState('');
  const [opponentPokemon, setOpponentPokemon] = useState<Pokemon | null>(null);
  const [opponentLoading, setOpponentLoading] = useState(false);
  const [opponentError, setOpponentError] = useState<string | null>(null);
  const [showOpponentSuggestions, setShowOpponentSuggestions] = useState(false);
  const opponentContainerRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isShiny, setIsShiny] = useState(false);

  // Opponent suggestions
  const opponentSuggestions = opponentQuery.trim().length >= 1
    ? allPokemonList
        .filter(
          (p) =>
            p.name.toLowerCase().includes(opponentQuery.trim().toLowerCase()) ||
            p.id.toString() === opponentQuery.trim() ||
            p.id.toString().startsWith(opponentQuery.trim())
        )
        .slice(0, 5)
    : [];

  // Filtered and Sorted Pokemon List for Grid View
  const filteredGridPokemon = useMemo(() => {
    let list = [...allPokemonList];

    // Filter by Generation
    if (selectedGen !== null) {
      const genObj = GENERATIONS.find((g) => g.id === selectedGen);
      if (genObj) {
        list = list.filter((p) => p.id >= genObj.startId && p.id <= genObj.endId);
      }
    }

    // Filter by Type
    if (selectedType !== null) {
      list = list.filter((p) => {
        const types = pokemonTypesMap[p.id];
        return types && types.includes(selectedType);
      });
    }

    // Filter by Search Query
    if (gridSearchQuery.trim()) {
      const q = gridSearchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toString() === q ||
          p.id.toString().startsWith(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (gridSortBy === 'id_asc') return a.id - b.id;
      if (gridSortBy === 'id_desc') return b.id - a.id;
      if (gridSortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (gridSortBy === 'name_desc') return b.name.localeCompare(a.name);
      return a.id - b.id;
    });

    return list;
  }, [allPokemonList, selectedGen, selectedType, gridSearchQuery, gridSortBy, pokemonTypesMap]);

  // Reset grid display count when filters change
  useEffect(() => {
    setGridDisplayCount(36);
  }, [selectedGen, selectedType, gridSearchQuery, gridSortBy]);

  const searchOpponent = async (nameOrId: string) => {
    const clean = nameOrId.trim().toLowerCase();
    if (!clean) return;
    setOpponentLoading(true);
    setOpponentError(null);
    setShowOpponentSuggestions(false);
    try {
      let data: Pokemon;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${clean}`);
      if (res.ok) {
        data = await res.json();
      } else {
        const fallback = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${clean}`);
        if (!fallback.ok) throw new Error(`Pokémon "${clean}" no encontrado.`);
        const spData = await fallback.json();
        const defVariety = spData.varieties.find((v: any) => v.is_default) || spData.varieties[0];
        const vRes = await fetch(defVariety.pokemon.url);
        if (!vRes.ok) throw new Error('Error al cargar datos del rival.');
        data = await vRes.json();
      }
      setOpponentPokemon(data);
    } catch (err) {
      setOpponentError(err instanceof Error ? err.message : 'No encontrado.');
      setOpponentPokemon(null);
    } finally {
      setOpponentLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (poke: QuickPokemon) => {
    const exists = favorites.some((f) => f.id === poke.id);
    showToast(
      exists
        ? `Quitado ${poke.name} de Favoritos`
        : `⭐ ${poke.name} añadido a Favoritos`
    );
    setFavorites((prev) => {
      const prevExists = prev.some((f) => f.id === poke.id);
      const updated = prevExists ? prev.filter((f) => f.id !== poke.id) : [poke, ...prev];
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

        // Fetch prices & rarities in background for top cards to allow instant sorting & filtering
        const sampleCards = validCards.slice(0, 30);
        Promise.all(
          sampleCards.map((c) =>
            fetch(`https://api.tcgdex.net/v2/es/cards/${c.id}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        ).then((details) => {
          const detailMap = new Map<string, { rarity?: string; price?: number }>();
          details.filter(Boolean).forEach((d: any) => {
            const price =
              d.pricing?.tcgplayer?.holofoil?.marketPrice ||
              d.pricing?.tcgplayer?.normal?.marketPrice ||
              d.pricing?.tcgplayer?.marketPrice ||
              d.pricing?.cardmarket?.avg ||
              0;
            detailMap.set(d.id, { rarity: d.rarity, price });
          });

          setTcgCards((prev) =>
            prev.map((c) => {
              const meta = detailMap.get(c.id);
              return meta ? { ...c, rarity: meta.rarity, price: meta.price } : c;
            })
          );
        });
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
      let detail: any = null;
      let res = await fetch(`https://api.tcgdex.net/v2/es/cards/${card.id}`);
      if (res.ok) {
        detail = await res.json();
      }

      // If Spanish fetch failed or Spanish card has no image, check English card
      if (!detail || !detail.image) {
        try {
          const enRes = await fetch(`https://api.tcgdex.net/v2/en/cards/${card.id}`);
          if (enRes.ok) {
            const enDetail = await enRes.json();
            if (!detail) {
              detail = enDetail;
            } else if (enDetail.image) {
              detail.image = enDetail.image;
            }
          }
        } catch {}
      }

      if (detail) {
        if (!detail.image && card.image) {
          detail.image = card.image;
        }
        if (!detail.localId && card.localId) {
          detail.localId = card.localId;
        }
        setSelectedCard(detail);
      } else {
        setSelectedCard({
          id: card.id,
          name: card.name,
          image: card.image,
          localId: card.localId,
        });
      }
    } catch (err) {
      console.error('Error fetching card details:', err);
      setSelectedCard({
        id: card.id,
        name: card.name,
        image: card.image,
        localId: card.localId,
      });
    } finally {
      setCardModalLoading(false);
    }
  };

  // Filtered and Sorted TCG Cards
  const filteredTcgCards = useMemo(() => {
    let list = [...tcgCards];

    // Filter by name/search
    if (tcgSearchQuery.trim()) {
      const q = tcgSearchQuery.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.localId.includes(q));
    }

    // Filter by Collection ("En mi álbum")
    if (tcgViewOnlyCollection) {
      const collectionSet = new Set(userCollection.map((c) => c.id));
      list = list.filter((c) => collectionSet.has(c.id));
    }

    // Filter by Rarity
    if (tcgRarityFilter !== 'all') {
      list = list.filter((c) => c.rarity && c.rarity.toLowerCase().includes(tcgRarityFilter.toLowerCase()));
    }

    // Sort
    if (tcgSortBy === 'price_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (tcgSortBy === 'price_asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (tcgSortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [tcgCards, tcgSearchQuery, tcgRarityFilter, tcgSortBy, tcgViewOnlyCollection, userCollection]);

  // Toggle Card Collection item
  const toggleCardCollection = (card: { id: string; name: string; localId: string; image?: string; rarity?: string; price?: number }) => {
    const exists = userCollection.some((c) => c.id === card.id);
    showToast(
      exists
        ? `Carta "${card.name}" quitada de Mi Álbum`
        : `💼 "${card.name}" añadida a Mi Álbum TCG`
    );
    setUserCollection((prev) => {
      const prevExists = prev.some((c) => c.id === card.id);
      let updated: UserCollectionItem[];
      if (prevExists) {
        updated = prev.filter((c) => c.id !== card.id);
      } else {
        updated = [
          {
            id: card.id,
            name: card.name,
            localId: card.localId,
            image: card.image,
            rarity: card.rarity,
            price: card.price,
            addedAt: Date.now(),
          },
          ...prev,
        ];
      }
      try {
        localStorage.setItem('poke_tcg_collection', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving TCG collection:', err);
      }
      return updated;
    });
  };

  // Total user collection value calculation
  const totalCollectionValue = useMemo(() => {
    return userCollection.reduce((acc, c) => acc + (c.price || 0), 0);
  }, [userCollection]);

  // Filtered and Sorted Global User Collection for 'album' ViewMode
  const filteredUserCollection = useMemo(() => {
    let list = [...userCollection];

    if (albumSearchQuery.trim()) {
      const q = albumSearchQuery.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.localId.includes(q) || (c.rarity && c.rarity.toLowerCase().includes(q)));
    }

    if (albumSortBy === 'price_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (albumSortBy === 'price_asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (albumSortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => b.addedAt - a.addedAt);
    }

    return list;
  }, [userCollection, albumSearchQuery, albumSortBy]);

  const tcgCardIndexRef = useRef<{
    esCards: TcgCardBrief[];
    enCards: TcgCardBrief[];
    esMap: Map<string, TcgCardBrief>;
  } | null>(null);

  const normalizeSearchText = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const normalizeCompactText = (str: string) =>
    normalizeSearchText(str).replace(/[^a-z0-9]/g, '');

  // Execute Search in Global TCG Explorer (bilingual ES + EN, accent-insensitive & space-tolerant)
  const executeTcgExplorerSearch = async (searchTerm?: string) => {
    const q = (searchTerm !== undefined ? searchTerm : tcgExplorerQuery).trim();
    if (!q) return;

    setTcgExplorerLoading(true);
    setSelectedSetId(null);
    try {
      // Load full ES + EN card index once in memory for instant accent/space-insensitive bilingual search
      if (!tcgCardIndexRef.current) {
        const [esRes, enRes] = await Promise.all([
          fetch('https://api.tcgdex.net/v2/es/cards').catch(() => null),
          fetch('https://api.tcgdex.net/v2/en/cards').catch(() => null),
        ]);
        const esRaw: any[] = esRes && esRes.ok ? await esRes.json() : [];
        const enRaw: any[] = enRes && enRes.ok ? await enRes.json() : [];

        const mapCard = (c: any): TcgCardBrief => ({
          id: c.id,
          localId: c.localId || '?',
          name: c.name || c.id,
          image: c.image,
        });

        const esCards = Array.isArray(esRaw) ? esRaw.map(mapCard) : [];
        const enCards = Array.isArray(enRaw) ? enRaw.map(mapCard) : [];
        const esMap = new Map<string, TcgCardBrief>(esCards.map((c) => [c.id, c]));

        if (esCards.length > 0 || enCards.length > 0) {
          tcgCardIndexRef.current = { esCards, enCards, esMap };
        }
      }

      let formattedCards: TcgCardBrief[] = [];
      const index = tcgCardIndexRef.current;

      if (index) {
        const normQ = normalizeSearchText(q);
        const compactQ = normalizeCompactText(q);
        const matched = new Map<string, TcgCardBrief>();

        const isMatch = (name: string) =>
          normalizeSearchText(name).includes(normQ) ||
          (compactQ.length >= 3 && normalizeCompactText(name).includes(compactQ));

        for (const c of index.esCards) {
          if (isMatch(c.name)) {
            matched.set(c.id, c);
          }
        }
        for (const c of index.enCards) {
          if (isMatch(c.name) && !matched.has(c.id)) {
            // Prefer Spanish card entry if available for the same ID
            matched.set(c.id, index.esMap.get(c.id) || c);
          }
        }
        formattedCards = Array.from(matched.values());
      } else {
        // Direct API fallback if full index failed to load
        const [esRes, enRes] = await Promise.all([
          fetch(`https://api.tcgdex.net/v2/es/cards?name=${encodeURIComponent(q)}`).catch(() => null),
          fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(q)}`).catch(() => null),
        ]);
        const esList: any[] = esRes && esRes.ok ? await esRes.json() : [];
        const enList: any[] = enRes && enRes.ok ? await enRes.json() : [];
        const merged = new Map<string, TcgCardBrief>();
        [...esList, ...enList].forEach((c: any) => {
          if (!merged.has(c.id)) {
            merged.set(c.id, {
              id: c.id,
              localId: c.localId || '?',
              name: c.name || c.id,
              image: c.image,
            });
          }
        });
        formattedCards = Array.from(merged.values());
      }

      setTcgExplorerCards(formattedCards);
      setTcgExplorerDisplayCount(36);

      // Fetch prices for top results in background
      const sampleCards = formattedCards.slice(0, 30);
      Promise.all(
        sampleCards.map((c) =>
          fetch(`https://api.tcgdex.net/v2/es/cards/${c.id}`)
            .then((r) => (r.ok ? r : fetch(`https://api.tcgdex.net/v2/en/cards/${c.id}`)))
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      ).then((details) => {
        const detailMap = new Map<string, { rarity?: string; price?: number }>();
        details.filter(Boolean).forEach((d: any) => {
          const price =
            d.pricing?.tcgplayer?.holofoil?.marketPrice ||
            d.pricing?.tcgplayer?.normal?.marketPrice ||
            d.pricing?.tcgplayer?.marketPrice ||
            d.pricing?.cardmarket?.avg ||
            0;
          detailMap.set(d.id, { rarity: d.rarity, price });
        });

        setTcgExplorerCards((prev) =>
          prev.map((c) => {
            const meta = detailMap.get(c.id);
            return meta ? { ...c, rarity: meta.rarity, price: meta.price } : c;
          })
        );
      });
    } catch (err) {
      console.error('Error in TCG Explorer search:', err);
    } finally {
      setTcgExplorerLoading(false);
    }
  };

  // Load an entire Expansion / Set in Global TCG Explorer
  const loadTcgSetCards = async (setId: string) => {
    setSelectedSetId(setId);
    setTcgExplorerLoading(true);
    setTcgExplorerCards([]);
    try {
      // 1. Fetch Spanish and English set details in parallel
      const [esRes, enRes] = await Promise.all([
        fetch(`https://api.tcgdex.net/v2/es/sets/${setId}`).catch(() => null),
        fetch(`https://api.tcgdex.net/v2/en/sets/${setId}`).catch(() => null),
      ]);

      let setData: any = null;
      if (esRes && esRes.ok) {
        setData = await esRes.json();
      }

      let enData: any = null;
      if (enRes && enRes.ok) {
        enData = await enRes.json();
      }

      // If Spanish has no cards, fallback to English set data
      if (!setData || !setData.cards || setData.cards.length === 0) {
        setData = enData;
      }

      if (setData && Array.isArray(setData.cards) && setData.cards.length > 0) {
        // Build map of English cards for fallback images or names
        const enCardMap = new Map<string, any>();
        if (enData && Array.isArray(enData.cards)) {
          enData.cards.forEach((c: any) => {
            if (c.id) enCardMap.set(c.id, c);
            if (c.localId) enCardMap.set(c.localId, c);
          });
        }

        const serieId = setData.serie?.id || enData?.serie?.id || 'swsh';

        // Process all cards without discarding cards that lack an official scan
        const processedCards: TcgCardBrief[] = setData.cards.map((c: any) => {
          let img = c.image;

          // 1. Check if English counterpart has an image
          if (!img && enCardMap.has(c.id)) {
            img = enCardMap.get(c.id)?.image;
          }
          if (!img && enCardMap.has(c.localId)) {
            img = enCardMap.get(c.localId)?.image;
          }

          // 2. Check known sub-set asset path conventions (e.g. swsh9tg -> swsh9, swsh12.5gg -> swsh12.5, swsh4.5sv -> swsh4.5, cel25cc -> cel25)
          if (!img && setId) {
            const cleanSetId = setId
              .replace(/tg$/, '')
              .replace(/gg$/, '')
              .replace(/sv$/, '')
              .replace(/cc$/, '');
            if (cleanSetId !== setId) {
              img = `https://assets.tcgdex.net/en/${serieId}/${cleanSetId}/${c.localId}`;
            }
          }

          return {
            id: c.id,
            localId: c.localId || '?',
            name: c.name || enCardMap.get(c.id)?.name || c.id,
            image: img,
          };
        });

        setTcgExplorerCards(processedCards);
        setTcgExplorerDisplayCount(36);

        // Fetch prices for top results in background
        const sampleCards = processedCards.slice(0, 30);
        Promise.all(
          sampleCards.map((c: any) =>
            fetch(`https://api.tcgdex.net/v2/es/cards/${c.id}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        ).then((details) => {
          const detailMap = new Map<string, { rarity?: string; price?: number }>();
          details.filter(Boolean).forEach((d: any) => {
            const price =
              d.pricing?.tcgplayer?.holofoil?.marketPrice ||
              d.pricing?.tcgplayer?.normal?.marketPrice ||
              d.pricing?.tcgplayer?.marketPrice ||
              d.pricing?.cardmarket?.avg ||
              0;
            detailMap.set(d.id, { rarity: d.rarity, price });
          });

          setTcgExplorerCards((prev) =>
            prev.map((c) => {
              const meta = detailMap.get(c.id);
              return meta ? { ...c, rarity: meta.rarity, price: meta.price } : c;
            })
          );
        });
      } else {
        setTcgExplorerCards([]);
      }
    } catch (err) {
      console.error('Error loading TCG Set:', err);
      setTcgExplorerCards([]);
    } finally {
      setTcgExplorerLoading(false);
    }
  };

  // Filtered and Sorted Cards for Global TCG Explorer
  const sortedTcgExplorerCards = useMemo(() => {
    let list = [...tcgExplorerCards];
    if (tcgExplorerSortBy === 'price_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (tcgExplorerSortBy === 'price_asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (tcgExplorerSortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [tcgExplorerCards, tcgExplorerSortBy]);

  // Available unique rarities for current cards
  const availableRarities = useMemo(() => {
    const set = new Set<string>();
    tcgCards.forEach((c) => {
      if (c.rarity) set.add(c.rarity);
    });
    return Array.from(set);
  }, [tcgCards]);

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

            // Alternate forms (Zygarde 10%, Urshifu Rapid Strike, Maushold 3, Giratina Origin, Deoxys forms, Minior, etc.)
            forms = speciesData.varieties
              .filter((v: any) => 
                !v.is_default && 
                !v.pokemon.name.includes('-mega') && 
                !v.pokemon.name.includes('-gmax') && 
                !v.pokemon.name.includes('-primal') && 
                !regionalSuffixes.some(s => v.pokemon.name.includes(s))
              )
              .map((v: any) => {
                const varId = parseInt(v.pokemon.url.split('/').filter(Boolean).pop() || '0', 10);
                const displayName = getFormButtonLabel(v.pokemon.name, speciesData.name || data.species.name || data.name, false);
                return {
                  name: v.pokemon.name,
                  url: v.pokemon.url,
                  id: varId,
                  displayName,
                  spriteDefault: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${varId}.png`,
                  spriteShiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${varId}.png`,
                };
              });
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

  // Base Stat Total calculation
  const currentBst = currentPokemonData?.stats.reduce((acc, s) => acc + s.base_stat, 0) || 0;
  const opponentBst = opponentPokemon?.stats.reduce((acc, s) => acc + s.base_stat, 0) || 0;

  const getBstRating = (total: number) => {
    if (total >= 670) return { label: '🌟 Legendario Supremo', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
    if (total >= 600) return { label: '⚔️ Nivel Élite / Pseudo-Legendario', color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' };
    if (total >= 500) return { label: '🛡️ Competitivo Avanzado', color: 'text-sky-400 bg-sky-500/15 border-sky-500/30' };
    if (total >= 400) return { label: '✨ Nivel Intermedio', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
    return { label: '🌱 Fase Básica', color: 'text-slate-400 bg-slate-500/15 border-slate-500/30' };
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if ((e.key === '/' && !isInput) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setViewMode('detail');
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      } else if (!isInput && !selectedCard && viewMode === 'detail' && pokemon) {
        if (e.key === 'ArrowLeft' && pokemon.id > 1 && !loading) {
          handlePrevPokemon();
        } else if (e.key === 'ArrowRight' && pokemon.id < 1025 && !loading) {
          handleNextPokemon();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-rose-500 selection:text-white flex flex-col justify-start md:justify-center pt-6 pb-24 md:py-10 px-3 sm:px-6 lg:px-8">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className={`relative z-10 sm:mx-auto sm:w-full transition-all duration-300 ${
        viewMode === 'detail' ? 'max-w-2xl lg:max-w-5xl' : 'max-w-6xl'
      }`}>
        {/* Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md mb-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-rose-400 uppercase">Pokédex + Combate Competitivo + TCG</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 128 128"
              aria-label="PokéSearch Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-[0_0_12px_rgba(244,63,94,0.45)] select-none flex-shrink-0"
            >
              <defs>
                <linearGradient id="logoTopRed" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="55%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#9f1239" />
                </linearGradient>
                <linearGradient id="logoBottomWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
              </defs>
              <circle cx="64" cy="64" r="58" fill="#0f172a" />
              <path d="M 10 64 A 54 54 0 0 1 118 64 Z" fill="url(#logoTopRed)" />
              <path d="M 10 64 A 54 54 0 0 0 118 64 Z" fill="url(#logoBottomWhite)" />
              <ellipse cx="44" cy="34" rx="18" ry="8" transform="rotate(-25 44 34)" fill="#ffffff" opacity="0.28" />
              <rect x="8" y="57" width="112" height="14" fill="#0f172a" />
              <circle cx="64" cy="64" r="55" fill="none" stroke="#0f172a" strokeWidth="6" />
              <circle cx="64" cy="64" r="19" fill="#0f172a" />
              <circle cx="64" cy="64" r="13" fill="#f8fafc" />
              <circle cx="64" cy="64" r="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            </svg>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
              PokéSearch
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto px-2">
            Explora los 1025 Pokémon, consulta análisis de combate competitivo, formas alternativas y colecciona cartas oficiales TCG.
          </p>

          {!isStandaloneApp && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={handleInstallShortcut}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-rose-500/15 border border-slate-700/80 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-[11px] font-bold transition-all cursor-pointer shadow-md active:scale-95"
              >
                <span>📲</span>
                <span>{deferredInstallPrompt ? 'Instalar App en tu dispositivo' : 'Crear acceso directo en inicio'}</span>
              </button>
            </div>
          )}

          {/* Sticky PC View Mode Switcher (hidden on mobile; mobile uses Bottom Nav Bar) */}
          <div className="hidden md:inline-flex sticky top-3 z-40 flex-wrap justify-center items-center p-1.5 mt-5 bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-xl shadow-black/40 backdrop-blur-xl gap-1">
            <button
              type="button"
              onClick={() => setViewMode('detail')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'detail'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>🔍</span>
              <span>Ficha Detallada</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>🗂️</span>
              <span>Catálogo Pokédex</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                viewMode === 'grid' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                1025
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('tcg_explorer');
                if (tcgExplorerCards.length === 0 && !tcgExplorerQuery) {
                  executeTcgExplorerSearch('Pikachu');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'tcg_explorer'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M9 8h6M9 12h6M9 16h3" />
              </svg>
              <span>Explorador TCG</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('album')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'album'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
              }`}
            >
              <span>💼</span>
              <span>Mi Álbum TCG</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                viewMode === 'album' ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-amber-400'
              }`}>
                {userCollection.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('minigame')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'minigame'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50'
              }`}
            >
              <span>🎮</span>
              <span>¿Quién es?</span>
            </button>
          </div>
        </div>

        {/* View Mode Content */}
        {viewMode === 'grid' ? (
          <PokedexGridView
            filteredGridPokemon={filteredGridPokemon}
            pokemonTypesMap={pokemonTypesMap}
            favorites={favorites}
            gridSearchQuery={gridSearchQuery}
            setGridSearchQuery={setGridSearchQuery}
            gridSortBy={gridSortBy}
            setGridSortBy={setGridSortBy}
            selectedGen={selectedGen}
            setSelectedGen={setSelectedGen}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            showFullPokedex={showFullPokedex}
            setShowFullPokedex={setShowFullPokedex}
            gridDisplayCount={gridDisplayCount}
            setGridDisplayCount={setGridDisplayCount}
            onSelectPokemon={(name) => {
              searchByName(name);
              setViewMode('detail');
            }}
            onToggleFavorite={toggleFavorite}
          />
        ) : viewMode === 'tcg_explorer' ? (
          <TcgExplorerView
            tcgExplorerQuery={tcgExplorerQuery}
            setTcgExplorerQuery={setTcgExplorerQuery}
            tcgExplorerCards={tcgExplorerCards}
            sortedTcgExplorerCards={sortedTcgExplorerCards}
            tcgExplorerLoading={tcgExplorerLoading}
            tcgExplorerSets={tcgExplorerSets}
            selectedSetId={selectedSetId}
            tcgExplorerSortBy={tcgExplorerSortBy}
            setTcgExplorerSortBy={setTcgExplorerSortBy}
            tcgExplorerDisplayCount={tcgExplorerDisplayCount}
            setTcgExplorerDisplayCount={setTcgExplorerDisplayCount}
            userCollection={userCollection}
            onExecuteSearch={executeTcgExplorerSearch}
            onLoadSetCards={loadTcgSetCards}
            onCardClick={handleCardClick}
            onToggleCollection={toggleCardCollection}
          />
        ) : viewMode === 'album' ? (
          <TcgAlbumView
            userCollection={userCollection}
            filteredUserCollection={filteredUserCollection}
            totalCollectionValue={totalCollectionValue}
            albumSearchQuery={albumSearchQuery}
            setAlbumSearchQuery={setAlbumSearchQuery}
            albumSortBy={albumSortBy}
            setAlbumSortBy={setAlbumSortBy}
            onCardClick={handleCardClick}
            onToggleCollection={toggleCardCollection}
            onExploreGrid={() => setViewMode('grid')}
          />
        ) : viewMode === 'minigame' ? (
          <WhoIsThatPokemon
            allPokemonNames={allPokemonList}
            onInspectPokemon={(name) => {
              searchByName(name);
              setViewMode('detail');
            }}
          />
        ) : (
          /* DETAIL VIEW (Search Input & Detailed Card) */
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
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Escribe un Pokémon (ej: Zygarde, Charizard, Pikachu)..."
                  className="w-full pl-11 pr-9 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-white placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-base sm:text-sm font-medium"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Limpiar búsqueda"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer text-xs font-bold"
                  >
                    ✕
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-slate-900 border border-slate-800 rounded-md absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    /
                  </kbd>
                )}

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
                {/* 3-Tab Switcher */}
                <div className="flex border-b border-slate-800/80 gap-1 sm:gap-2 overflow-x-auto scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    className={`pb-3 px-2.5 sm:px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-none ${
                      activeTab === 'info'
                        ? 'border-rose-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🎮</span>
                    <span>Ficha Técnica</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('combat')}
                    className={`pb-3 px-2.5 sm:px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-none ${
                      activeTab === 'combat'
                        ? 'border-rose-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>⚔️</span>
                    <span>Combate y Versus</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tcg')}
                    className={`pb-3 px-2.5 sm:px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-none ${
                      activeTab === 'tcg'
                        ? 'border-rose-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="2" />
                      <path strokeLinecap="round" strokeWidth="2" d="M9 8h6M9 12h6M9 16h3" />
                    </svg>
                    <span>Cartas TCG</span>
                    {tcgCards.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 leading-none">
                        {tcgCards.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Tab 1: Info General (2-Column Grid on PC, 1-Column on Mobile) */}
                {activeTab === 'info' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 space-y-5">
                    {/* Visual Section (Image & Glow) */}
                    <div className="relative flex flex-col items-center justify-center pt-4 pb-6 bg-slate-950/40 border border-slate-800/60 rounded-3xl overflow-hidden group">
                      {/* Dynamic glow base on primary type */}
                      <div className={`absolute w-36 h-36 rounded-full opacity-35 blur-3xl ${getPrimaryTypeColor(currentPokemonData).bg.replace('/20', '/60')}`} />

                      {/* Non-overlapping Top Bar: Action Buttons (Left) + Prev/Next Navigator (Right) */}
                      <div className="w-full px-3 sm:px-4 flex flex-wrap items-center justify-between gap-2 z-20 mb-2">
                        {/* Top Action Buttons (Shiny, Mega, G-Max, Primal, Regional & Forms) */}
                        <div className="flex flex-wrap gap-1.5">
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

                        {/* Alternate Forms Toggle Buttons - only shown if <= 2 forms to prevent header clutter */}
                        {formVarieties.length <= 2 && formVarieties.map((form, idx) => (
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

                        {/* Navigation Prev & Next Controls + Badge ID */}
                        <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
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

                          <span className="text-xs font-mono font-bold text-slate-400 px-1 whitespace-nowrap">
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
                      </div>

                      {/* Main Sprite (Cosmetic Form Aware) */}
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
                        className="w-36 h-36 object-contain relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-105 mt-2"
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
                              {TYPE_TRANSLATIONS[t.type.name] || t.type.name}
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

                    {/* Multi-Form Varieties Selector Strip (Minior, Rotom, Deoxys, etc. when forms > 2) */}
                    {formVarieties.length > 2 && (
                      <div className="space-y-2 p-3.5 bg-slate-950/40 border border-slate-850 rounded-3xl animate-fade-in">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            <span>🪐</span>
                            <span>Formas y Variantes ({formVarieties.length + 1})</span>
                          </span>
                          <span className="text-[11px] font-bold text-sky-400">
                            {activeFormIndex === null
                              ? 'Forma Base / Meteorito'
                              : formVarieties[activeFormIndex]?.displayName || ''}
                          </span>
                        </div>

                        {/* Horizontal Scrollable Badges with Mini Sprites */}
                        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                          {/* Base Form Badge */}
                          <button
                            type="button"
                            onClick={() => {
                              if (activeFormIndex !== null) {
                                handleFormToggle(activeFormIndex);
                              }
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                              activeFormIndex === null
                                ? 'bg-sky-500/25 text-white border-sky-500/50 shadow-md shadow-sky-500/10 scale-105'
                                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <img
                              src={isShiny && pokemon!.sprites.front_shiny ? pokemon!.sprites.front_shiny : pokemon!.sprites.front_default}
                              alt={pokemon!.species.name || pokemon!.name}
                              className="w-7 h-7 object-contain drop-shadow-sm"
                              loading="lazy"
                            />
                            <span>Forma Base</span>
                          </button>

                          {/* Each Alternate Form Badge */}
                          {formVarieties.map((form, idx) => (
                            <button
                              key={form.name}
                              type="button"
                              onClick={() => handleFormToggle(idx)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                                activeFormIndex === idx
                                  ? 'bg-sky-500/25 text-white border-sky-500/50 shadow-md shadow-sky-500/10 scale-105'
                                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              <img
                                src={isShiny && form.spriteShiny ? form.spriteShiny : (form.spriteDefault || '')}
                                alt={form.displayName || form.name}
                                className="w-7 h-7 object-contain drop-shadow-sm"
                                loading="lazy"
                              />
                              <span>{form.displayName || form.name}</span>
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
                    </div>

                    <div className="lg:col-span-7 space-y-6">
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
                  </div>
                )}

                {/* Tab 2: Combate y Competitivo */}
                {activeTab === 'combat' && (
                  <div className="space-y-6">
                    {/* Header: BST and Evaluation */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/40 border border-slate-850 rounded-3xl">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                          Total de Estadísticas Base (BST)
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-white">{currentBst}</span>
                          <span className="text-xs text-slate-400 font-medium">puntos base</span>
                        </div>
                      </div>

                      <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${getBstRating(currentBst).color}`}>
                        {getBstRating(currentBst).label}
                      </div>
                    </div>

                    {/* Radar Chart + Abilities Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {/* Hexagonal Radar Chart */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-3xl flex flex-col items-center justify-center">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Balance de Estadísticas
                        </span>
                        <StatRadarChart
                          stats={currentPokemonData.stats}
                          primaryColorHex={TYPE_HEX_COLORS[currentPokemonData.types[0]?.type.name] || '#f43f5e'}
                        />
                      </div>

                      {/* Abilities & Physical Roles */}
                      <div className="space-y-4">
                        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-3xl space-y-3">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Habilidades Oficiales
                          </span>

                          {currentPokemonData.abilities && currentPokemonData.abilities.length > 0 ? (
                            <div className="space-y-2">
                              {currentPokemonData.abilities.map((ab) => (
                                <div
                                  key={ab.ability.name}
                                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                                    ab.is_hidden
                                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                      : 'bg-slate-900/60 border-slate-800 text-slate-200'
                                  }`}
                                >
                                  <span className="capitalize font-bold text-sm">
                                    {ab.ability.name.replace(/-/g, ' ')}
                                  </span>
                                  {ab.is_hidden ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                      ⭐ Habilidad Oculta
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      Slot {ab.slot}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">No hay habilidades registradas.</p>
                          )}
                        </div>

                        {/* Quick Defensive Summary */}
                        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-3xl space-y-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Perfil Defensivo Elemental
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {currentPokemonData.types.map((t) => (
                              <span
                                key={t.type.name}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold border capitalize ${TYPE_COLORS[t.type.name]?.bg} ${TYPE_COLORS[t.type.name]?.text} ${TYPE_COLORS[t.type.name]?.border}`}
                              >
                                {TYPE_TRANSLATIONS[t.type.name] || t.type.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Type Effectiveness (Matchups) Table */}
                    {(() => {
                      const defTypes = currentPokemonData.types.map((t) => t.type.name);
                      const matchups = calculateTypeMatchups(defTypes);

                      return (
                        <div className="space-y-3 bg-slate-950/40 border border-slate-850 p-4 sm:p-5 rounded-3xl">
                          <div>
                            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-2">
                              <span>🛡️ Efectividad de Tipos (Daño Recibido)</span>
                            </h3>
                            <p className="text-[11px] text-slate-400">
                              Multiplicador de daño calculado según los tipos defensivos de {formatPokemonTitleName(currentPokemonData.name, pokemon!.species.name || pokemon!.name)}.
                            </p>
                          </div>

                          <div className="space-y-2.5 pt-1">
                            {/* 4x Critical Weakness */}
                            {matchups.quadWeak.length > 0 && (
                              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-xs font-black text-rose-400 min-w-[130px] flex items-center gap-1">
                                  <span>🔴 Vulnerable (4×)</span>
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {matchups.quadWeak.map((type) => (
                                    <span
                                      key={type}
                                      className={`px-2.5 py-0.5 rounded-xl text-xs font-bold border ${TYPE_COLORS[type]?.bg} ${TYPE_COLORS[type]?.text} ${TYPE_COLORS[type]?.border}`}
                                    >
                                      {TYPE_TRANSLATIONS[type]}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 2x Weakness */}
                            {matchups.doubleWeak.length > 0 && (
                              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-xs font-black text-amber-400 min-w-[130px] flex items-center gap-1">
                                  <span>🟠 Débil (2×)</span>
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {matchups.doubleWeak.map((type) => (
                                    <span
                                      key={type}
                                      className={`px-2.5 py-0.5 rounded-xl text-xs font-bold border ${TYPE_COLORS[type]?.bg} ${TYPE_COLORS[type]?.text} ${TYPE_COLORS[type]?.border}`}
                                    >
                                      {TYPE_TRANSLATIONS[type]}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 0.5x Resistance */}
                            {matchups.halfResist.length > 0 && (
                              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-xs font-black text-emerald-400 min-w-[130px] flex items-center gap-1">
                                  <span>🟢 Resistente (½×)</span>
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {matchups.halfResist.map((type) => (
                                    <span
                                      key={type}
                                      className={`px-2.5 py-0.5 rounded-xl text-xs font-bold border ${TYPE_COLORS[type]?.bg} ${TYPE_COLORS[type]?.text} ${TYPE_COLORS[type]?.border}`}
                                    >
                                      {TYPE_TRANSLATIONS[type]}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 0.25x Super Resistance */}
                            {matchups.quadResist.length > 0 && (
                              <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-xs font-black text-cyan-400 min-w-[130px] flex items-center gap-1">
                                  <span>🔵 Muy Resistente (¼×)</span>
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {matchups.quadResist.map((type) => (
                                    <span
                                      key={type}
                                      className={`px-2.5 py-0.5 rounded-xl text-xs font-bold border ${TYPE_COLORS[type]?.bg} ${TYPE_COLORS[type]?.text} ${TYPE_COLORS[type]?.border}`}
                                    >
                                      {TYPE_TRANSLATIONS[type]}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 0x Immunity */}
                            {matchups.immune.length > 0 && (
                              <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-xs font-black text-purple-400 min-w-[130px] flex items-center gap-1">
                                  <span>⚫ Inmune (0×)</span>
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {matchups.immune.map((type) => (
                                    <span
                                      key={type}
                                      className={`px-2.5 py-0.5 rounded-xl text-xs font-bold border ${TYPE_COLORS[type]?.bg} ${TYPE_COLORS[type]?.text} ${TYPE_COLORS[type]?.border}`}
                                    >
                                      {TYPE_TRANSLATIONS[type]}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Versus / Side-by-Side Comparison Mode */}
                    <div className="space-y-4 bg-slate-950/40 border border-slate-850 p-4 sm:p-5 rounded-3xl">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-0.5 flex items-center gap-2">
                            <span>🆚 Modo Comparador (Cara a Cara)</span>
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Compara las estadísticas base de {currentPokemonData.name} contra cualquier otro Pokémon rival.
                          </p>
                        </div>
                      </div>

                      {/* Opponent Search Bar */}
                      <div ref={opponentContainerRef} className="relative">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={opponentQuery}
                            onFocus={() => setShowOpponentSuggestions(true)}
                            onChange={(e) => {
                              setOpponentQuery(e.target.value);
                              setShowOpponentSuggestions(true);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                searchOpponent(opponentQuery);
                              }
                            }}
                            placeholder="Elige un rival (ej: Blastoise, Gengar, Mewtwo, Lucario)..."
                            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                          />
                          <button
                            type="button"
                            onClick={() => searchOpponent(opponentQuery)}
                            disabled={opponentLoading || !opponentQuery.trim()}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-rose-300 font-bold text-xs rounded-2xl border border-slate-700 transition-all cursor-pointer"
                          >
                            {opponentLoading ? 'Cargando...' : 'Comparar'}
                          </button>
                        </div>

                        {/* Opponent Suggestions Dropdown */}
                        {showOpponentSuggestions && opponentSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl overflow-hidden py-1 divide-y divide-slate-800/40">
                            {opponentSuggestions.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setOpponentQuery(p.name);
                                  searchOpponent(p.name);
                                }}
                                className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
                              >
                                <span className="capitalize text-xs font-semibold">{p.name}</span>
                                <span className="text-[10px] font-mono text-slate-500">#{p.id}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {opponentError && (
                        <p className="text-xs text-rose-400 italic text-center py-2">{opponentError}</p>
                      )}

                      {/* Side-by-Side Comparison UI */}
                      {opponentPokemon && (
                        <div className="space-y-4 pt-2 animate-scale-up">
                          {/* Top Avatars Row */}
                          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                            {/* Player Pokemon */}
                            <div className="flex items-center gap-3">
                              <img
                                src={currentPokemonData.sprites.front_default}
                                alt={currentPokemonData.name}
                                className="w-12 h-12 object-contain"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-white capitalize">{currentPokemonData.name}</h4>
                                <span className="text-[10px] font-mono text-slate-400">BST: {currentBst}</span>
                              </div>
                            </div>

                            {/* Opponent Pokemon */}
                            <div className="flex items-center justify-end gap-3 text-right">
                              <div>
                                <h4 className="text-xs font-bold text-white capitalize">{opponentPokemon.name}</h4>
                                <span className="text-[10px] font-mono text-slate-400">BST: {opponentBst}</span>
                              </div>
                              <img
                                src={opponentPokemon.sprites.front_default}
                                alt={opponentPokemon.name}
                                className="w-12 h-12 object-contain"
                              />
                            </div>
                          </div>

                          {/* Stat by Stat Comparison Bars */}
                          <div className="space-y-2.5">
                            {currentPokemonData.stats.map((stat) => {
                              const s1 = stat.base_stat;
                              const oppStat = opponentPokemon.stats.find((s) => s.stat.name === stat.stat.name);
                              const s2 = oppStat ? oppStat.base_stat : 0;
                              const diff = s1 - s2;
                              const label = STAT_LABELS[stat.stat.name] || stat.stat.name.toUpperCase();

                              return (
                                <div key={stat.stat.name} className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className={`font-black ${diff > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                                      {s1} {diff > 0 && <span className="text-[10px] font-normal text-emerald-400">(+{diff})</span>}
                                    </span>

                                    <span className="font-bold text-slate-400 uppercase text-[10px]">{label}</span>

                                    <span className={`font-black ${diff < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                                      {diff < 0 && <span className="text-[10px] font-normal text-rose-400">(+{Math.abs(diff)}) </span>}
                                      {s2}
                                    </span>
                                  </div>

                                  {/* Visual Comparison Progress Bars */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden flex justify-end">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          diff > 0 ? 'bg-emerald-500' : 'bg-slate-600'
                                        }`}
                                        style={{ width: `${Math.min((s1 / 200) * 100, 100)}%` }}
                                      />
                                    </div>
                                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          diff < 0 ? 'bg-rose-500' : 'bg-slate-600'
                                        }`}
                                        style={{ width: `${Math.min((s2 / 200) * 100, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: TCG Cards */}
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
                      <div className="space-y-3">
                        {/* TCG Controls: Search, Sort, Collection Toggle & Rarity Filter */}
                        <div className="space-y-2 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-850">
                          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                            {/* Inner search */}
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={tcgSearchQuery}
                                onChange={(e) => setTcgSearchQuery(e.target.value)}
                                placeholder="Filtrar cartas..."
                                className="w-full pl-3 pr-8 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                              />
                              {tcgSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setTcgSearchQuery('')}
                                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300 text-xs font-bold"
                                >
                                  ✕
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2">
                              {/* Rarity filter */}
                              {availableRarities.length > 0 && (
                                <select
                                  value={tcgRarityFilter}
                                  onChange={(e) => setTcgRarityFilter(e.target.value)}
                                  className="w-full min-w-0 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-2 focus:outline-none focus:border-rose-500 cursor-pointer"
                                >
                                  <option value="all">Todas las rarezas</option>
                                  {availableRarities.map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {/* Sort */}
                              <select
                                value={tcgSortBy}
                                onChange={(e) => setTcgSortBy(e.target.value as any)}
                                className="w-full min-w-0 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-2 focus:outline-none focus:border-rose-500 cursor-pointer"
                              >
                                <option value="default">Orden por defecto</option>
                                <option value="price_desc">Mayor valor ($$$)</option>
                                <option value="price_asc">Menor valor</option>
                                <option value="name_asc">Nombre (A-Z)</option>
                              </select>
                            </div>
                          </div>

                          {/* Collection / Binder Quick Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-850/80 text-xs">
                            <button
                              type="button"
                              onClick={() => setTcgViewOnlyCollection(!tcgViewOnlyCollection)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                                tcgViewOnlyCollection
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              <span>💼</span>
                              <span>Ver solo en mi álbum</span>
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-amber-300 font-mono">
                                {userCollection.length}
                              </span>
                            </button>

                            {userCollection.length > 0 && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <span>Valor de tu colección:</span>
                                <strong className="text-emerald-400 font-mono font-bold">
                                  ${totalCollectionValue.toFixed(2)} USD
                                </strong>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Results info */}
                        <div className="flex justify-between items-center text-xs text-slate-400 px-1">
                          <span>
                            Mostrando <strong className="text-white">{filteredTcgCards.length}</strong> de {tcgCards.length} cartas
                            {tcgViewOnlyCollection && (
                              <span className="text-amber-400 font-semibold ml-1.5">(en tu álbum)</span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                            Toca una carta para inspeccionar ataques, efecto 3D y guardarla en tu álbum ✨
                          </span>
                        </div>

                        {/* Cards Grid */}
                        {filteredTcgCards.length === 0 ? (
                          <div className="text-center py-8 bg-slate-950/30 border border-slate-850 rounded-2xl space-y-1">
                            <p className="text-xs text-slate-400">
                              {tcgViewOnlyCollection
                                ? 'Aún no has añadido cartas de este Pokémon a tu álbum.'
                                : 'No hay cartas que coincidan con los filtros aplicados.'}
                            </p>
                            {tcgViewOnlyCollection && (
                              <p className="text-[11px] text-slate-500">
                                Haz clic en cualquier carta e interactúa con el botón "Añadir a mi Álbum" para guardarla.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                            {filteredTcgCards.map((card) => {
                              const isInCollection = userCollection.some((c) => c.id === card.id);
                              return (
                              <div
                                key={card.id}
                                className={`group relative flex flex-col items-center bg-slate-950/40 border rounded-2xl p-2.5 transition-all hover:scale-[1.03] hover:shadow-lg cursor-pointer text-left overflow-hidden ${
                                  isInCollection
                                    ? 'border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                                    : 'border-slate-850 hover:border-rose-500/40 hover:shadow-rose-500/10'
                                }`}
                                onClick={() => handleCardClick(card)}
                              >
                                {/* Quick Album Badge/Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCardCollection(card);
                                  }}
                                  title={isInCollection ? 'Quitar de mi álbum' : 'Añadir a mi álbum'}
                                  className={`absolute top-2 right-2 z-10 p-1.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                                    isInCollection
                                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                                  }`}
                                >
                                  <svg className="w-3.5 h-3.5" fill={isInCollection ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                  </svg>
                                </button>

                                <div className="w-full aspect-[2.5/3.5] rounded-xl overflow-hidden bg-slate-900/60 mb-2 relative">
                                  <img
                                    src={`${card.image}/low.webp`}
                                    alt={card.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                </div>
                                <div className="w-full flex items-center justify-between gap-1 mb-0.5">
                                  <p className="text-xs font-bold text-slate-200 truncate group-hover:text-rose-400 transition-colors">
                                    {card.name}
                                  </p>
                                  {card.price !== undefined && card.price > 0 && (
                                    <span className="text-[10px] font-extrabold text-emerald-400 font-mono">
                                      ${card.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                <div className="w-full flex items-center justify-between text-[10px] text-slate-500">
                                  <span className="font-mono">#{card.localId}</span>
                                  {card.rarity && (
                                    <span className="truncate max-w-[90px] text-[9px] text-slate-400">
                                      {card.rarity}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )})}
                          </div>
                        )}
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
                      : 'Escribe el nombre de tu Pokémon favorito, presiona "Azar" o selecciona un favorito.'}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
        )}
      </div>

      <CardInspectorModal
        selectedCard={selectedCard}
        cardModalLoading={cardModalLoading}
        userCollection={userCollection}
        onClose={() => {
          setSelectedCard(null);
          setCardModalLoading(false);
        }}
        onToggleCollection={toggleCardCollection}
      />

      {/* Install / Home Screen Shortcut Guide Modal */}
      {showInstallModal && (
        <div
          onClick={() => setShowInstallModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              aria-label="Cerrar guía"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}icon-192.png`}
                alt="PokéSearch App Icon"
                className="w-12 h-12 rounded-2xl border border-slate-700 shadow-lg"
              />
              <div>
                <h3 className="text-base font-black text-white">Crear acceso directo</h3>
                <p className="text-xs text-slate-400">Usa PokéSearch como app en tu pantalla de inicio</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-1.5">
                <p className="font-bold text-rose-400">🤖 Android (Chrome / Edge)</p>
                <p className="text-slate-400 leading-relaxed">
                  1. Toca el botón de menú <strong className="text-white">⋮</strong> arriba a la derecha.<br />
                  2. Elige <strong className="text-white">"Instalar aplicación"</strong> o <strong className="text-white">"Agregar a la pantalla principal"</strong>.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-1.5">
                <p className="font-bold text-sky-400">🍎 iPhone / iPad (Safari)</p>
                <p className="text-slate-400 leading-relaxed">
                  1. Toca el botón <strong className="text-white">Compartir</strong> (cuadro con flecha hacia arriba) en la barra inferior.<br />
                  2. Desliza y selecciona <strong className="text-white">"Agregar a inicio"</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-xs z-50 pointer-events-none flex justify-center sm:justify-end animate-fade-in">
          <div className="bg-slate-900/95 border border-slate-700/80 text-slate-100 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Volver arriba"
          className="fixed bottom-20 md:bottom-6 right-4 z-30 p-3 rounded-2xl bg-slate-900/90 hover:bg-rose-500 text-slate-300 hover:text-white border border-slate-700/80 hover:border-rose-400 shadow-xl backdrop-blur-xl transition-all cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 border-t border-slate-800/90 backdrop-blur-xl px-1.5 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => {
              setViewMode('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'detail'
                ? 'bg-rose-500/20 text-rose-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base leading-none mb-0.5">🔍</span>
            <span>Ficha</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('grid');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-rose-500/20 text-rose-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base leading-none mb-0.5">🗂️</span>
            <span>Catálogo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('tcg_explorer');
              if (tcgExplorerCards.length === 0 && !tcgExplorerQuery) {
                executeTcgExplorerSearch('Pikachu');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'tcg_explorer'
                ? 'bg-rose-500/20 text-rose-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="2" />
              <path strokeLinecap="round" strokeWidth="2" d="M9 8h6M9 12h6M9 16h3" />
            </svg>
            <span>TCG</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('album');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'album'
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <span className="text-base leading-none mb-0.5">💼</span>
            <span>Álbum</span>
            {userCollection.length > 0 && (
              <span className="absolute top-1 right-2 px-1 min-w-[14px] h-3.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-mono font-black flex items-center justify-center">
                {userCollection.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('minigame');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'minigame'
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-slate-400 hover:text-indigo-300'
            }`}
          >
            <span className="text-base leading-none mb-0.5">🎮</span>
            <span>Juego</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
