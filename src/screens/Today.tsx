import type { AppState, ChecklistKey } from '../lib/types'
import { AverageLine } from '../components/AverageLine'
import { weightPoints } from '../lib/average'
import { CHECKLIST_ITEMS, PROGRAM, TARGETS } from '../lib/seed'
import { todayISO, dayKeyOf, phaseOf, phaseLabel, daysIntoCut, PLAN_END, daysBetween } from '../lib/dates'
import type { Tab } from '../components/TopBar'

export function Today({
  state,
  setState,
  onNavigate,
}: {
  state: AppState
  setState: (updater: (prev: AppState) => AppState) => void
  onNavigate: (t: Tab) => void
}) {
  const today = todayISO()
  const log = state.dailyLogs[today] ?? { date: today, checklist: {} }
  const dayPlan = PROGRAM.find((d) => d.key === dayKeyOf(today))!
  const phase = phaseOf(today)
  const points = weightPoints(state.dailyLogs)
  const daysLeft = Math.max(0, daysBetween(today, PLAN_END))

  function toggleItem(key: ChecklistKey) {
    setState((prev) => {
      const prevLog = prev.dailyLogs[today] ?? { date: today, checklist: {} }
      const nextChecklist = { ...prevLog.checklist, [key]: !prevLog.checklist[key] }
      return {
        ...prev,
        dailyLogs: { ...prev.dailyLogs, [today]: { ...prevLog, checklist: nextChecklist } },
      }
    })
  }

  const scoreToday = CHECKLIST_ITEMS.filter((i) => log.checklist[i.key]).length

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-6">
        <AverageLine points={points} unit="kg" label="Body weight" />
        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-ink-muted)]">
          <span>Day {daysIntoCut(today)} of the cut · {daysLeft} days to Dec 15</span>
          <span className="rounded-full bg-[var(--color-bg)] px-2 py-1 font-medium text-[var(--color-ink)]">
            {phaseLabel(phase)}
          </span>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
            Today's scorecard
          </h2>
          <span className="font-data text-sm text-[var(--color-ink-muted)]">{scoreToday}/6</span>
        </div>
        <div className="flex flex-col divide-y divide-[var(--color-line)] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
          {CHECKLIST_ITEMS.map((item) => {
            const checked = !!log.checklist[item.key]
            return (
              <button
                key={item.key}
                onClick={() => toggleItem(item.key)}
                className="flex items-center justify-between gap-3 px-4 py-4 text-left"
              >
                <span>
                  <span className="block text-[15px] font-medium">{item.label}</span>
                  <span className="block text-xs text-[var(--color-ink-muted)]">{item.hint}</span>
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    checked
                      ? 'border-[var(--color-status-hold)] bg-[var(--color-status-hold)] text-white'
                      : 'border-[var(--color-line)] text-transparent'
                  } ${checked ? 'checkbox-pop' : ''}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Calories', value: TARGETS.caloriesTarget, unit: 'kcal' },
          { label: 'Protein', value: TARGETS.proteinMinG, unit: 'g min' },
          { label: 'Steps', value: TARGETS.stepsTarget, unit: '' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] py-3">
            <div className="font-data text-xl font-semibold">{m.value.toLocaleString()}</div>
            <div className="text-xs text-[var(--color-ink-muted)]">
              {m.label} {m.unit}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          Today's workout
        </h2>
        <button
          onClick={() => onNavigate('program')}
          className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4 text-left"
        >
          {dayPlan.workoutName ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-semibold">{dayPlan.workoutName}</span>
                <span className="font-data text-sm text-[var(--color-ink-muted)]">{dayPlan.time}</span>
              </div>
              <ul className="mt-2 space-y-0.5 text-sm text-[var(--color-ink-muted)]">
                {dayPlan.exercises.slice(0, 3).map((e) => (
                  <li key={e.name}>
                    {e.name} · {e.sets}×{e.repRange}
                  </li>
                ))}
                {dayPlan.exercises.length > 3 && <li>+{dayPlan.exercises.length - 3} more →</li>}
              </ul>
            </>
          ) : (
            <div>
              <div className="text-lg font-semibold">Rest day</div>
              <div className="text-sm text-[var(--color-ink-muted)]">
                Easy walking only. Meal prep + weigh-in review.
              </div>
            </div>
          )}
        </button>
      </section>
    </div>
  )
}
