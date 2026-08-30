import { STATUS_COLORS, scoreStatus } from '../lib/status'

export function ScoreRing({ score, max, size = 34 }: { score: number; max: number; size?: number }) {
  const status = scoreStatus(score, max)
  const color = STATUS_COLORS[status]
  const r = (size - 4) / 2
  const c = 2 * Math.PI * r
  const ratio = max === 0 ? 0 : score / max
  const dash = c * ratio

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={3} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: 'stroke-dasharray 400ms cubic-bezier(0.34, 1.2, 0.64, 1), stroke 300ms ease' }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-data text-[10px] font-semibold"
        style={{ color }}
      >
        {score}/{max}
      </span>
    </div>
  )
}
