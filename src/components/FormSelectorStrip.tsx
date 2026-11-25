import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

export interface FormSelectorItem {
  key: string;
  label: string;
  sprite: string;
}

interface FormSelectorStripProps {
  title: string;
  icon: string;
  accent?: 'rose' | 'sky';
  items: FormSelectorItem[];
  activeIndex: number;
  fallbackSprite?: string;
  onSelect: (index: number) => void;
}

/**
 * Displays Pokémon cosmetic motifs or alternate form varieties.
 * Renders inline wrapped pills when <= 4 items, or a compact 1-row bar with
 * prev/next cycling and a centered grid modal when > 4 items.
 */
export const FormSelectorStrip = ({
  title,
  icon,
  accent = 'rose',
  items,
  activeIndex,
  fallbackSprite,
  onSelect,
}: FormSelectorStripProps) => {
  const [showModal, setShowModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (!showModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showModal]);

  const safeIndex = activeIndex >= 0 && activeIndex < items.length ? activeIndex : 0;
  const activeItem = items[safeIndex];

  const filteredItems = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return items.map((item, index) => ({ ...item, index }));
    return items
      .map((item, index) => ({ ...item, index }))
      .filter((item) => item.label.toLowerCase().includes(q));
  }, [items, filterQuery]);

  const accentText = accent === 'sky' ? 'text-sky-400' : 'text-rose-400';
  const accentActiveBtn =
    accent === 'sky'
      ? 'bg-sky-500/25 text-white border-sky-500/50 shadow-md shadow-sky-500/10'
      : 'bg-rose-500/25 text-white border-rose-500/50 shadow-md shadow-rose-500/10';
  const accentPillBtn =
    accent === 'sky'
      ? 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/30'
      : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30';

  if (items.length <= 1) return null;

  const handleCycle = (delta: number) => {
    const next = (safeIndex + delta + items.length) % items.length;
    onSelect(next);
  };

  const handleSpriteError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (fallbackSprite && target.src !== fallbackSprite && !target.dataset.fallbackApplied) {
      target.dataset.fallbackApplied = '1';
      target.src = fallbackSprite;
    } else {
      target.style.display = 'none';
    }
  };

  return (
    <div className="space-y-2 p-3 sm:p-3.5 bg-slate-950/40 border border-slate-850 rounded-3xl animate-fade-in">
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <span>{icon}</span>
          <span>
            {title} ({items.length})
          </span>
        </span>
        <span className={`text-[11px] font-bold truncate ${accentText}`}>
          {activeItem?.label || ''}
        </span>
      </div>

      {items.length <= 4 ? (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {items.map((item, idx) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                safeIndex === idx
                  ? accentActiveBtn
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {item.sprite && (
                <img
                  src={item.sprite}
                  alt={item.label}
                  onError={handleSpriteError}
                  className="w-7 h-7 object-contain drop-shadow-sm"
                  loading="lazy"
                />
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* Quick Prev / Active Preview / Next */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => handleCycle(-1)}
              aria-label="Forma anterior"
              className="w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center cursor-pointer transition-colors shrink-0 active:scale-95"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterQuery('');
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-2.5 py-1 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 min-w-0 flex-1 cursor-pointer transition-all text-left"
            >
              {activeItem?.sprite && (
                <img
                  key={activeItem.key}
                  src={activeItem.sprite}
                  alt={activeItem.label}
                  onError={handleSpriteError}
                  className="w-7 h-7 object-contain drop-shadow-sm shrink-0"
                />
              )}
              <span className="text-xs font-semibold text-slate-200 truncate">
                {activeItem?.label}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleCycle(1)}
              aria-label="Siguiente forma"
              className="w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center cursor-pointer transition-colors shrink-0 active:scale-95"
            >
              ›
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setFilterQuery('');
              setShowModal(true);
            }}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all active:scale-95 shrink-0 ${accentPillBtn}`}
          >
            Ver todas ▾
          </button>
        </div>
      )}

      {showModal &&
        createPortal(
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3.5 relative"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="truncate">{title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono shrink-0">
                      {items.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecciona una forma para ver su sprite y datos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  aria-label="Cerrar selector de formas"
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-full transition-colors cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {items.length > 12 && (
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filtrar forma o motivo..."
                    className="w-full pl-10 pr-9 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500"
                  />
                  {filterQuery && (
                    <button
                      type="button"
                      onClick={() => setFilterQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              <div className="flex-1 min-h-0 max-h-[58vh] overflow-y-auto pr-1 scrollbar-thin grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-xs text-slate-400">
                    No hay formas que coincidan con "{filterQuery}".
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = safeIndex === item.index;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          onSelect(item.index);
                          setShowModal(false);
                        }}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? accentActiveBtn
                            : 'bg-slate-950/60 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        {item.sprite && (
                          <img
                            src={item.sprite}
                            alt={item.label}
                            onError={handleSpriteError}
                            className="w-12 h-12 object-contain drop-shadow-sm"
                            loading="lazy"
                          />
                        )}
                        <span className="text-[11px] font-bold leading-tight line-clamp-2">
                          {item.label}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
