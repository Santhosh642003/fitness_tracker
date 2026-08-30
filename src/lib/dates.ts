import type { DayKey } from './types'

export const PLAN_START = '2026-09-01'
export const PLAN_END = '2026-12-15'
export const BASELINE_DATE = '2026-08-30'
export const BASELINE_WEIGHT_KG = 80.8

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(s: string, days: number): string {
  const d = parseISODate(s)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function daysBetween(a: string, b: string): number {
  const da = parseISODate(a)
  const db = parseISODate(b)
  return Math.round((db.getTime() - da.getTime()) / 86400000)
}

export function todayISO(): string {
  return toISODate(new Date())
}

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export function dayKeyOf(dateISO: string) {
  return DAY_KEYS[parseISODate(dateISO).getDay()]
}

// Plan week 1 starts on PLAN_START (a Tuesday, Sep 1 2026). We define "program weeks"
// as 7-day blocks anchored to PLAN_START regardless of weekday, since that's how the
// brief phrases "Week 1-2 calibration", "Week 3 onward".
export function planWeekNumber(dateISO: string): number {
  const diff = daysBetween(PLAN_START, dateISO)
  return Math.floor(diff / 7) + 1
}

export function planWeekStart(dateISO: string): string {
  const diff = daysBetween(PLAN_START, dateISO)
  const weekIndex = Math.floor(diff / 7)
  return addDays(PLAN_START, weekIndex * 7)
}

export function isBeforePlanStart(dateISO: string): boolean {
  return daysBetween(dateISO, PLAN_START) > 0
}

export type Phase = 'pre-plan' | 'calibration' | 'full-program' | 'complete'

export function phaseOf(dateISO: string): Phase {
  if (isBeforePlanStart(dateISO)) return 'pre-plan'
  if (daysBetween(dateISO, PLAN_END) < 0) return 'complete'
  const week = planWeekNumber(dateISO)
  if (week <= 2) return 'calibration'
  return 'full-program'
}

export function phaseLabel(phase: Phase): string {
  switch (phase) {
    case 'pre-plan':
      return 'Before start'
    case 'calibration':
      return 'Calibration / re-entry'
    case 'full-program':
      return 'Full program'
    case 'complete':
      return 'Plan complete'
  }
}

export function weekRangeLabel(dateISO: string): string {
  if (isBeforePlanStart(dateISO)) {
    const startD = parseISODate(PLAN_START)
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `Starts ${fmt(startD)}`
  }
  const start = planWeekStart(dateISO)
  const end = addDays(start, 6)
  const startD = parseISODate(start)
  const endD = parseISODate(end)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const week = planWeekNumber(dateISO)
  return `Week ${week} · ${fmt(startD)}–${fmt(endD)}`
}

export function mostRecentDateForWeekday(target: DayKey, refDateISO: string): string {
  let d = refDateISO
  for (let i = 0; i < 7; i++) {
    if (dayKeyOf(d) === target) return d
    d = addDays(d, -1)
  }
  return refDateISO
}

export function daysIntoCut(dateISO: string): number {
  return Math.max(0, daysBetween(PLAN_START, dateISO) + 1)
}
