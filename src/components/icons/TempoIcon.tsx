export const TempoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Rounded square background */}
    <rect width="36" height="36" rx="10" fill="url(#tempo-bg)" />

    {/* Abstract clock/timer design - circular arc with play indicator */}
    <circle
      cx="18"
      cy="18"
      r="10"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="50 63"
      fill="none"
      opacity="0.9"
    />

    {/* Center play triangle - represents starting focus */}
    <path
      d="M16 14L22 18L16 22V14Z"
      fill="white"
    />

    <defs>
      <linearGradient id="tempo-bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B5CF6" />
        <stop offset="0.5" stopColor="#A855F7" />
        <stop offset="1" stopColor="#D946EF" />
      </linearGradient>
    </defs>
  </svg>
);

export const TempoLogoText = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <TempoIcon />
    <span className="text-xl font-bold text-purple-600 dark:text-purple-400 tracking-tight">
      Tempo
    </span>
  </div>
);
