import type { AdjustStatus, DailyLog } from './types'
import { addDays } from './dates'

export interface DatedValue {
  date: string
  value: number
}

/** Trailing 7-day simple average of weight, keyed by date, only where at least 1 point exists in window. */
export function rollingAverage(points: DatedValue[], windowDays = 7): DatedValue[] {
  const sorted = [...points].sort((a, b) => (a.date < b.date ? -1 : 1))
  const result: DatedValue[] = []
  for (let i = 0; i < sorted.length; i++) {
    const end = sorted[i].date
    const start = addDays(end, -(windowDays - 1))
    const windowPoints = sorted.filter((p) => p.date >= start && p.date <= end)
    const avg = windowPoints.reduce((s, p) => s + p.value, 0) / windowPoints.length
    result.push({ date: end, value: avg })
  }
  return result
}

export function latestAverage(points: DatedValue[], windowDays = 7): number | undefined {
  if (points.length === 0) return undefined
  const series = rollingAverage(points, windowDays)
  return series[series.length - 1]?.value
}

export function weightPoints(dailyLogs: Record<string, DailyLog>): DatedValue[] {
  return Object.values(dailyLogs)
    .filter((l): l is DailyLog & { weightKg: number } => typeof l.weightKg === 'number')
    .map((l) => ({ date: l.date, value: l.weightKg }))
}

/** kg/week rate of change between the 7-day average `daysAgo` days back and today's 7-day average. */
export function weeklyRateKgPerWeek(points: DatedValue[], asOfDate: string, weeksBack = 1): number | undefined {
  const series = rollingAverage(points)
  if (series.length === 0) return undefined
  const byDate = new Map(series.map((p) => [p.date, p.value]))
  const endVal = byDate.get(asOfDate) ?? [...series].reverse().find((p) => p.date <= asOfDate)?.value
  const startDate = addDays(asOfDate, -7 * weeksBack)
  const startVal = [...series].reverse().find((p) => p.date <= startDate)?.value
  if (endVal === undefined || startVal === undefined) return undefined
  return ((startVal - endVal) / weeksBack)
}

export interface AdjustmentResult {
  status: AdjustStatus
  headline: string
  detail: string
}

/**
 * Implements plan Section 10. Loss = positive kg/week (weight going down).
 * weeksUnderTarget = consecutive most-recent weeks with loss < 0.3 kg/week.
 */
export function evaluateAdjustment(input: {
  weekNumber: number
  lossKgPerWeek?: number
  consecutiveWeeksUnder03: number
  waistTrendingDown?: boolean
  strengthCollapsing?: boolean
  poorSleep?: boolean
}): AdjustmentResult {
  const { weekNumber, lossKgPerWeek, consecutiveWeeksUnder03, waistTrendingDown, strengthCollapsing, poorSleep } = input

  if (strengthCollapsing || poorSleep) {
    return {
      status: 'adjust',
      headline: 'Adjust: recovery is the limiter',
      detail: 'Strength collapsing or poor sleep — add food, reduce cardio, consider an extra recovery day.',
    }
  }

  if (lossKgPerWeek === undefined) {
    return { status: 'hold', headline: 'Not enough data yet', detail: 'Log weight for a full week to see a trend.' }
  }

  if (lossKgPerWeek > 1.0 && weekNumber > 2) {
    return {
      status: 'watch',
      headline: 'Watch: losing faster than target',
      detail: 'Over 1.0 kg/week after week 2 — add 100–200 kcal/day, especially if energy or strength is falling.',
    }
  }

  if (lossKgPerWeek >= 0.4 && lossKgPerWeek <= 0.9) {
    return {
      status: 'hold',
      headline: 'Hold: right on target',
      detail: 'Loss is 0.4–0.9 kg/week and gym/hunger are okay — keep calories, cardio, and steps unchanged.',
    }
  }

  if (lossKgPerWeek < 0.3) {
    if (waistTrendingDown) {
      return {
        status: 'hold',
        headline: 'Hold: scale stalled, waist still falling',
        detail: "Scale stalled but waist is dropping — don't change anything yet.",
      }
    }
    if (consecutiveWeeksUnder03 >= 2) {
      return {
        status: 'adjust',
        headline: 'Adjust: two weeks under target',
        detail: 'Under 0.3 kg/week for two consecutive weeks — audit tracking first; if accurate, drop to 1,850–1,900 kcal OR add ~2,000 daily steps.',
      }
    }
    return {
      status: 'watch',
      headline: 'Watch: one slow week',
      detail: 'Under 0.3 kg/week for one week — likely water fluctuation. Do nothing yet.',
    }
  }

  return {
    status: 'hold',
    headline: 'Hold: on pace',
    detail: 'Trend is close to target range. Keep the plan steady.',
  }
}
