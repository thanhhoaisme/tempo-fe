'use client';

interface BatterySkinProps {
  percentage: number;
  isCharging?: boolean;
}

export default function BatterySkin({ percentage, isCharging = false }: BatterySkinProps) {
  const batteryLevel = Math.max(0, Math.min(100, percentage));
  const batteryColor = batteryLevel > 50 ? '#10b981' : batteryLevel > 20 ? '#f59e0b' : '#ef4444';

  return (
    <svg width="288" height="288" viewBox="0 0 200 200" className="mx-auto">
      <defs>
        <filter id="batteryGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Battery Terminal (top) */}
      <rect
        x="85"
        y="30"
        width="30"
        height="15"
        rx="4"
        fill="currentColor"
        className="text-gray-400 dark:text-gray-300"
        filter="url(#batteryGlow)"
      />
      
      {/* Battery Body (vertical) */}
      <rect
        x="60"
        y="45"
        width="80"
        height="120"
        rx="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-gray-400 dark:text-gray-300"
        filter="url(#batteryGlow)"
      />

      {/* Battery Fill */}
      <defs>
        <linearGradient id="batteryGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={batteryColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={batteryColor} />
        </linearGradient>
      </defs>

      <rect
        x="65"
        y={50 + 110 * (1 - batteryLevel / 100)}
        width="70"
        height={(110 * batteryLevel) / 100}
        rx="4"
        fill="url(#batteryGradient)"
        className="transition-all duration-1000"
      />

      {/* Charging Lightning */}
      {isCharging && (
        <path
          d="M 110 95 L 90 115 L 100 115 L 85 140 L 110 115 L 100 115 Z"
          fill="#fbbf24"
          className="animate-pulse"
        />
      )}
    </svg>
  );
}
