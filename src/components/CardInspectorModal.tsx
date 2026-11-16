import { useState } from 'react';
import type { TcgCardDetail, UserCollectionItem } from '../types/pokemon';

interface CardInspectorModalProps {
  selectedCard: TcgCardDetail | null;
  cardModalLoading: boolean;
  userCollection: UserCollectionItem[];
  onClose: () => void;
  onToggleCollection: (card: {
    id: string;
    name: string;
    localId: string;
    image?: string;
    rarity?: string;
    price?: number;
  }) => void;
}

export const CardInspectorModal = ({
  selectedCard,
  cardModalLoading,
  userCollection,
  onClose,
  onToggleCollection,
}: CardInspectorModalProps) => {
  const [cardTilt, setCardTilt] = useState<{
    x: number;
    y: number;
    glareX: number;
    glareY: number;
    active: boolean;
  }>({
    x: 0,
    y: 0,
    glareX: 50,
    glareY: 50,
    active: false,
  });

  if (!selectedCard && !cardModalLoading) return null;

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 14;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setCardTilt({ x: rotateX, y: rotateY, glareX, glareY, active: true });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ x: 0, y: 0, glareX: 50, glareY: 50, active: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden my-auto">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-750 rounded-full transition-colors cursor-pointer z-20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {cardModalLoading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-slate-800 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Cargando detalles de la carta...</p>
          </div>
        )}

        {!cardModalLoading && selectedCard && (
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* 3D Tilt Card Image with Holographic Glare */}
            <div className="flex flex-col items-center gap-2">
              <div
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="w-56 sm:w-64 flex-shrink-0 aspect-[2.5/3.5] rounded-2xl relative shadow-2xl shadow-rose-500/10 cursor-grab active:cursor-grabbing select-none"
                style={{
                  perspective: '1000px',
                }}
              >
                <div
                  className="w-full h-full rounded-2xl overflow-hidden border border-slate-750 bg-slate-950 transition-transform duration-100 ease-out relative"
                  style={{
                    transform: cardTilt.active
                      ? `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg) scale(1.04)`
                      : 'rotateX(0deg) rotateY(0deg) scale(1)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Virtual 3D Card Graphic Face (shown when scan image is not yet available) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-4 flex flex-col justify-between text-left border-2 border-amber-500/25 rounded-2xl select-none">
                    <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                      <div className="max-w-[70%]">
                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block truncate">
                          {selectedCard.stage || selectedCard.category || 'Pokémon TCG'}
                        </span>
                        <h3 className="text-sm font-black text-white leading-tight truncate">
                          {selectedCard.name}
                        </h3>
                      </div>
                      {selectedCard.hp && (
                        <span className="text-xs font-black text-rose-400 font-mono">
                          {selectedCard.hp} PS
                        </span>
                      )}
                    </div>

                    <div className="my-auto py-3 text-center space-y-2">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-3xl shadow-inner">
                        🃏
                      </div>
                      <p className="text-xs font-semibold text-slate-300 px-2 line-clamp-2">
                        {selectedCard.set?.name || 'Expansión Oficial'}
                      </p>
                      <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">
                        Scan oficial en preparación
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono">#{selectedCard.localId || '?'}</span>
                      <span className="truncate max-w-[120px]">{selectedCard.rarity || 'Oficial'}</span>
                    </div>
                  </div>

                  {/* Card High-Res Image (rendered on top if present) */}
                  {selectedCard.image && (
                    <img
                      src={`${selectedCard.image}/high.webp`}
                      alt={selectedCard.name}
                      className="w-full h-full object-cover pointer-events-none absolute inset-0 z-10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.endsWith('.png')) {
                          target.src = `${selectedCard.image}/high.png`;
                        } else {
                          target.style.display = 'none';
                        }
                      }}
                    />
                  )}

                  {/* Holographic Sheen Layer */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl z-20"
                    style={{
                      opacity: cardTilt.active ? 0.7 : 0,
                      background: `radial-gradient(circle at ${cardTilt.glareX}% ${cardTilt.glareY}%, rgba(255,255,255,0.7) 0%, rgba(255,182,193,0.3) 25%, rgba(135,206,250,0.3) 50%, transparent 75%)`,
                      mixBlendMode: 'color-dodge',
                    }}
                  />

                  {/* Specular Diagonal Reflection */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl z-20"
                    style={{
                      opacity: cardTilt.active ? 0.45 : 0,
                      background: `linear-gradient(${115 + cardTilt.y * 2}deg, transparent 20%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 55%, transparent 80%)`,
                      mixBlendMode: 'overlay',
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                <span>✨</span> Pasa el cursor para ver el efecto holográfico 3D
              </span>
            </div>

            {/* Details Column */}
            <div className="flex-1 w-full space-y-3.5 text-left max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
              {/* Header: Title, HP, Stage, Rarity */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                    {selectedCard.rarity || 'Carta Pokémon TCG'}
                  </span>
                  {selectedCard.hp && (
                    <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {selectedCard.hp} PS / HP
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{selectedCard.name}</span>
                    {selectedCard.stage && (
                      <span className="text-xs font-bold text-slate-400 font-normal">
                        ({selectedCard.stage})
                      </span>
                    )}
                  </h3>

                  {/* Add to Album Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const price =
                        selectedCard.pricing?.tcgplayer?.holofoil?.marketPrice ||
                        selectedCard.pricing?.tcgplayer?.normal?.marketPrice ||
                        selectedCard.pricing?.tcgplayer?.marketPrice ||
                        selectedCard.pricing?.cardmarket?.avg ||
                        0;
                      onToggleCollection({
                        id: selectedCard.id,
                        name: selectedCard.name,
                        localId: selectedCard.id.split('-').pop() || '',
                        image: selectedCard.image,
                        rarity: selectedCard.rarity,
                        price,
                      });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                      userCollection.some((c) => c.id === selectedCard.id)
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill={userCollection.some((c) => c.id === selectedCard.id) ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    <span>
                      {userCollection.some((c) => c.id === selectedCard.id) ? 'En mi Álbum ✓' : 'Añadir al Álbum'}
                    </span>
                  </button>
                </div>

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

              {/* Abilities Section */}
              {selectedCard.abilities && selectedCard.abilities.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <span>⭐</span> Habilidades ({selectedCard.abilities[0]?.type || 'Habilidad'})
                  </h4>
                  <div className="space-y-2">
                    {selectedCard.abilities.map((ab, i) => (
                      <div
                        key={i}
                        className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 space-y-1 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">
                            {ab.name || 'Habilidad'}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 uppercase">
                            {ab.type || 'Habilidad'}
                          </span>
                        </div>
                        {ab.effect && (
                          <p className="text-[11px] text-slate-300 leading-snug">{ab.effect}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attacks Section */}
              {selectedCard.attacks && selectedCard.attacks.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span>⚔️</span> Ataques
                  </h4>
                  <div className="space-y-2">
                    {selectedCard.attacks.map((atk, i) => (
                      <div
                        key={i}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {atk.cost &&
                              atk.cost.map((c, ci) => (
                                <span
                                  key={ci}
                                  className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                                  title={c}
                                >
                                  {c}
                                </span>
                              ))}
                            <strong className="text-xs font-bold text-white">{atk.name}</strong>
                          </div>
                          {atk.damage && (
                            <span className="text-xs font-black font-mono text-rose-400">
                              {atk.damage}
                            </span>
                          )}
                        </div>
                        {atk.effect && (
                          <p className="text-[11px] text-slate-400 leading-snug">{atk.effect}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses, Resistances, Retreat & Format Legality */}
              <div
                className={`grid gap-2 pt-1 border-t border-slate-800/80 ${
                  selectedCard.resistances && selectedCard.resistances.length > 0
                    ? 'grid-cols-3'
                    : 'grid-cols-2'
                }`}
              >
                <div className="bg-slate-950/40 border border-slate-850 p-2 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">Debilidad</span>
                  <span className="text-xs font-semibold text-rose-300">
                    {selectedCard.weaknesses && selectedCard.weaknesses.length > 0
                      ? selectedCard.weaknesses.map((w) => `${w.type} ${w.value}`).join(', ')
                      : 'Ninguna'}
                  </span>
                </div>

                {selectedCard.resistances && selectedCard.resistances.length > 0 && (
                  <div className="bg-slate-950/40 border border-slate-850 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 font-bold block">Resistencia</span>
                    <span className="text-xs font-semibold text-emerald-300">
                      {selectedCard.resistances.map((r) => `${r.type} ${r.value}`).join(', ')}
                    </span>
                  </div>
                )}

                <div className="bg-slate-950/40 border border-slate-850 p-2 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">Coste de Retirada</span>
                  <span className="text-xs font-semibold text-slate-300">
                    {selectedCard.retreat !== undefined ? `${selectedCard.retreat} Energía(s)` : 'Gratis'}
                  </span>
                </div>
              </div>

              {/* Format Legality Badges */}
              {selectedCard.legal && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] text-slate-500 font-bold">Legalidad:</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      selectedCard.legal.standard
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    Estándar {selectedCard.legal.standard ? '✓' : '✗'}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      selectedCard.legal.expanded
                        ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    Expandido {selectedCard.legal.expanded ? '✓' : '✗'}
                  </span>
                </div>
              )}

              {/* Pricing Section */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
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
  );
};
