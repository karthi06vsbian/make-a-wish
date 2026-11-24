import React from 'react';

interface DiyaFlameProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStand?: boolean;
}

export const DiyaFlame: React.FC<DiyaFlameProps> = ({
  size = 'md',
  className = '',
  showStand = true,
}) => {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 72, height: 72 },
    xl: { width: 110, height: 110 },
  };

  const { width, height } = sizeMap[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    >
      {/* Radiant Glow Halo */}
      <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-xl animate-pulse-subtle pointer-events-none" />

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
      >
        <defs>
          {/* Flame Gradient */}
          <radialGradient id="flameInner" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="40%" stopColor="#FDE047" />
            <stop offset="75%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#DC2626" />
          </radialGradient>

          {/* Diya Bowl Metallic Gold Gradient */}
          <linearGradient id="bowlGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Oil Reservoir Glow */}
          <linearGradient id="oilGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>

        {/* Outer Halo Flare */}
        <circle cx="50" cy="38" r="28" fill="#F59E0B" fillOpacity="0.15" />
        <circle cx="50" cy="38" r="18" fill="#FDE047" fillOpacity="0.25" />

        {/* Flickering Flame Group */}
        <g className="animate-diya-flicker origin-bottom" style={{ transformOrigin: '50px 48px' }}>
          {/* Outer Flame Teardrop */}
          <path
            d="M50 14 C43 28 36 36 36 48 C36 56 42 62 50 62 C58 62 64 56 64 48 C64 36 57 28 50 14 Z"
            fill="url(#flameInner)"
            filter="drop-shadow(0 0 6px rgba(249,115,22,0.8))"
          />

          {/* Inner Golden Core */}
          <path
            d="M50 26 C46 34 42 40 42 49 C42 54 45 58 50 58 C55 58 58 54 58 49 C58 40 54 34 50 26 Z"
            fill="#FEF08A"
          />

          {/* White Sacred Spark Center */}
          <ellipse cx="50" cy="48" rx="3.5" ry="5.5" fill="#FFFFFF" />
        </g>

        {/* Diya Clay / Brass Bowl Base */}
        {showStand && (
          <g>
            {/* Diya Lip Rim */}
            <path
              d="M16 60 C16 58 84 58 84 60 C84 63 68 67 50 67 C32 67 16 63 16 60 Z"
              fill="url(#oilGlow)"
              stroke="#FDE68A"
              strokeWidth="0.8"
            />

            {/* Main Bowl Body */}
            <path
              d="M16 60 C16 75 32 84 50 84 C68 84 84 75 84 60 C80 72 67 80 50 80 C33 80 20 72 16 60 Z"
              fill="url(#bowlGold)"
            />

            {/* Sacred Engraving Motif Lines */}
            <path
              d="M32 72 Q50 78 68 72"
              stroke="#FEF3C7"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />

            {/* Pedestal Stand Base */}
            <path
              d="M40 84 L36 90 C36 92 64 92 64 90 L60 84 Z"
              fill="url(#bowlGold)"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
