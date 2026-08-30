import type { AppState, WeeklySummary } from './types'
import { addDays, planWeekStart } from './dates'

export function computeWeeklySummaries(state: AppState): WeeklySummary[] {
  const weeks = new Map<string, WeeklySummary & { _weights: number[]; _cals: number[]; _prot: number[]; _steps: number[] }>()

  for (const log of Object.values(state.dailyLogs)) {
    const weekStart = planWeekStart(log.date)
    if (!weeks.has(weekStart)) {
      weeks.set(weekStart, { weekStart, _weights: [], _cals: [], _prot: [], _steps: [] })
    }
    const w = weeks.get(weekStart)!
    if (typeof log.weightKg === 'number') w._weights.push(log.weightKg)
    if (typeof log.calories === 'number') w._cals.push(log.calories)
    if (typeof log.proteinG === 'number') w._prot.push(log.proteinG)
    if (typeof log.steps === 'number') w._steps.push(log.steps)
    if (typeof log.waistCm === 'number') w.waistCm = log.waistCm
  }

  for (const log of Object.values(state.workoutLogs)) {
    if (!log.completed) continue
    const weekStart = planWeekStart(log.date)
    if (!weeks.has(weekStart)) {
      weeks.set(weekStart, { weekStart, _weights: [], _cals: [], _prot: [], _steps: [] })
    }
    const w = weeks.get(weekStart)!
    w.gymDaysCompleted = (w.gymDaysCompleted ?? 0) + 1
  }

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined)

  return [...weeks.values()]
    .map((w) => ({
      weekStart: w.weekStart,
      avgWeightKg: avg(w._weights),
      waistCm: w.waistCm,
      avgCalories: avg(w._cals),
      avgProteinG: avg(w._prot),
      avgSteps: avg(w._steps),
      gymDaysCompleted: w.gymDaysCompleted,
    }))
    .sort((a, b) => (a.weekStart < b.weekStart ? -1 : 1))
}

export function weekEndOf(weekStart: string) {
  return addDays(weekStart, 6)
}
