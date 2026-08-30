export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="3" cy="15" r="1.4" fill="var(--color-ink-muted)" />
      <circle cx="8" cy="7" r="1.4" fill="var(--color-ink-muted)" />
      <circle cx="13" cy="17" r="1.4" fill="var(--color-ink-muted)" />
      <circle cx="18" cy="6" r="1.4" fill="var(--color-ink-muted)" />
      <circle cx="21.5" cy="11" r="1.4" fill="var(--color-ink-muted)" />
      <path
        d="M2 13.5 C 6 11, 9 10, 12 11.5 S 18 10.5, 21.5 9.5"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
