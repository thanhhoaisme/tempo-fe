'use client';

interface HPBarSkinProps {
  percentage: number;
}

export default function HPBarSkin({ percentage }: HPBarSkinProps) {
  const hp = Math.max(0, Math.min(100, percentage));
  const isBroken = hp === 0;

  return (
    <svg width="288" height="288" viewBox="0 0 200 200" className="mx-auto">
      <defs>
        <filter id="hpGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <clipPath id="heartClip">
          <rect x="0" y={200 - (hp * 2)} width="200" height={hp * 2} />
        </clipPath>
      </defs>

      {/* Circular border background */}
      <circle
        cx="100"
        cy="100"
        r="95"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-gray-700 dark:text-gray-600"
      />

      {/* Heart Container - Centered and Larger */}
      {!isBroken ? (
        <>
          {/* Heart Outline - Empty */}
          <path
            d="M 100 75 C 100 55 82 40 60 40 C 38 40 20 55 20 80 C 20 115 100 160 100 160 C 100 160 180 115 180 80 C 180 55 162 40 140 40 C 118 40 100 55 100 75 Z"
            fill="currentColor"
            className="text-gray-300 dark:text-gray-700"
          />

          {/* Heart Fill - Drains as time decreases */}
          <g clipPath="url(#heartClip)">
            <path
              d="M 100 75 C 100 55 82 40 60 40 C 38 40 20 55 20 80 C 20 115 100 160 100 160 C 100 160 180 115 180 80 C 180 55 162 40 140 40 C 118 40 100 55 100 75 Z"
              fill="url(#heartGradient)"
              className="transition-all duration-1000"
            />
            
            {/* Shine effect on filled heart */}
            <ellipse
              cx="70"
              cy="70"
              rx="20"
              ry="15"
              fill="white"
              opacity="0.3"
            />
          </g>

          {/* Heart Border with glow */}
          <path
            d="M 100 75 C 100 55 82 40 60 40 C 38 40 20 55 20 80 C 20 115 100 160 100 160 C 100 160 180 115 180 80 C 180 55 162 40 140 40 C 118 40 100 55 100 75 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-red-500"
            filter="url(#hpGlow)"
          />

          {/* Heartbeat effect when low */}
          {hp < 20 && hp > 0 && (
            <path
              d="M 100 75 C 100 55 82 40 60 40 C 38 40 20 55 20 80 C 20 115 100 160 100 160 C 100 160 180 115 180 80 C 180 55 162 40 140 40 C 118 40 100 55 100 75 Z"
              fill="none"
              stroke="#ef4444"
              strokeWidth="5"
              opacity="0.6"
              className="animate-pulse"
            />
          )}
        </>
      ) : (
        /* Broken Heart */
        <>
          {/* Left half of broken heart */}
          <path
            d="M 100 75 C 100 55 82 40 60 40 C 38 40 20 55 20 80 C 20 115 100 160 90 150 L 75 80 Z"
            fill="url(#heartGradient)"
            opacity="0.6"
            transform="translate(-20, 15) rotate(-20 60 100)"
            className="transition-all duration-500"
          />
          
          {/* Right half of broken heart */}
          <path
            d="M 100 75 C 100 55 118 40 140 40 C 162 40 180 55 180 80 C 180 115 100 160 110 150 L 125 80 Z"
            fill="url(#heartGradient)"
            opacity="0.6"
            transform="translate(20, 15) rotate(20 140 100)"
            className="transition-all duration-500"
          />

          {/* Crack/Breaking lines */}
          <path
            d="M 100 75 L 80 110 L 85 130"
            stroke="#7f1d1d"
            strokeWidth="3"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 100 75 L 120 110 L 115 130"
            stroke="#7f1d1d"
            strokeWidth="3"
            fill="none"
            opacity="0.8"
          />

          {/* Broken pieces particles */}
          <circle cx="60" cy="120" r="4" fill="#ef4444" opacity="0.5" />
          <circle cx="140" cy="120" r="4" fill="#ef4444" opacity="0.5" />
          <circle cx="80" cy="135" r="3" fill="#dc2626" opacity="0.4" />
          <circle cx="120" cy="135" r="3" fill="#dc2626" opacity="0.4" />
          <circle cx="95" cy="145" r="2" fill="#b91c1c" opacity="0.3" />
          <circle cx="105" cy="145" r="2" fill="#b91c1c" opacity="0.3" />
        </>
      )}

      {/* Circular border with glow - in front */}
      <circle
        cx="100"
        cy="100"
        r="95"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className={hp > 50 ? 'text-red-500' : hp > 20 ? 'text-orange-500' : 'text-gray-500'}
        filter="url(#hpGlow)"
      />
    </svg>
  );
}
