export function BubbleIcon({ color }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3C6.48 3 2 6.94 2 11.8c0 2.68 1.4 5.08 3.6 6.7-.12 1.05-.5 2.4-1.3 3.7a.5.5 0 0 0 .6.73c1.9-.66 3.4-1.55 4.3-2.2.9.24 1.85.37 2.8.37 5.52 0 10-3.94 10-8.8S17.52 3 12 3Z"
        fill={color}
      />
    </svg>
  );
}

export function CheckIcon({ color = "#ffffff" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CloseIcon({ color = "currentColor" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}