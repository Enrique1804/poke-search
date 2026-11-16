import type {
  EvolutionNode,
  GenerationInfo,
  TcgSetBrief,
  TypeMatchups,
} from '../types/pokemon';

export const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
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
  dark: { bg: 'bg-stone-700/20', text: 'text-stone-300', border: 'border-stone-600/30', glow: 'shadow-stone-600/20' },
  fairy: { bg: 'bg-rose-400/20', text: 'text-rose-300', border: 'border-rose-400/30', glow: 'shadow-rose-400/25' },
};

export const TYPE_HEX_COLORS: Record<string, string> = {
  normal: '#94a3b8',
  fire: '#f43f5e',
  water: '#0ea5e9',
  grass: '#10b981',
  electric: '#f59e0b',
  ice: '#06b6d4',
  fighting: '#ef4444',
  poison: '#d946ef',
  ground: '#d97706',
  flying: '#818cf8',
  psychic: '#ec4899',
  bug: '#84cc16',
  rock: '#a8a29e',
  ghost: '#8b5cf6',
  dragon: '#7c3aed',
  steel: '#71717a',
  dark: '#57534e',
  fairy: '#f472b6',
};

export const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  grass: 'Planta',
  electric: 'Eléctrico',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  steel: 'Acero',
  dark: 'Siniestro',
  fairy: 'Hada',
};

export const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'steel', 'dark', 'fairy',
];

export const GENERATIONS: GenerationInfo[] = [
  { id: 1, name: 'Gen 1', region: 'Kanto', startId: 1, endId: 151 },
  { id: 2, name: 'Gen 2', region: 'Johto', startId: 152, endId: 251 },
  { id: 3, name: 'Gen 3', region: 'Hoenn', startId: 252, endId: 386 },
  { id: 4, name: 'Gen 4', region: 'Sinnoh', startId: 387, endId: 493 },
  { id: 5, name: 'Gen 5', region: 'Teselia', startId: 494, endId: 649 },
  { id: 6, name: 'Gen 6', region: 'Kalos', startId: 650, endId: 721 },
  { id: 7, name: 'Gen 7', region: 'Alola', startId: 722, endId: 809 },
  { id: 8, name: 'Gen 8', region: 'Galar', startId: 810, endId: 905 },
  { id: 9, name: 'Gen 9', region: 'Paldea', startId: 906, endId: 1025 },
];

export const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export const calculateTypeMatchups = (defendingTypes: string[]): TypeMatchups => {
  const result: TypeMatchups = {
    quadWeak: [],
    doubleWeak: [],
    halfResist: [],
    quadResist: [],
    immune: [],
  };

  if (!defendingTypes || defendingTypes.length === 0) return result;

  ALL_TYPES.forEach((attacker) => {
    let multiplier = 1;
    defendingTypes.forEach((defender) => {
      const defFactor = TYPE_CHART[attacker]?.[defender] !== undefined ? TYPE_CHART[attacker][defender] : 1;
      multiplier *= defFactor;
    });

    if (multiplier === 0) result.immune.push(attacker);
    else if (multiplier >= 4) result.quadWeak.push(attacker);
    else if (multiplier >= 2) result.doubleWeak.push(attacker);
    else if (multiplier <= 0.25) result.quadResist.push(attacker);
    else if (multiplier <= 0.5) result.halfResist.push(attacker);
  });

  return result;
};

export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad',
};

export const STAT_COLORS: Record<string, string> = {
  hp: 'bg-rose-500 shadow-rose-500/20',
  attack: 'bg-amber-500 shadow-amber-500/20',
  defense: 'bg-blue-500 shadow-blue-500/20',
  'special-attack': 'bg-fuchsia-500 shadow-fuchsia-500/20',
  'special-defense': 'bg-emerald-500 shadow-emerald-500/20',
  speed: 'bg-sky-500 shadow-sky-500/20',
};

