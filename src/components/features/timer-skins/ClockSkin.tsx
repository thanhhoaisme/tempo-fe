'use client';

interface ClockSkinProps {
  percentage: number;
  timeString?: string;
}

export default function ClockSkin({ percentage }: ClockSkinProps) {
  const rotation = ((100 - percentage) / 100) * 360;
  const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

  return (
    <svg width="288" height="288" viewBox="0 0 200 200" className="mx-auto">
      <defs>
        <radialGradient id="vintageFace" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fef9f3" />
          <stop offset="100%" stopColor="#f5e6d3" />
        </radialGradient>
      </defs>

      {/* Clock Face Background */}
      <circle
        cx="100"
        cy="100"
        r="85"
        fill="url(#vintageFace)"
        className="dark:fill-[#2d2d2d]"
      />

      {/* Outer Border - Gold */}
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="#b8860b"
        strokeWidth="6"
        className="dark:stroke-[#8b7355]"
      />

      {/* Inner Border */}
      <circle
        cx="100"
        cy="100"
        r="85"
        fill="none"
        stroke="#8b6914"
        strokeWidth="2"
        className="dark:stroke-[#5c4d3d]"
      />

      {/* Roman Numerals */}
      {romanNumerals.map((numeral, i) => {
        const angle = (i * 30) * (Math.PI / 180);
        const radius = 70;
        const x = 100 + radius * Math.sin(angle);
        const y = 100 - radius * Math.cos(angle);

        return (
          <text
            key={i}
            x={Number(x.toFixed(2))}
            y={Number(y.toFixed(2))}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#3d2817] dark:fill-[#d4c5b0]"
            style={{
              fontSize: i === 0 || i === 6 ? '16px' : '14px',
              fontFamily: 'Georgia, serif',
              fontWeight: '500'
            }}
          >
            {numeral}
          </text>
        );
      })}

      {/* Minute Marks */}
      {[...Array(60)].map((_, i) => {
        if (i % 5 === 0) return null;
        const angle = (i * 6 - 90) * (Math.PI / 180);
        const x1 = Number((100 + 80 * Math.cos(angle)).toFixed(2));
        const y1 = Number((100 + 80 * Math.sin(angle)).toFixed(2));
        const x2 = Number((100 + 83 * Math.cos(angle)).toFixed(2));
        const y2 = Number((100 + 83 * Math.sin(angle)).toFixed(2));

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#5d4e37"
            strokeWidth="1"
            className="dark:stroke-[#6d5d4d]"
          />
        );
      })}

      {/* Clock Hand */}
      <line
        x1="100"
        y1="100"
        x2="100"
        y2="35"
        stroke="#1a1a1a"
        strokeWidth="3"
        strokeLinecap="round"
        transform={`rotate(${rotation} 100 100)`}
        className="transition-all duration-1000 dark:stroke-[#e0d5c0]"
      />

      {/* Center Dot */}
      <circle
        cx="100"
        cy="100"
        r="5"
        fill="#3d2817"
        className="dark:fill-[#d4c5b0]"
      />
    </svg>
  );
}
