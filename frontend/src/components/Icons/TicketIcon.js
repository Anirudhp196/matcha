import React from 'react';

export function TicketIcon({ size = 64, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main ticket body */}
      <rect
        x="8"
        y="16"
        width="48"
        height="32"
        rx="4"
        fill="#FF6B35"
        stroke="#E55A2B"
        strokeWidth="2"
      />
      
      {/* Ticket perforations */}
      <circle cx="16" cy="32" r="2" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="2" fill="#FFFFFF" />
      <circle cx="48" cy="32" r="2" fill="#FFFFFF" />
      
      {/* Ticket content area */}
      <rect
        x="12"
        y="20"
        width="40"
        height="24"
        rx="2"
        fill="#FFFFFF"
        opacity="0.9"
      />
      
      {/* Event title line */}
      <rect
        x="16"
        y="24"
        width="32"
        height="3"
        rx="1.5"
        fill="#FF6B35"
        opacity="0.8"
      />
      
      {/* Date line */}
      <rect
        x="16"
        y="30"
        width="20"
        height="2"
        rx="1"
        fill="#666666"
        opacity="0.6"
      />
      
      {/* Time line */}
      <rect
        x="16"
        y="34"
        width="16"
        height="2"
        rx="1"
        fill="#666666"
        opacity="0.6"
      />
      
      {/* Price indicator */}
      <rect
        x="40"
        y="30"
        width="6"
        height="6"
        rx="3"
        fill="#4CAF50"
        opacity="0.8"
      />
      
      {/* Price symbol */}
      <text
        x="43"
        y="34"
        fontSize="4"
        fill="#FFFFFF"
        fontWeight="bold"
        textAnchor="middle"
      >
        $
      </text>
      
      {/* Ticket corner fold */}
      <path
        d="M48 16L56 8L56 16L48 16Z"
        fill="#FF6B35"
        opacity="0.8"
      />
      
      {/* Fold shadow */}
      <path
        d="M48 16L56 8L48 16Z"
        fill="#E55A2B"
        opacity="0.3"
      />
      
      {/* Decorative elements */}
      <circle cx="20" cy="40" r="1" fill="#FF6B35" opacity="0.4" />
      <circle cx="44" cy="40" r="1" fill="#FF6B35" opacity="0.4" />
      <circle cx="32" cy="42" r="0.8" fill="#FF6B35" opacity="0.3" />
    </svg>
  );
}
