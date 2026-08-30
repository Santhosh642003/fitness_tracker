export function CheckMark({ checked, size = 26 }: { checked: boolean; size?: number }) {
  return (
    <span className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="1.5"
          style={{ opacity: checked ? 0 : 1, transition: 'opacity 200ms ease' }}
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="var(--color-status-hold)"
          style={{
            transformOrigin: '12px 12px',
            transform: checked ? 'scale(1)' : 'scale(0)',
            transition: 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
        <path
          d="M7 12.5l3.2 3.2L17 9"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: checked ? 0 : 1,
            transition: checked ? 'stroke-dashoffset 260ms ease-out 120ms' : 'stroke-dashoffset 120ms ease-in',
          }}
        />
      </svg>
    </span>
  )
}
