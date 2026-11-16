import type { PokemonStat } from '../types/pokemon';

const RADAR_STATS = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'Ataque' },
  { key: 'defense', label: 'Defensa' },
  { key: 'speed', label: 'Velocidad' },
  { key: 'special-defense', label: 'Def. Esp.' },
  { key: 'special-attack', label: 'At. Esp.' },
];

export const StatRadarChart = ({
  stats,
  primaryColorHex = '#f43f5e',
}: {
  stats: PokemonStat[];
  primaryColorHex?: string;
}) => {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 82;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getPolygonPoints = (radius: number) => {
    return Array.from({ length: 6 })
      .map((_, i) => {
        const angle = ((Math.PI * 2) / 6) * i - Math.PI / 2;
        return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
      })
      .join(' ');
  };

  const coords = RADAR_STATS.map((stat, i) => {
    const val = stats.find((s) => s.stat.name === stat.key)?.base_stat || 0;
    const clamped = Math.min(Math.max(val, 15), 255);
    const r = (clamped / 255) * maxRadius;
    const angle = ((Math.PI * 2) / 6) * i - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      val,
      label: stat.label,
      labelX: cx + (maxRadius + 24) * Math.cos(angle),
      labelY: cy + (maxRadius + 24) * Math.sin(angle),
    };
  });

  const dataPoints = coords.map((c) => `${c.x},${c.y}`).join(' ');

  return (
    <div className="flex flex-col items-center justify-center relative p-2">
      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Concentric Hexagons */}
        {levels.map((lvl, idx) => (
          <polygon
            key={idx}
            points={getPolygonPoints(maxRadius * lvl)}
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray={idx === levels.length - 1 ? 'none' : '3 3'}
            opacity={0.6}
          />
        ))}

        {/* Radiating Axis Lines */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = ((Math.PI * 2) / 6) * i - Math.PI / 2;
          const x2 = cx + maxRadius * Math.cos(angle);
          const y2 = cy + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="#334155"
              strokeWidth="1"
              opacity={0.7}
            />
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={dataPoints}
          fill={primaryColorHex}
          fillOpacity="0.35"
          stroke={primaryColorHex}
          strokeWidth="2.5"
          className="transition-all duration-700"
        />

        {/* Vertex Points & Labels */}
        {coords.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.x}
              cy={c.y}
              r="4"
              fill={primaryColorHex}
              stroke="#0f172a"
              strokeWidth="2"
            />
            <text
              x={c.labelX}
              y={c.labelY}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[10px] font-bold fill-slate-400 font-sans"
            >
              {c.label}
            </text>
            <text
              x={c.labelX}
              y={c.labelY + 11}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[11px] font-black fill-white font-mono"
            >
              {c.val}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