export const formatMegaName = (fullName: string, baseName: string) => {
  const suffix = fullName.replace(baseName, '').replace(/^-+|-+$/g, '');
  if (suffix === 'mega') return 'Mega';
  if (suffix === 'mega-x') return 'Mega X';
  if (suffix === 'mega-y') return 'Mega Y';
  if (suffix === 'mega-z') return 'Mega Z';
  if (suffix === 'gmax') return 'G-Max';
  if (suffix === 'primal') return 'Primal';

  return suffix
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatPokemonTitleName = (fullName: string, speciesName: string) => {
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

  if (cleanSpecies === 'minior') {
    if (suffix.includes('meteor')) {
      if (suffix.includes('red')) return `${titleSpecies} (Meteorito Rojo)`;
      if (suffix.includes('orange')) return `${titleSpecies} (Meteorito Naranja)`;
      if (suffix.includes('yellow')) return `${titleSpecies} (Meteorito Amarillo)`;
      if (suffix.includes('green')) return `${titleSpecies} (Meteorito Verde)`;
      if (suffix.includes('blue')) return `${titleSpecies} (Meteorito Azul)`;
      if (suffix.includes('indigo')) return `${titleSpecies} (Meteorito Añil)`;
      if (suffix.includes('violet')) return `${titleSpecies} (Meteorito Violeta)`;
      return `${titleSpecies} (Forma Meteorito)`;
    }
    if (suffix === 'red') return `${titleSpecies} (Núcleo Rojo)`;
    if (suffix === 'orange') return `${titleSpecies} (Núcleo Naranja)`;
    if (suffix === 'yellow') return `${titleSpecies} (Núcleo Amarillo)`;
    if (suffix === 'green') return `${titleSpecies} (Núcleo Verde)`;
    if (suffix === 'blue') return `${titleSpecies} (Núcleo Azul)`;
    if (suffix === 'indigo') return `${titleSpecies} (Núcleo Añil)`;
    if (suffix === 'violet') return `${titleSpecies} (Núcleo Violeta)`;
  }

  const suffixFormatted = suffix
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `${titleSpecies} ${suffixFormatted}`;
};

export const getEvolutionCondition = (details: any[], targetName?: string) => {
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

export const parseEvolutionTree = (chainNode: any, stage = 1): EvolutionNode => {
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

export const getRegionalButtonLabel = (name: string, isActive: boolean) => {
  if (isActive) return '↩️ Normal';
  if (name.includes('alola')) return '🌴 Alola';
  if (name.includes('galar')) return '⚔️ Galar';
  if (name.includes('hisui')) return '🏯 Hisui';
  if (name.includes('paldea')) return '💎 Paldea';
  return '🌍 Regional';
};

export const getRegionalButtonStyle = (name: string, isActive: boolean) => {
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

export const getFormButtonLabel = (name: string, baseName: string, isActive: boolean) => {
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

  if (baseName.toLowerCase() === 'minior') {
    if (suffix.includes('meteor')) {
      if (suffix.includes('red')) return '☄️ Meteorito Rojo';
      if (suffix.includes('orange')) return '☄️ Meteorito Naranja';
      if (suffix.includes('yellow')) return '☄️ Meteorito Amarillo';
      if (suffix.includes('green')) return '☄️ Meteorito Verde';
      if (suffix.includes('blue')) return '☄️ Meteorito Azul';
      if (suffix.includes('indigo')) return '☄️ Meteorito Añil';
      if (suffix.includes('violet')) return '☄️ Meteorito Violeta';
      return '☄️ Forma Meteorito';
    }
    if (suffix === 'red') return '🔴 Núcleo Rojo';
    if (suffix === 'orange') return '🟠 Núcleo Naranja';
    if (suffix === 'yellow') return '🟡 Núcleo Amarillo';
    if (suffix === 'green') return '🟢 Núcleo Verde';
    if (suffix === 'blue') return '🔵 Núcleo Azul';
    if (suffix === 'indigo') return '🟣 Núcleo Añil';
    if (suffix === 'violet') return '🟪 Núcleo Violeta';
  }

  return `🔄 ${suffix.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
};

export const getSetIconUrl = (set: TcgSetBrief): string | null => {
  if (set.symbol) {
    // TCGdex stores most symbols under /en/ instead of /univ/
    return set.symbol.replace('/univ/', '/en/') + '.png';
  }
  if (set.logo) {
    return `${set.logo}.png`;
  }
  return null;
};
