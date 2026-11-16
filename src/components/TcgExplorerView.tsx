import { getSetIconUrl } from '../constants/pokemon';
import type { TcgCardBrief, TcgSetBrief, UserCollectionItem } from '../types/pokemon';

interface TcgExplorerViewProps {
  tcgExplorerQuery: string;
  setTcgExplorerQuery: (q: string) => void;
  tcgExplorerCards: TcgCardBrief[];
  sortedTcgExplorerCards: TcgCardBrief[];
  tcgExplorerLoading: boolean;
  tcgExplorerSets: TcgSetBrief[];
  selectedSetId: string | null;
  tcgExplorerSortBy: 'default' | 'price_desc' | 'price_asc' | 'name_asc';
  setTcgExplorerSortBy: (sort: 'default' | 'price_desc' | 'price_asc' | 'name_asc') => void;
  tcgExplorerDisplayCount: number;
  setTcgExplorerDisplayCount: React.Dispatch<React.SetStateAction<number>>;
  userCollection: UserCollectionItem[];
  onExecuteSearch: (searchTerm?: string) => void;
  onLoadSetCards: (setId: string) => void;
  onCardClick: (card: TcgCardBrief) => void;
  onToggleCollection: (card: {
    id: string;
    name: string;
    localId: string;
    image?: string;
    rarity?: string;
    price?: number;
  }) => void;
}

