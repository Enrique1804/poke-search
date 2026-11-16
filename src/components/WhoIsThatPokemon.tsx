import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  GENERATIONS,
  TYPE_COLORS,
  TYPE_TRANSLATIONS,
} from '../constants/pokemon';
import type { Pokemon, QuickPokemon } from '../types/pokemon';

interface WhoIsThatPokemonProps {
  allPokemonNames: QuickPokemon[];
  onInspectPokemon: (name: string) => void;
}

const BEST_STREAK_KEY = 'poke_whos_that_best_streak';

export const WhoIsThatPokemon = ({
  allPokemonNames,
  onInspectPokemon,
}: WhoIsThatPokemonProps) => {
  const [selectedGenId, setSelectedGenId] = useState<number | null>(1); // Default Gen 1 for instant fun, toggleable to All
  const [targetPokemon, setTargetPokemon] = useState<Pokemon | null>(null);
  const [options, setOptions] = useState<QuickPokemon[]>([]);
  const [loadingRound, setLoadingRound] = useState<boolean>(true);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [showTypeHint, setShowTypeHint] = useState<boolean>(false);
  const [isPlayingCry, setIsPlayingCry] = useState<boolean>(false);

  const [streak, setStreak] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);
  const [totalPlayed, setTotalPlayed] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(BEST_STREAK_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pool = useMemo(() => {
    if (allPokemonNames.length === 0) return [];
    if (selectedGenId === null) return allPokemonNames;
    const gen = GENERATIONS.find((g) => g.id === selectedGenId);
    if (!gen) return allPokemonNames;
    return allPokemonNames.filter((p) => p.id >= gen.startId && p.id <= gen.endId);
  }, [allPokemonNames, selectedGenId]);

  const startNewRound = useCallback(async () => {
    setLoadingRound(true);
    setSelectedOptionId(null);
    setRevealed(false);
    setShowTypeHint(false);

    try {
      let chosenId: number;
      let roundOptions: QuickPokemon[] = [];

      if (pool.length >= 4) {
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        roundOptions = shuffled.slice(0, 4);
        chosenId = roundOptions[0].id;
        roundOptions = [...roundOptions].sort(() => Math.random() - 0.5);
      } else {
        // Fallback if allPokemonNames hasn't finished loading yet
        const gen = GENERATIONS.find((g) => g.id === selectedGenId);
        const min = gen ? gen.startId : 1;
        const max = gen ? gen.endId : 151;
        chosenId = Math.floor(Math.random() * (max - min + 1)) + min;
      }

      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${chosenId}`);
      if (!res.ok) throw new Error('Error loading pokemon');
      const data: Pokemon = await res.json();

      if (roundOptions.length === 0) {
        // Build fallback options if pool was empty
        const fakeIds = new Set<number>([data.id]);
        while (fakeIds.size < 4) {
          fakeIds.add(Math.floor(Math.random() * 151) + 1);
        }
        const fetched = await Promise.all(
          Array.from(fakeIds).map(async (id) => {
            if (id === data.id) return { id: data.id, name: data.name };
            const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const d = await r.json();
            return { id: d.id, name: d.name };
          })
        );
        roundOptions = fetched.sort(() => Math.random() - 0.5);
      }

      setTargetPokemon(data);
      setOptions(roundOptions);
    } catch (err) {
      console.error('Error starting minigame round:', err);
    } finally {
      setLoadingRound(false);
    }
  }, [pool, selectedGenId]);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  const handleSelectOption = (opt: QuickPokemon) => {
    if (revealed || !targetPokemon) return;
    setSelectedOptionId(opt.id);
    setRevealed(true);
    setTotalPlayed((prev) => prev + 1);

    if (opt.id === targetPokemon.id) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setTotalCorrect((prev) => prev + 1);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
        try {
          localStorage.setItem(BEST_STREAK_KEY, String(nextStreak));
        } catch {}
      }
    } else {
      setStreak(0);
    }
  };

  const playCry = () => {
    const cryUrl = targetPokemon?.cries?.latest || targetPokemon?.cries?.legacy;
    if (!cryUrl) return;
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(cryUrl);
      audio.volume = 0.5;
      audioRef.current = audio;
      setIsPlayingCry(true);
      audio.onended = () => setIsPlayingCry(false);
      audio.onerror = () => setIsPlayingCry(false);
      audio.play().catch(() => setIsPlayingCry(false));
    } catch {
      setIsPlayingCry(false);
    }
  };

  const artworkUrl =
    targetPokemon?.sprites?.other?.['official-artwork']?.front_default ||
    targetPokemon?.sprites?.front_default ||
    (targetPokemon ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${targetPokemon.id}.png` : '');

  const primaryType = targetPokemon?.types?.[0]?.type?.name || 'normal';
  const primaryColor = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;
  const isCorrect = revealed && selectedOptionId === targetPokemon?.id;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 animate-scale-up">
      {/* Header & Scoreboard */}
      <div className="bg-gradient-to-r from-indigo-500/15 via-slate-900 to-rose-500/15 border border-indigo-500/30 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/10">
            🎮
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>¿Quién es ese Pokémon?</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                Trivia
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Adivina el Pokémon por su silueta o escucha su grito oficial para mantener tu racha.
            </p>
          </div>
        </div>

        {/* Score Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl text-center min-w-[82px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Racha</span>
            <span className="text-base font-black text-amber-400 font-mono">🔥 {streak}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl text-center min-w-[82px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Récord</span>
            <span className="text-base font-black text-emerald-400 font-mono">🏆 {bestStreak}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl text-center min-w-[82px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Aciertos</span>
            <span className="text-base font-black text-sky-400 font-mono">
              {totalCorrect}/{totalPlayed}
            </span>
          </div>
        </div>
      </div>

      {/* Generation Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-[11px] font-bold text-slate-400 mr-1 flex-shrink-0">Región:</span>
        <button
          type="button"
          onClick={() => setSelectedGenId(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
            selectedGenId === null
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Todas (1-1025)
        </button>
        {GENERATIONS.map((gen) => (
          <button
            key={gen.id}
            type="button"
            onClick={() => setSelectedGenId(gen.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 border ${
              selectedGenId === gen.id
                ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {gen.name} ({gen.region})
          </button>
        ))}
      </div>

      {/* Main Arena */}
      {loadingRound || !targetPokemon ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold animate-pulse">
            Preparando silueta misteriosa...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Silhouette / Reveal Stage */}
          <div className="relative bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[290px] overflow-hidden">
            {/* Subtle Pokéball decorative ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <div className="w-56 h-56 rounded-full border-[12px] border-indigo-400" />
            </div>

            {/* Revealed Type Glow */}
            {revealed && (
              <div
                className={`absolute w-48 h-48 rounded-full blur-3xl opacity-35 transition-opacity duration-700 pointer-events-none ${primaryColor.bg.replace(
                  '/20',
                  '/90'
                )}`}
              />
            )}

            {/* Top Badges */}
            <div className="w-full flex items-center justify-between z-10 mb-2">
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400">
                {revealed ? `#${targetPokemon.id.toString().padStart(3, '0')}` : '#???'}
              </span>

              <div className="flex items-center gap-1.5">
                {(targetPokemon.cries?.latest || targetPokemon.cries?.legacy) && (
                  <button
                    type="button"
                    onClick={playCry}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      isPlayingCry
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <span>🔊</span>
                    <span>Grito</span>
                  </button>
                )}

                {!revealed && !showTypeHint && (
                  <button
                    type="button"
                    onClick={() => setShowTypeHint(true)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 hover:bg-indigo-500/20 text-indigo-300 border border-slate-700 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>💡</span>
                    <span>Pista</span>
                  </button>
                )}
              </div>
            </div>

            {/* Pokémon Artwork */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-2 z-10">
              <img
                src={artworkUrl}
                alt={revealed ? targetPokemon.name : 'Pokémon misterioso'}
                className={`w-full h-full object-contain select-none pointer-events-none transition-all duration-500 ${
                  revealed
                    ? 'brightness-100 contrast-100 scale-105 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]'
                    : 'brightness-0 contrast-200 opacity-95 drop-shadow-[0_0_12px_rgba(99,102,241,0.45)]'
                }`}
              />
            </div>

            {/* Type Hint or Revealed Types */}
            {(showTypeHint || revealed) && (
              <div className="flex items-center gap-1.5 mt-2 z-10">
                {targetPokemon.types.map((t) => {
                  const badge = TYPE_COLORS[t.type.name] || TYPE_COLORS.normal;
                  return (
                    <span
                      key={t.type.name}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold capitalize border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {TYPE_TRANSLATIONS[t.type.name] || t.type.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Options & Result Column */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                {revealed
                  ? isCorrect
                    ? '🎉 ¡Correcto!'
                    : '😅 ¡Casi! Era...'
                  : 'Selecciona la respuesta correcta:'}
              </h4>
              {revealed && (
                <p className="text-2xl font-black capitalize text-white tracking-tight">
                  {targetPokemon.name}
                </p>
              )}
            </div>

            {/* 4 Multiple Choice Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.map((opt) => {
                const isTarget = opt.id === targetPokemon.id;
                const isSelected = opt.id === selectedOptionId;

                let btnStyle =
                  'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-indigo-500/50 text-slate-200';
                if (revealed) {
                  if (isTarget) {
                    btnStyle =
                      'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !isTarget) {
                    btnStyle =
                      'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30';
                  } else {
                    btnStyle = 'bg-slate-950/30 border-slate-800/50 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={revealed}
                    onClick={() => handleSelectOption(opt)}
                    className={`px-4 py-3.5 rounded-2xl border font-bold text-sm capitalize transition-all flex items-center justify-between ${
                      revealed ? 'cursor-default' : 'cursor-pointer active:scale-95'
                    } ${btnStyle}`}
                  >
                    <span className="truncate">{opt.name}</span>
                    {revealed && isTarget && <span>✓</span>}
                    {revealed && isSelected && !isTarget && <span>✕</span>}
                  </button>
                );
              })}
            </div>

            {/* Post-round actions */}
            {revealed && (
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={startNewRound}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95"
                >
                  Siguiente Pokémon ➔
                </button>
                <button
                  type="button"
                  onClick={() => onInspectPokemon(targetPokemon.name)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer active:scale-95"
                >
                  🔍 Ver en Pokédex
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
