export function MatchaIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tea bowl */}
      <path
        d="M12 28C12 24 16 20 32 20C48 20 52 24 52 28L50 44C50 48 46 52 32 52C18 52 14 48 14 44L12 28Z"
        fill="#2D5016"
        stroke="#1A3009"
        strokeWidth="1.5"
      />
      
      {/* Matcha liquid */}
      <ellipse
        cx="32"
        cy="28"
        rx="18"
        ry="6"
        fill="#4A7C59"
      />
      
      {/* Matcha foam/froth */}
      <ellipse
        cx="32"
        cy="26"
        rx="16"
        ry="4"
        fill="#7CB342"
      />
      
      {/* Small foam bubbles */}
      <circle cx="28" cy="26" r="1" fill="#A5D155" />
      <circle cx="36" cy="25" r="0.8" fill="#A5D155" />
      <circle cx="32" cy="24" r="0.6" fill="#A5D155" />
      
      {/* Whisk (chasen) */}
      <rect
        x="38"
        y="8"
        width="2"
        height="16"
        fill="#8D6E63"
        transform="rotate(15 39 16)"
      />
      
      {/* Whisk bristles */}
      <path
        d="M40 18L42 22M38 19L40 23M42 19L44 23M36 20L38 24"
        stroke="#8D6E63"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      
      {/* Matcha powder scattered */}
      <circle cx="18" cy="14" r="1" fill="#7CB342" opacity="0.6" />
      <circle cx="22" cy="12" r="0.8" fill="#7CB342" opacity="0.6" />
      <circle cx="48" cy="16" r="1.2" fill="#7CB342" opacity="0.6" />
      <circle cx="46" cy="12" r="0.6" fill="#7CB342" opacity="0.6" />
      
      {/* Bowl rim highlight */}
      <ellipse
        cx="32"
        cy="20"
        rx="20"
        ry="2"
        fill="none"
        stroke="#4A7C59"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
}