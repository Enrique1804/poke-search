import type { TcgCardBrief, UserCollectionItem } from '../types/pokemon';

interface TcgAlbumViewProps {
  userCollection: UserCollectionItem[];
  filteredUserCollection: UserCollectionItem[];
  totalCollectionValue: number;
  albumSearchQuery: string;
  setAlbumSearchQuery: (q: string) => void;
  albumSortBy: 'date_desc' | 'price_desc' | 'price_asc' | 'name_asc';
  setAlbumSortBy: (sort: 'date_desc' | 'price_desc' | 'price_asc' | 'name_asc') => void;
  onCardClick: (card: TcgCardBrief) => void;
  onToggleCollection: (card: {
    id: string;
    name: string;
    localId: string;
    image?: string;
    rarity?: string;
    price?: number;
  }) => void;
  onExploreGrid: () => void;
}

export const TcgAlbumView = ({
  userCollection,
  filteredUserCollection,
  totalCollectionValue,
  albumSearchQuery,
  setAlbumSearchQuery,
  albumSortBy,
  setAlbumSortBy,
  onCardClick,
  onToggleCollection,
  onExploreGrid,
}: TcgAlbumViewProps) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 animate-scale-up">
      {/* Album Header & Stats Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-emerald-500/15 border border-amber-500/30 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/10">
            💼
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>Mi Álbum de Cartas TCG</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {userCollection.length} {userCollection.length === 1 ? 'carta' : 'cartas'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tu carpeta personal de cartas coleccionadas guardadas en este navegador.
            </p>
          </div>
        </div>

        {/* Total Portfolio Value */}
        <div className="bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-2xl text-center sm:text-right w-full sm:w-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Valor Estimado de Colección
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            ${totalCollectionValue.toFixed(2)} <span className="text-xs text-emerald-500">USD</span>
          </span>
        </div>
      </div>

      {/* Album Controls: Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-950/40 p-3 rounded-2xl border border-slate-850">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={albumSearchQuery}
            onChange={(e) => setAlbumSearchQuery(e.target.value)}
            placeholder="Buscar en tu álbum por nombre o rareza..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
          />
          {albumSearchQuery && (
            <button
              type="button"
              onClick={() => setAlbumSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Ordenar por:</span>
          <select
            value={albumSortBy}
            onChange={(e) => setAlbumSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="date_desc">Añadidas recientemente</option>
            <option value="price_desc">Mayor valor ($$$)</option>
            <option value="price_asc">Menor valor</option>
            <option value="name_asc">Nombre (A → Z)</option>
          </select>
        </div>
      </div>

      {/* Empty Album State */}
      {userCollection.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-slate-950/30 border border-slate-850 rounded-3xl">
          <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-3xl">
            🃏
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-200">Tu álbum aún está vacío</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Busca a tus Pokémon favoritos, ve a la pestaña <strong>Cartas TCG</strong> y toca el botón{' '}
              <strong>"Añadir al Álbum"</strong> para empezar a armar tu colección.
            </p>
          </div>
          <button
            type="button"
            onClick={onExploreGrid}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-500/20 active:scale-95 inline-flex items-center gap-2"
          >
            <span>🗂️</span>
            <span>Explorar Catálogo Pokédex</span>
          </button>
        </div>
      ) : filteredUserCollection.length === 0 ? (
        <div className="text-center py-12 space-y-2 bg-slate-950/30 border border-slate-850 rounded-2xl">
          <p className="text-xs text-slate-400">No hay cartas en tu álbum que coincidan con tu búsqueda.</p>
          <button
            type="button"
            onClick={() => setAlbumSearchQuery('')}
            className="text-xs text-amber-400 hover:underline cursor-pointer font-bold"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        /* Album Cards Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredUserCollection.map((card) => (
            <div
              key={card.id}
              onClick={() => onCardClick(card)}
              className="group relative flex flex-col items-center bg-slate-950/60 border border-amber-500/30 hover:border-amber-400/80 rounded-2xl p-2.5 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer text-left overflow-hidden ring-1 ring-amber-500/20"
            >
              {/* Remove from Album Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollection(card);
                }}
                title="Quitar de mi álbum"
                className="absolute top-2 right-2 z-20 p-1.5 rounded-xl bg-amber-500 text-slate-950 border border-amber-400 shadow-md hover:bg-red-500 hover:text-white hover:border-red-400 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>

              {/* Card Image or Fallback */}
              <div className="w-full aspect-[2.5/3.5] rounded-xl overflow-hidden bg-slate-900/60 mb-2 relative flex items-center justify-center">
                {card.image ? (
                  <img
                    src={`${card.image}/low.webp`}
                    alt={card.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.endsWith('.png')) {
                        target.src = `${card.image}/low.png`;
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <div className="text-center p-2 space-y-1">
                    <span className="text-2xl">🃏</span>
                    <p className="text-[10px] font-bold text-slate-300 line-clamp-2">{card.name}</p>
                  </div>
                )}
              </div>

              {/* Name & Price */}
              <div className="w-full flex items-center justify-between gap-1 mb-0.5">
                <p className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-300 transition-colors">
                  {card.name}
                </p>
                {card.price !== undefined && card.price > 0 && (
                  <span className="text-[10px] font-extrabold text-emerald-400 font-mono">
                    ${card.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* ID & Rarity */}
              <div className="w-full flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-mono text-slate-400">#{card.localId}</span>
                {card.rarity && (
                  <span className="truncate max-w-[85px] text-[9px] text-amber-400/80 font-semibold">
                    {card.rarity}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
