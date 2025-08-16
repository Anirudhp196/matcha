import React from 'react';

export function MusicPerformanceIcon({ size = 64, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stage platform */}
      <rect
        x="8"
        y="48"
        width="48"
        height="8"
        rx="2"
        fill="#444444"
        stroke="#333333"
        strokeWidth="1"
      />
      
      {/* Microphone stand */}
      <rect
        x="31"
        y="32"
        width="2"
        height="16"
        fill="#666666"
      />
      
      {/* Microphone */}
      <ellipse
        cx="32"
        cy="30"
        rx="3"
        ry="4"
        fill="#2C3E50"
        stroke="#34495E"
        strokeWidth="1"
      />
      
      {/* Microphone grille */}
      <ellipse
        cx="32"
        cy="30"
        rx="2"
        ry="3"
        fill="none"
        stroke="#7F8C8D"
        strokeWidth="0.5"
      />
      <line x1="30" y1="29" x2="34" y2="29" stroke="#7F8C8D" strokeWidth="0.3" />
      <line x1="30" y1="31" x2="34" y2="31" stroke="#7F8C8D" strokeWidth="0.3" />
      
      {/* Spotlight beams */}
      <path
        d="M32 20L28 32L36 32Z"
        fill="#FFE135"
        opacity="0.3"
      />
      <path
        d="M32 20L24 36L40 36Z"
        fill="#FFE135"
        opacity="0.15"
      />
      
      {/* Musical notes */}
      <g fill="#E74C3C">
        {/* First note */}
        <circle cx="42" cy="24" r="2.5" />
        <rect x="44" y="16" width="1.5" height="8" />
        <path d="M44 16Q48 14 48 18L48 20Q44 22 44 18Z" />
        
        {/* Second note */}
        <circle cx="48" cy="28" r="2" />
        <rect x="49.5" y="22" width="1.2" height="6" />
        
        {/* Third note */}
        <circle cx="18" cy="22" r="2.5" />
        <rect x="20" y="14" width="1.5" height="8" />
        <path d="M20 14Q24 12 24 16L24 18Q20 20 20 16Z" />
      </g>
      
      {/* Sound waves */}
      <g stroke="#3498DB" strokeWidth="1.5" fill="none" opacity="0.6">
        <path d="M12 30Q8 26 8 30Q8 34 12 30" />
        <path d="M10 30Q6 24 6 30Q6 36 10 30" />
        <path d="M52 30Q56 26 56 30Q56 34 52 30" />
        <path d="M54 30Q58 24 58 30Q58 36 54 30" />
      </g>
      
      {/* Guitar silhouette */}
      <g fill="#8B4513" opacity="0.7">
        <ellipse cx="22" cy="40" rx="4" ry="6" />
        <rect x="20" y="34" width="4" height="6" />
        <rect x="21" y="30" width="2" height="4" />
        
        {/* Guitar strings */}
        <g stroke="#C0C0C0" strokeWidth="0.3">
          <line x1="21" y1="34" x2="21" y2="46" />
          <line x1="22" y1="34" x2="22" y2="46" />
          <line x1="23" y1="34" x2="23" y2="46" />
        </g>
      </g>
      
      {/* Stage lights */}
      <circle cx="16" cy="8" r="3" fill="#F39C12" opacity="0.8" />
      <circle cx="32" cy="6" r="3" fill="#F39C12" opacity="0.8" />
      <circle cx="48" cy="8" r="3" fill="#F39C12" opacity="0.8" />
      
      {/* Light beams */}
      <path d="M16 11L14 20L18 20Z" fill="#F39C12" opacity="0.2" />
      <path d="M48 11L46 20L50 20Z" fill="#F39C12" opacity="0.2" />
    </svg>
  );
}
