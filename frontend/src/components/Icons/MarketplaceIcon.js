import React from 'react';

export function MarketplaceIcon({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 9L12 2L21 9V20C21 21 20 22 19 22H5C4 22 3 21 3 20V9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 22V12H17V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="9"
        y="14"
        width="6"
        height="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 14V18"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M9 16H15"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}