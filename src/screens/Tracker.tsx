import { useMemo, useState } from 'react'
import type { AppState, AdjustStatus } from '../lib/types'
import { AverageLine } from '../components/AverageLine'
import { weightPoints } from '../lib/average'
import { evaluateAdjustment } from '../lib/average'
import { computeWeeklySummaries, weekEndOf } from '../lib/weekly'
import { todayISO, planWeekNumber } from '../lib/dates'
import { WEIGHT_CHECKPOINTS, WEIGHT_GOALS, HARD_FLOOR_KCAL } from '../lib/seed'

const STATUS_COLORS: Record<AdjustStatus, string> = {
  hold: 'var(--color-status-hold)',
  watch: 'var(--color-status-watch)',
  adjust: 'var(--color-status-adjust)',
}

const STATUS_LABELS: Record<AdjustStatus, string> = {
  hold: 'Hold',
  watch: 'Watch',
  adjust: 'Adjust',
}

export function Tracker({
  state,
  setState,
}: {
  state: AppState
  setState: (updater: (prev: AppState) => AppState) => void
}) {
  const today = todayISO()
  const log = state.dailyLogs[today] ?? { date: today, checklist: {} }
  const [weightInput, setWeightInput] = useState(log.weightKg?.toString() ?? '')
  const [waistInput, setWaistInput] = useState(log.waistCm?.toString() ?? '')

  const points = weightPoints(state.dailyLogs)
  const weeklySummaries = useMemo(() => computeWeeklySummaries(state), [state])

  function saveEntry() {
    const w = parseFloat(weightInput)
    const waist = parseFloat(waistInput)
    setState((prev) => {
      const prevLog = prev.dailyLogs[today] ?? { date: today, checklist: {} }
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [today]: {
            ...prevLog,
            weightKg: Number.isFinite(w) ? w : prevLog.weightKg,
            waistCm: Number.isFinite(waist) ? waist : prevLog.waistCm,
          },
        },
      }
    })
  }

  const adjustment = useMemo(() => {
    const withWeight = weeklySummaries.filter((w) => typeof w.avgWeightKg === 'number')
    const losses: number[] = []
    for (let i = 1; i < withWeight.length; i++) {
      losses.push(withWeight[i - 1].avgWeightKg! - withWeight[i].avgWeightKg!)
    }
    const lossKgPerWeek = losses[losses.length - 1]

    let consecutiveWeeksUnder03 = 0
    for (let i = losses.length - 1; i >= 0; i--) {
      if (losses[i] < 0.3) consecutiveWeeksUnder03++
      else break
    }

    let waistTrendingDown: boolean | undefined
    const withWaist = weeklySummaries.filter((w) => typeof w.waistCm === 'number')
    if (withWaist.length >= 2) {
      waistTrendingDown = withWaist[withWaist.length - 1].waistCm! < withWaist[withWaist.length - 2].waistCm!
    }

    return evaluateAdjustment({
      weekNumber: planWeekNumber(today),
      lossKgPerWeek,
      consecutiveWeeksUnder03,
      waistTrendingDown,
    })
  }, [weeklySummaries, today])

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-6">
        <AverageLine points={points} unit="kg" label="Body weight" daysShown={21} />
      </section>

      <section
        className="rounded-2xl border px-5 py-4"
        style={{ borderColor: STATUS_COLORS[adjustment.status], background: `${STATUS_COLORS[adjustment.status]}0d` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: STATUS_COLORS[adjustment.status] }}
            aria-hidden="true"
          />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: STATUS_COLORS[adjustment.status] }}>
            {STATUS_LABELS[adjustment.status]}
          </span>
        </div>
        <p className="mt-1 text-[15px] font-medium">{adjustment.headline}</p>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{adjustment.detail}</p>
        <p className="mt-3 border-t border-[var(--color-line)] pt-2 text-xs text-[var(--color-ink-muted)]">
          Hard floor: never independently go below {HARD_FLOOR_KCAL.low}–{HARD_FLOOR_KCAL.high} kcal while training
          6 days/week. Persistent exhaustion, fainting, or chest pain → talk to a clinician, not the app.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          Log today
        </h2>
        <div className="flex gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
          <label className="flex-1">
            <span className="mb-1 block text-xs text-[var(--color-ink-muted)]">Weight (kg)</span>
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-data text-base"
              placeholder="80.8"
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs text-[var(--color-ink-muted)]">Waist (cm)</span>
            <input
              type="number"
              step="0.1"
              value={waistInput}
              onChange={(e) => setWaistInput(e.target.value)}
              className="w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-data text-base"
              placeholder="86.0"
            />
          </label>
          <button
            onClick={saveEntry}
            className="mt-5 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white"
          >
            Save
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          Plan checkpoints
        </h2>
        <p className="mb-2 text-xs text-[var(--color-ink-muted)]">
          Baseline {WEIGHT_GOALS.baselineKg} kg (Aug 30) → primary target {WEIGHT_GOALS.primaryTargetKg} kg, stretch{' '}
          {WEIGHT_GOALS.stretchTargetKg} kg by Dec 15.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase text-[var(--color-ink-muted)]">
                <th className="px-4 py-2 font-medium">Checkpoint</th>
                <th className="px-4 py-2 font-medium">Target range</th>
              </tr>
            </thead>
            <tbody>
              {WEIGHT_CHECKPOINTS.map((c) => (
                <tr key={c.date} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="px-4 py-2">{c.label}</td>
                  <td className="px-4 py-2 font-data">
                    {c.loKg === c.hiKg ? `${c.loKg} kg` : `${c.loKg}–${c.hiKg} kg`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          Weekly log
        </h2>
        {weeklySummaries.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">No weeks logged yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase text-[var(--color-ink-muted)]">
                  <th className="px-3 py-2 font-medium">Week</th>
                  <th className="px-3 py-2 font-medium">Avg wt</th>
                  <th className="px-3 py-2 font-medium">Waist</th>
                  <th className="px-3 py-2 font-medium">Avg kcal</th>
                  <th className="px-3 py-2 font-medium">Avg protein</th>
                  <th className="px-3 py-2 font-medium">Avg steps</th>
                  <th className="px-3 py-2 font-medium">Gym</th>
                </tr>
              </thead>
              <tbody className="font-data">
                {[...weeklySummaries].reverse().map((w) => (
                  <tr key={w.weekStart} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 font-sans">
                      {w.weekStart.slice(5)}–{weekEndOf(w.weekStart).slice(5)}
                    </td>
                    <td className="px-3 py-2">{w.avgWeightKg?.toFixed(1) ?? '—'}</td>
                    <td className="px-3 py-2">{w.waistCm?.toFixed(1) ?? '—'}</td>
                    <td className="px-3 py-2">{w.avgCalories ? Math.round(w.avgCalories) : '—'}</td>
                    <td className="px-3 py-2">{w.avgProteinG ? Math.round(w.avgProteinG) : '—'}</td>
                    <td className="px-3 py-2">{w.avgSteps ? Math.round(w.avgSteps) : '—'}</td>
                    <td className="px-3 py-2">{w.gymDaysCompleted ?? 0}/6</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
