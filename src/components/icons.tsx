export function ArrowUpRight({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M3.5 10.5 10.5 3.5M5 3.5h5.5V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SortArrow({ dir }: { dir: 1 | -1 | 0 }) {
  return (
    <svg width="8" height="10" viewBox="0 0 8 10" aria-hidden className="shrink-0">
      <path d="M4 0.5 7 4H1L4 0.5Z" fill="currentColor" opacity={dir === 1 ? 1 : 0.25} />
      <path d="M4 9.5 1 6h6L4 9.5Z" fill="currentColor" opacity={dir === -1 ? 1 : 0.25} />
    </svg>
  );
}
