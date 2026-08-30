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
  anchorPoint,
}: {
  points: DatedValue[]
  unit: string
  label: string
  decimals?: number
  daysShown?: number
  /** A known real value (e.g. the plan's baseline) to seed the line before any logs exist. */
  anchorPoint?: DatedValue
}) {
  const withAnchor = useMemo(() => {
    if (!anchorPoint) return points
    if (points.some((p) => p.date === anchorPoint.date)) return points
    return [anchorPoint, ...points]
  }, [points, anchorPoint])

  const sorted = useMemo(() => [...withAnchor].sort((a, b) => (a.date < b.date ? -1 : 1)), [withAnchor])
  const avgSeries = useMemo(() => rollingAverage(sorted), [sorted])
  const currentAvg = avgSeries[avgSeries.length - 1]?.value
  const displayValue = useSpringValue(currentAvg)

  const recentDaily = sorted.slice(-daysShown)
  const recentAvg = avgSeries.slice(-daysShown)

  const { dots, dailyPath, avgPath, width, height } = useMemo(() => {
    const w = 400
    const h = 128
    if (recentDaily.length < 2) {
      return { dots: [] as { x: number; y: number }[], dailyPath: '', avgPath: '', width: w, height: h }
    }

    const values = recentDaily.map((p) => p.value).concat(recentAvg.map((p) => p.value))
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = (max - min) * 0.35 || 1
    const lo = min - pad
    const hi = max + pad

    const xFor = (i: number, n: number) => (n <= 1 ? 0 : (i / (n - 1)) * w)
    const yFor = (v: number) => h - ((v - lo) / (hi - lo)) * h

    const dotXY = recentDaily.map((p, i) => ({ x: xFor(i, recentDaily.length), y: yFor(p.value) }))

    let daily = ''
    dotXY.forEach((p, i) => {
      daily += i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`
    })

    const avgXY = recentAvg.map((p, i) => ({ x: xFor(i, recentAvg.length), y: yFor(p.value) }))
    let avg = ''
    avgXY.forEach((p, i) => {
      if (i === 0) avg += `M ${p.x} ${p.y}`
      else {
        const prev = avgXY[i - 1]
        const midX = (prev.x + p.x) / 2
        avg += ` C ${midX} ${prev.y}, ${midX} ${p.y}, ${p.x} ${p.y}`
      }
    })

    return { dots: dotXY, dailyPath: daily, avgPath: avg, width: w, height: h }
  }, [recentDaily, recentAvg])

  const lastDot = dots[dots.length - 1]

  return (
    <div className="relative">
      <div className="relative z-10 flex items-baseline justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          {label}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          7-day average
        </span>
      </div>

      <div className="relative mt-2 h-32 sm:h-36">
        {dots.length >= 2 && (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label={`${label} trend over last ${recentDaily.length} days`}
          >
            <path d={dailyPath} fill="none" stroke="var(--color-ink-muted)" strokeOpacity={0.28} strokeWidth={1} />
            {dots.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={1.6} fill="var(--color-ink-muted)" fillOpacity={0.45} />
            ))}
            <path
              d={avgPath}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(36,48,79,0.25))' }}
            />
            {lastDot && (
              <>
                <circle cx={lastDot.x} cy={lastDot.y} r={7} fill="var(--color-accent)" fillOpacity={0.14} />
                <circle cx={lastDot.x} cy={lastDot.y} r={3.5} fill="var(--color-accent)" />
              </>
            )}
          </svg>
        )}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-surface)_0%,var(--color-surface)_46%,transparent_78%)]" />

        <div className="absolute bottom-0 left-0 flex items-end gap-2">
          {currentAvg === undefined ? (
            <span className="font-data text-5xl font-bold text-[var(--color-ink-muted)] sm:text-6xl">—</span>
          ) : (
            <span
              className="font-data text-5xl font-bold tabular-nums text-[var(--color-ink)] sm:text-6xl"
              style={{ filter: 'drop-shadow(0 3px 8px rgba(23,23,26,0.10))' }}
            >
              {displayValue.toFixed(decimals)}
            </span>
          )}
          <span className="pb-1.5 font-data text-base text-[var(--color-ink-muted)] sm:text-lg">{unit}</span>
        </div>
      </div>

      {recentDaily.length < 2 && (
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Log a few days to see the trend line form.</p>
      )}
    </div>
  )
}
