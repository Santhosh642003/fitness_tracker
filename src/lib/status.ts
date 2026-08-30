import type { AdjustStatus } from './types'
import type { Phase } from './dates'

export const STATUS_COLORS: Record<AdjustStatus, string> = {
  hold: 'var(--color-status-hold)',
  watch: 'var(--color-status-watch)',
  adjust: 'var(--color-status-adjust)',
}

export const STATUS_LABELS: Record<AdjustStatus, string> = {
  hold: 'Hold',
  watch: 'Watch',
  adjust: 'Adjust',
}

/** Scorecard completion reuses the plan's own hold/watch/adjust language: behind, partial, on track. */
export function scoreStatus(score: number, max: number): AdjustStatus {
  const ratio = score / max
  if (ratio >= 5 / 6 - 0.001) return 'hold'
  if (ratio >= 3 / 6 - 0.001) return 'watch'
  return 'adjust'
}

export function phaseAccent(phase: Phase): { color: string; label: string } {
  switch (phase) {
    case 'calibration':
      return { color: STATUS_COLORS.watch, label: 'Calibration / re-entry' }
    case 'full-program':
      return { color: STATUS_COLORS.hold, label: 'Full program' }
    case 'complete':
      return { color: 'var(--color-accent)', label: 'Plan complete' }
    default:
      return { color: 'var(--color-ink-muted)', label: 'Before start' }
  }
}