export const TcgExplorerView = ({
  tcgExplorerQuery,
  setTcgExplorerQuery,
  tcgExplorerCards,
  sortedTcgExplorerCards,
  tcgExplorerLoading,
  tcgExplorerSets,
  selectedSetId,
  tcgExplorerSortBy,
  setTcgExplorerSortBy,
  tcgExplorerDisplayCount,
  setTcgExplorerDisplayCount,
  userCollection,
  onExecuteSearch,
  onLoadSetCards,
  onCardClick,
  onToggleCollection,
}: TcgExplorerViewProps) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 animate-scale-up">
      {/* Explorer Header & Search Banner */}
      <div className="bg-gradient-to-r from-rose-500/15 via-slate-900 to-amber-500/15 border border-rose-500/30 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/10">
            🃏
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>Explorador Global de Cartas TCG</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                TCGdex API
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Busca libremente cualquier carta (Pokémon, Entrenadores, Objetos, Energías) o navega por expansiones oficiales completas.
            </p>
          </div>
        </div>

        {/* Quick Popular Searches */}
        <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-end">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">Populares:</span>
          {['Charizard', 'Pikachu', 'Mewtwo', 'Gengar', 'Profesor', 'Ultra Ball', 'Iono'].map((quickTerm) => (
            <button
              key={quickTerm}
              type="button"
              onClick={() => {
                setTcgExplorerQuery(quickTerm);
                onExecuteSearch(quickTerm);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 text-slate-300 border border-slate-700 font-medium transition-all cursor-pointer"
            >
              {quickTerm}
            </button>
          ))}
        </div>
      </div>

      {/* Global Search Input Bar */}
      <div className="bg-slate-950/50 border border-slate-800/80 p-3 sm:p-4 rounded-2xl space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onExecuteSearch();
          }}
          className="flex flex-col sm:flex-row items-center gap-2.5"
        >
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={tcgExplorerQuery}
              onChange={(e) => setTcgExplorerQuery(e.target.value)}
              placeholder="Escribe el nombre de cualquier carta, entrenador u objeto (ej. Ultra Ball, Charizard, Miriam)..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
            />
            {tcgExplorerQuery && (
              <button
                type="button"
                onClick={() => setTcgExplorerQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={tcgExplorerLoading || !tcgExplorerQuery.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Buscar Cartas</span>
          </button>
        </form>

        {/* Expansions / Sets Horizontal Carousel */}
        {tcgExplorerSets.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>📦</span> Expansiones y Sets Oficiales ({tcgExplorerSets.length})
              </span>
              <span className="text-[11px] text-slate-500 italic">Desliza para ver más</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {tcgExplorerSets.map((set) => {
                const isSelected = selectedSetId === set.id;
                const iconUrl = getSetIconUrl(set);
                return (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => onLoadSetCards(set.id)}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500/60 text-white shadow-md shadow-rose-500/10'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-950/70 border border-slate-800 p-0.5 relative overflow-hidden">
                      {iconUrl ? (
                        <>
                          <img
                            src={iconUrl}
                            alt={set.name}
                            loading="lazy"
                            className="max-w-full max-h-full object-contain filter drop-shadow group-hover:scale-110 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (set.symbol && target.src.includes('/en/')) {
                                target.src = set.symbol + '.png';
                              } else if (set.logo && !target.src.includes('logo')) {
                                target.src = `${set.logo}.png`;
                              } else {
                                target.style.display = 'none';
                                const fb = target.parentElement?.querySelector('.set-fallback-icon') as HTMLElement;
                                if (fb) fb.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="set-fallback-icon hidden w-full h-full items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <circle cx="12" cy="12" r="9" strokeWidth="2" />
                              <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
                              <circle cx="12" cy="12" r="3" fill="currentColor" strokeWidth="1.5" />
                              <circle cx="12" cy="12" r="1.2" fill="#0f172a" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="9" strokeWidth="2" />
                          <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" fill="currentColor" strokeWidth="1.5" />
                          <circle cx="12" cy="12" r="1.2" fill="#0f172a" />
                        </svg>
                      )}
                    </div>

                    <div className="max-w-[130px] truncate">
                      <p className="text-xs font-bold truncate leading-tight">{set.name}</p>
                      {set.cardCount?.total && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          {set.cardCount.total} cartas
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results Header with Count & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium">
            {selectedSetId
              ? `Set: ${tcgExplorerSets.find((s) => s.id === selectedSetId)?.name || selectedSetId}`
              : tcgExplorerQuery
              ? `Resultados para "${tcgExplorerQuery}"`
              : 'Cartas encontradas'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold">
            {tcgExplorerCards.length}
          </span>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ordenar por:</span>
          <select
            value={tcgExplorerSortBy}
            onChange={(e) => setTcgExplorerSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
            <option value="default">Por Defecto / Relevancia</option>
            <option value="price_desc">Mayor Precio ($)</option>
            <option value="price_asc">Menor Precio ($)</option>
            <option value="name_asc">Nombre (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Loading Spinner */}
      {tcgExplorerLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium animate-pulse">
            Buscando cartas y consultando precios de mercado...
          </p>
        </div>
      ) : sortedTcgExplorerCards.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="text-4xl">🃏</div>
          <h4 className="text-sm font-bold text-slate-300">
            {selectedSetId
              ? 'No se encontraron cartas en este Set'
              : tcgExplorerQuery
              ? 'No se encontraron cartas'
              : 'Inicia una búsqueda o elige un Set'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {selectedSetId
              ? `No hay cartas registradas para el set "${tcgExplorerSets.find((s) => s.id === selectedSetId)?.name || selectedSetId}". Prueba seleccionando otra expansión.`
              : tcgExplorerQuery
              ? `No encontramos cartas con "${tcgExplorerQuery}". Intenta con otro nombre en español o inglés.`
              : 'Escribe un término en el buscador o selecciona cualquiera de las expansiones oficiales de arriba.'}
          </p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {sortedTcgExplorerCards.slice(0, tcgExplorerDisplayCount).map((card) => {
              const isInCollection = userCollection.some((c) => c.id === card.id);
              return (
                <div
                  key={card.id}
                  className="group relative bg-slate-950/60 rounded-2xl p-2 border border-slate-800/80 hover:border-rose-500/40 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-1"
                >
                  {/* Card Image with Inspector Click */}
                  <div
                    onClick={() => onCardClick(card)}
                    className="relative aspect-[2.5/3.5] rounded-xl overflow-hidden cursor-pointer bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-750 p-2.5 flex flex-col justify-between items-center text-center select-none"
                  >
                    {/* Fallback Graphic */}
                    <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span className="text-amber-400">✨ TCG</span>
                      <span className="font-mono bg-slate-800/90 px-1 rounded text-[9px] text-slate-300">#{card.localId}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center my-auto space-y-1.5 px-1">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-lg shadow-inner">
                        🃏
                      </div>
                      <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {card.name}
                      </p>
                      <span className="text-[9px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/70 border border-slate-700/50">
                        Scan pendiente
                      </span>
                    </div>

                    <div className="w-full text-[9px] text-rose-300 font-semibold bg-rose-500/10 py-0.5 rounded border border-rose-500/20">
                      Ver datos
                    </div>

                    {/* Card Image Overlay if URL is present */}
                    {card.image && (
                      <img
                        src={`${card.image}/low.webp`}
                        alt={card.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 z-10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.endsWith('.png')) {
                            target.src = `${card.image}/low.png`;
                          } else {
                            target.style.display = 'none';
                          }
                        }}
                      />
                    )}

                    {/* Hover Overlay Hint */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
                      <span className="bg-rose-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm shadow-md flex items-center gap-1">
                        <span>✨</span> Inspeccionar
                      </span>
                    </div>

                    {/* Price Tag Pill */}
                    {card.price !== undefined && card.price > 0 && (
                      <div className="absolute bottom-1.5 right-1.5 bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded-md font-mono shadow-sm z-20">
                        ${card.price.toFixed(2)}
                      </div>
                    )}

                    {/* Set/Local ID Pill */}
                    {card.image && (
                      <div className="absolute top-1.5 left-1.5 bg-slate-950/80 backdrop-blur-sm text-slate-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-800 z-20">
                        #{card.localId}
                      </div>
                    )}
                  </div>

                  {/* Card Info & Quick Album Add */}
                  <div className="pt-2 space-y-1.5 flex flex-col justify-between flex-1">
                    <div>
                      <p className="text-xs font-bold text-slate-200 truncate" title={card.name}>
                        {card.name}
                      </p>
                      {card.rarity && (
                        <p className="text-[10px] text-slate-400 truncate" title={card.rarity}>
                          {card.rarity}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCollection(card);
                      }}
                      className={`w-full py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                        isInCollection
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                          : 'bg-slate-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border-slate-800 hover:border-rose-500/40'
                      }`}
                    >
                      <span>{isInCollection ? '✓' : '+'}</span>
                      <span>{isInCollection ? 'En mi Álbum' : 'Coleccionar'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {tcgExplorerDisplayCount < sortedTcgExplorerCards.length && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setTcgExplorerDisplayCount((prev) => prev + 36)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-bold rounded-2xl border border-slate-700 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                Cargar más cartas (+36) ({sortedTcgExplorerCards.length - tcgExplorerDisplayCount} restantes)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
