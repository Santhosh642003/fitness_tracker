import type { AppState, ChecklistKey } from '../lib/types'
import { AverageLine } from '../components/AverageLine'
import { ScoreRing } from '../components/ScoreRing'
import { CheckMark } from '../components/CheckMark'
import { weightPoints } from '../lib/average'
import { CHECKLIST_ITEMS, PROGRAM, TARGETS } from '../lib/seed'
import {
  todayISO,
  dayKeyOf,
  phaseOf,
  daysIntoCut,
  PLAN_END,
  daysBetween,
  BASELINE_DATE,
  BASELINE_WEIGHT_KG,
} from '../lib/dates'
import { phaseAccent } from '../lib/status'
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
  const accent = phaseAccent(phase)
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
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_280px] lg:gap-14">
      <div className="flex flex-col gap-10">
        {/* Hero */}
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-6 shadow-[0_1px_2px_rgba(23,23,26,0.04)] sm:px-7 sm:py-7">
          <AverageLine
            points={points}
            unit="kg"
            label="Body weight"
            anchorPoint={{ date: BASELINE_DATE, value: BASELINE_WEIGHT_KG }}
          />
          <div className="mt-5 flex items-center justify-between border-t border-[var(--color-line)] pt-4 text-xs">
            <span className="text-[var(--color-ink-muted)]">
              Day {daysIntoCut(today)} of the cut · {daysLeft} days to Dec 15
            </span>
            <span className="flex items-center gap-1.5 font-medium" style={{ color: accent.color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent.color }} aria-hidden="true" />
              {accent.label}
            </span>
          </div>
        </section>

        {/* Scorecard */}
        <section>
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              Today's scorecard
            </h2>
            <ScoreRing score={scoreToday} max={CHECKLIST_ITEMS.length} />
          </div>
          <div className="flex flex-col divide-y divide-[var(--color-line)] border-b border-[var(--color-line)]">
            {CHECKLIST_ITEMS.map((item) => {
              const checked = !!log.checklist[item.key]
              return (
                <button
                  key={item.key}
                  onClick={() => toggleItem(item.key)}
                  className="flex items-center justify-between gap-3 py-4 text-left"
                >
                  <span>
                    <span
                      className={`block text-base font-semibold transition-colors ${
                        checked ? 'text-[var(--color-ink-muted)] line-through decoration-[1.5px]' : 'text-[var(--color-ink)]'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`block text-xs transition-opacity ${
                        checked ? 'text-[var(--color-ink-muted)] opacity-60' : 'text-[var(--color-ink-muted)]'
                      }`}
                    >
                      {item.hint}
                    </span>
                  </span>
                  <CheckMark checked={checked} />
                </button>
              )
            })}
          </div>
        </section>

        {/* Workout */}
        <section>
          <h2 className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Today's workout
          </h2>
          <button
            onClick={() => onNavigate('program')}
            className="w-full border-t border-[var(--color-line)] py-4 text-left"
          >
            {dayPlan.workoutName ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-semibold">{dayPlan.workoutName}</span>
                  <span className="font-data text-xs text-[var(--color-ink-muted)]">{dayPlan.time}</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-[var(--color-ink-muted)]">
                  {dayPlan.exercises.slice(0, 3).map((e) => (
                    <li key={e.name} className="flex items-baseline justify-between">
                      <span>{e.name}</span>
                      <span className="font-data text-xs">
                        {e.sets}×{e.repRange}
                      </span>
                    </li>
                  ))}
                  {dayPlan.exercises.length > 3 && (
                    <li className="pt-1 text-xs font-medium text-[var(--color-accent)]">
                      +{dayPlan.exercises.length - 3} more →
                    </li>
                  )}
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

      {/* Rail */}
      <aside className="flex flex-col gap-8 lg:sticky lg:top-20">
        <div>
          <h2 className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Daily targets
          </h2>
          <div className="grid grid-cols-3 divide-x divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {[
              { label: 'Kcal', value: TARGETS.caloriesTarget.toLocaleString() },
              { label: 'Protein g', value: TARGETS.proteinMinG },
              { label: 'Steps', value: TARGETS.stepsTarget.toLocaleString() },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-0.5 py-3">
                <span className="font-data text-xl font-bold leading-none tracking-tight">{m.value}</span>
                <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border-l-2 py-1 pl-4" style={{ borderColor: accent.color }}>
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Plan phase
          </div>
          <div className="mt-1 text-sm font-semibold" style={{ color: accent.color }}>
            {accent.label}
          </div>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
            {phase === 'calibration'
              ? 'Weeks 1–2: main lifts run 2 sets instead of 3, no extra cardio yet.'
              : phase === 'full-program'
                ? 'Full volume. Double progression on every lift — beat last time.'
                : phase === 'complete'
                  ? 'The 15-week window has closed.'
                  : 'The cut begins Sep 1 — this is a preview of the plan.'}
          </p>
        </div>
      </aside>
    </div>
  )
}
