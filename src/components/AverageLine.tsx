import { useMemo } from 'react'
import type { DatedValue } from '../lib/average'
import { rollingAverage } from '../lib/average'
import { useSpringValue } from '../lib/useSpringValue'

export function AverageLine({
  points,
  unit,
  label,
  decimals = 1,
  daysShown = 14,
}: {
  points: DatedValue[]
  unit: string
  label: string
  decimals?: number
  daysShown?: number
}) {
  const sorted = useMemo(() => [...points].sort((a, b) => (a.date < b.date ? -1 : 1)), [points])
  const avgSeries = useMemo(() => rollingAverage(sorted), [sorted])
  const currentAvg = avgSeries[avgSeries.length - 1]?.value
  const displayValue = useSpringValue(currentAvg)

  const recentDaily = sorted.slice(-daysShown)
  const recentAvg = avgSeries.slice(-daysShown)

  const { dotPath, linePath, width, height } = useMemo(() => {
    const w = 320
    const h = 64
    if (recentDaily.length < 2) return { dotPath: [] as { x: number; y: number }[], linePath: '', width: w, height: h }

    const values = recentDaily.map((p) => p.value).concat(recentAvg.map((p) => p.value))
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = (max - min) * 0.2 || 1
    const lo = min - pad
    const hi = max + pad

    const xFor = (i: number, n: number) => (n <= 1 ? 0 : (i / (n - 1)) * w)
    const yFor = (v: number) => h - ((v - lo) / (hi - lo)) * h

    const dots = recentDaily.map((p, i) => ({ x: xFor(i, recentDaily.length), y: yFor(p.value) }))

    const avgXY = recentAvg.map((p, i) => ({ x: xFor(i, recentAvg.length), y: yFor(p.value) }))
    let d = ''
    avgXY.forEach((p, i) => {
      if (i === 0) d += `M ${p.x} ${p.y}`
      else {
        const prev = avgXY[i - 1]
        const midX = (prev.x + p.x) / 2
        d += ` C ${midX} ${prev.y}, ${midX} ${p.y}, ${p.x} ${p.y}`
      }
    })

    return { dotPath: dots, linePath: d, width: w, height: h }
  }, [recentDaily, recentAvg])

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">{label}</span>
        <span className="text-xs text-[var(--color-ink-muted)]">7-day average</span>
      </div>

      <div className="mt-1 flex items-end gap-2">
        {currentAvg === undefined ? (
          <span className="font-data text-3xl font-semibold text-[var(--color-ink-muted)]">—</span>
        ) : (
          <span
            className="font-data text-6xl font-bold tabular-nums text-[var(--color-ink)]"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(23,23,26,0.08))' }}
          >
            {displayValue.toFixed(decimals)}
          </span>
        )}
        <span className="pb-2 font-data text-lg text-[var(--color-ink-muted)]">{unit}</span>
      </div>

      {recentDaily.length >= 2 && (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mt-3 h-16 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${label} trend over last ${recentDaily.length} days`}
        >
          {dotPath.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="var(--color-line)" stroke="var(--color-ink-muted)" strokeWidth={1} />
          ))}
          <path d={linePath} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} strokeLinecap="round" />
        </svg>
      )}
      {recentDaily.length < 2 && (
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">Log a few days to see the trend line form.</p>
      )}
    </div>
  )
}
