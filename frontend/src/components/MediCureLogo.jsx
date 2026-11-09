import React from 'react';

export default function MediCureLogo({ size = 44, className = '', showWordmark = false, subtitle }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        aria-label="MediCure logo"
        role="img"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="medicure-logo-gradient" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0A9B6B" />
            <stop offset="1" stopColor="#006948" />
          </linearGradient>
        </defs>
        <path
          d="M24 3.5 40.5 10v11.2c0 10.1-6.8 18.9-16.5 23.3C14.3 40.1 7.5 31.3 7.5 21.2V10L24 3.5Z"
          fill="url(#medicure-logo-gradient)"
        />
        <path
          d="M24 12v15M16.5 19.5h15"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="m16.5 31.5 4.2 4.2L32 24.4"
          stroke="#B8FFD8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-headline-sm text-lg font-bold text-on-surface">MediCure</span>
          {subtitle && (
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-outline">
              {subtitle}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
