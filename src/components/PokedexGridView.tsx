import { useState } from 'react';
import {
  ALL_TYPES,
  GENERATIONS,
  TYPE_COLORS,
  TYPE_TRANSLATIONS,
} from '../constants/pokemon';
import type { QuickPokemon } from '../types/pokemon';

interface PokedexGridViewProps {
  filteredGridPokemon: QuickPokemon[];
  pokemonTypesMap: Record<number, string[]>;
  favorites: QuickPokemon[];
  gridSearchQuery: string;
  setGridSearchQuery: (q: string) => void;
  gridSortBy: 'id_asc' | 'id_desc' | 'name_asc' | 'name_desc';
  setGridSortBy: (sort: 'id_asc' | 'id_desc' | 'name_asc' | 'name_desc') => void;
  selectedGen: number | null;
  setSelectedGen: (gen: number | null) => void;
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
  showFullPokedex: boolean;
  setShowFullPokedex: (show: boolean) => void;
  gridDisplayCount: number;
  setGridDisplayCount: React.Dispatch<React.SetStateAction<number>>;
  onSelectPokemon: (name: string) => void;
  onToggleFavorite: (p: QuickPokemon) => void;
}

export const PokedexGridView = ({
  filteredGridPokemon,
  pokemonTypesMap,
  favorites,
  gridSearchQuery,
  setGridSearchQuery,
  gridSortBy,
  setGridSortBy,
  selectedGen,
  setSelectedGen,
  selectedType,
  setSelectedType,
  showFullPokedex,
  setShowFullPokedex,
  gridDisplayCount,
  setGridDisplayCount,
  onSelectPokemon,
  onToggleFavorite,
}: PokedexGridViewProps) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const activeFilterCount = (selectedGen !== null ? 1 : 0) + (selectedType !== null ? 1 : 0);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 animate-scale-up">
      {/* Filter Bar Controls */}
      <div className="space-y-4 bg-slate-950/40 border border-slate-850 p-3.5 sm:p-4 rounded-2xl">
        {/* Search input inside Grid + Sort dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={gridSearchQuery}
              onChange={(e) => setGridSearchQuery(e.target.value)}
              placeholder="Filtrar por nombre o #ID en el catálogo..."
              className="w-full pl-10 pr-8 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-base sm:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
            />
            {gridSearchQuery && (
              <button
                type="button"
                onClick={() => setGridSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort selector + Mobile Filters Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowMobileFilters((v) => !v)}
              className={`md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showMobileFilters || activeFilterCount > 0
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              <span>🎛️</span>
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                  {activeFilterCount}
                </span>
              )}
              <span className="text-[10px] opacity-75">{showMobileFilters ? '▴' : '▾'}</span>
            </button>

            <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
              <span className="hidden sm:inline text-xs text-slate-400 font-semibold whitespace-nowrap">Ordenar:</span>
              <select
                value={gridSortBy}
                onChange={(e) => setGridSortBy(e.target.value as any)}
                className="w-full sm:w-auto min-w-0 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="id_asc"># Pokédex (1 → 1025)</option>
                <option value="id_desc"># Pokédex (1025 → 1)</option>
                <option value="name_asc">Nombre (A → Z)</option>
                <option value="name_desc">Nombre (Z → A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collapsible on mobile, always visible on md+ */}
        <div className={`space-y-4 ${showMobileFilters ? 'block pt-2 border-t border-slate-800/70' : 'hidden'} md:block`}>
        {/* Generations Pills (horizontal scroll) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Región / Generación:</span>
            {selectedGen !== null && (
              <button
                type="button"
                onClick={() => setSelectedGen(null)}
                className="text-rose-400 hover:text-rose-300 text-[10px] underline cursor-pointer"
              >
                Ver todas las generaciones
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedGen(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                selectedGen === null
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Todas (1-1025)
            </button>
            {GENERATIONS.map((gen) => (
              <button
                key={gen.id}
                type="button"
                onClick={() => setSelectedGen(selectedGen === gen.id ? null : gen.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 border ${
                  selectedGen === gen.id
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/10'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{gen.name}</span>
                <span className="ml-1.5 text-[10px] font-normal opacity-80">({gen.region})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Elemental Types Filter Badges */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Filtrar por Tipo:</span>
            {selectedType !== null && (
              <button
                type="button"
                onClick={() => setSelectedType(null)}
                className="text-rose-400 hover:text-rose-300 text-[10px] underline cursor-pointer"
              >
                Limpiar tipo
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedType(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedType === null
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Todos
            </button>
            {ALL_TYPES.map((tName) => {
              const color = TYPE_COLORS[tName] || {
                bg: 'bg-slate-800',
                text: 'text-slate-300',
                border: 'border-slate-700',
                glow: '',
              };
              const isSelected = selectedType === tName;
              return (
                <button
                  key={tName}
                  type="button"
                  onClick={() => setSelectedType(isSelected ? null : tName)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize border transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? `${color.bg} ${color.text} ${color.border} ring-2 ring-white/30 shadow-md scale-105`
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {TYPE_TRANSLATIONS[tName] || tName}
                </button>
              );
            })}
          </div>
        </div>
        </div>
      </div>

      {/* Results count, Quick reset info & Full Pokedex Toggle */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>
            Mostrando{' '}
            <strong className="text-white">
              {showFullPokedex
                ? filteredGridPokemon.length
                : Math.min(gridDisplayCount, filteredGridPokemon.length)}
            </strong>{' '}
            de <strong className="text-white">{filteredGridPokemon.length}</strong> Pokémon
            {(selectedGen !== null || selectedType !== null || gridSearchQuery.trim()) && (
              <span className="text-rose-400 font-semibold ml-1.5">(filtrados)</span>
            )}
          </span>

          {(selectedGen !== null || selectedType !== null || gridSearchQuery.trim()) && (
            <button
              type="button"
              onClick={() => {
                setSelectedGen(null);
                setSelectedType(null);
                setGridSearchQuery('');
              }}
              className="text-xs text-slate-400 hover:text-rose-400 underline cursor-pointer"
            >
              Restablecer
            </button>
          )}
        </div>

        {/* Full Pokedex Toggle Switch */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-slate-300">Mostrar completa (1025):</span>
          <button
            type="button"
            onClick={() => setShowFullPokedex(!showFullPokedex)}
            role="switch"
            aria-checked={showFullPokedex}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showFullPokedex ? 'bg-rose-500' : 'bg-slate-800'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                showFullPokedex ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Responsive Pokemon Grid */}
      {filteredGridPokemon.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-slate-950/30 border border-slate-850 rounded-2xl">
          <span className="text-3xl">🔍</span>
          <h4 className="text-sm font-bold text-slate-300">No se encontraron Pokémon</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prueba cambiando los filtros de tipo o generación, o ajusta tu término de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(showFullPokedex
            ? filteredGridPokemon
            : filteredGridPokemon.slice(0, gridDisplayCount)
          ).map((p) => {
            const types = pokemonTypesMap[p.id] || [];
            const primaryType = types[0] || 'normal';
            const primaryColor = TYPE_COLORS[primaryType] || {
              bg: 'bg-slate-800/40',
              text: 'text-slate-400',
              border: 'border-slate-800',
              glow: '',
            };
            const isFav = favorites.some((f) => f.id === p.id);

            return (
              <div
                key={p.id}
                onClick={() => onSelectPokemon(p.name)}
                className="group relative flex flex-col items-center bg-slate-950/50 hover:bg-slate-900 border border-slate-850 hover:border-rose-500/50 rounded-2xl p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10 cursor-pointer overflow-hidden text-center"
              >
                {/* Subtle background glow from primary type */}
                <div
                  className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-xl pointer-events-none ${primaryColor.bg.replace(
                    '/20',
                    '/80'
                  )}`}
                />

                {/* Header: ID + Favorite toggle */}
                <div className="w-full flex items-center justify-between mb-1 z-10">
                  <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-slate-400">
                    #{p.id.toString().padStart(3, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite({ name: p.name, id: p.id });
                    }}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isFav ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'
                    }`}
                    title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill={isFav ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Official Sprite */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-1 z-10">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-115"
                  />
                </div>

                {/* Name */}
                <span className="text-xs font-bold capitalize text-slate-200 group-hover:text-rose-400 transition-colors truncate w-full z-10">
                  {p.name}
                </span>

                {/* Type Badges */}
                <div className="flex gap-1 mt-1.5 z-10 flex-wrap justify-center">
                  {types.map((t) => {
                    const badge = TYPE_COLORS[t] || {
                      bg: 'bg-slate-800',
                      text: 'text-slate-400',
                      border: 'border-slate-700',
                    };
                    return (
                      <span
                        key={t}
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold capitalize border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {TYPE_TRANSLATIONS[t] || t}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button (only if not showing full pokedex) */}
      {!showFullPokedex && gridDisplayCount < filteredGridPokemon.length && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setGridDisplayCount((prev) => prev + 36)}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-bold rounded-2xl border border-slate-700 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            Cargar más Pokémon (+36)
          </button>
        </div>
      )}
    </div>
  );
};
