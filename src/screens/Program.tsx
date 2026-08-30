import { useMemo, useState } from 'react'
import type { AppState, ExerciseLog, SetLog } from '../lib/types'
import { PROGRAM, calibrationAdjustedSets } from '../lib/seed'
import { todayISO, dayKeyOf, mostRecentDateForWeekday, phaseOf } from '../lib/dates'

function findPreviousExerciseLog(state: AppState, beforeDate: string, exerciseName: string): ExerciseLog | undefined {
  const dates = Object.keys(state.workoutLogs)
    .filter((d) => d < beforeDate)
    .sort()
    .reverse()
  for (const d of dates) {
    const ex = state.workoutLogs[d].exercises.find((e) => e.exerciseName === exerciseName)
    if (ex && ex.sets.some((s) => s.weight > 0 || s.reps > 0)) return ex
  }
  return undefined
}

export function Program({
  state,
  setState,
}: {
  state: AppState
  setState: (updater: (prev: AppState) => AppState) => void
}) {
  const today = todayISO()
  const [selectedDayKey, setSelectedDayKey] = useState(dayKeyOf(today))
  const [selectedDate, setSelectedDate] = useState(today)

  const dayPlan = PROGRAM.find((d) => d.key === selectedDayKey)!
  const phase = phaseOf(selectedDate)
  const isCalibration = phase === 'calibration'

  const existingLog = state.workoutLogs[selectedDate]

  const [draft, setDraft] = useState<Record<string, SetLog[]>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  function setsFor(exerciseName: string, plannedSets: number): SetLog[] {
    if (draft[exerciseName]) return draft[exerciseName]
    const fromLog = existingLog?.exercises.find((e) => e.exerciseName === exerciseName)
    if (fromLog) return fromLog.sets
    return Array.from({ length: plannedSets }, () => ({ weight: 0, reps: 0 }))
  }

  function updateSet(exerciseName: string, plannedSets: number, idx: number, field: keyof SetLog, value: number) {
    setDraft((prev) => {
      const current = prev[exerciseName] ?? setsFor(exerciseName, plannedSets)
      const nextSets = current.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
      return { ...prev, [exerciseName]: nextSets }
    })
  }

  function saveWorkout() {
    const exercises: ExerciseLog[] = dayPlan.exercises.map((ex) => {
      const planned = isCalibration ? calibrationAdjustedSets(ex.sets) : ex.sets
      return {
        exerciseName: ex.name,
        sets: setsFor(ex.name, planned),
        note: notes[ex.name] ?? existingLog?.exercises.find((e) => e.exerciseName === ex.name)?.note,
      }
    })
    setState((prev) => ({
      ...prev,
      workoutLogs: {
        ...prev.workoutLogs,
        [selectedDate]: { date: selectedDate, dayKey: selectedDayKey, exercises, completed: true },
      },
    }))
  }

  const weekdayTabs = useMemo(() => PROGRAM, [])

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="flex gap-1 overflow-x-auto rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] p-1">
          {weekdayTabs.map((d) => (
            <button
              key={d.key}
              onClick={() => {
                setSelectedDayKey(d.key)
                setSelectedDate(mostRecentDateForWeekday(d.key, today))
                setDraft({})
                setNotes({})
              }}
              className={`flex-1 whitespace-nowrap rounded-full px-3 py-2 text-sm ${
                selectedDayKey === d.key ? 'bg-[var(--color-ink)] text-white' : 'text-[var(--color-ink-muted)]'
              }`}
            >
              {d.label.slice(0, 3)}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="text-xs text-[var(--color-ink-muted)]">Log date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value)
              setSelectedDayKey(dayKeyOf(e.target.value))
              setDraft({})
              setNotes({})
            }}
            className="rounded-md border border-[var(--color-line)] px-2 py-1 font-data text-sm"
          />
          {isCalibration && (
            <span className="rounded-full bg-[var(--color-status-watch)]/10 px-2 py-1 text-xs font-medium text-[var(--color-status-watch)]">
              Calibration — reduced volume
            </span>
          )}
        </div>
      </section>

      {!dayPlan.workoutName ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-8 text-center">
          <div className="text-lg font-semibold">Rest day</div>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Easy walking only. No lifting scheduled — meal prep and weigh-in review.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">{dayPlan.workoutName}</h2>
            <span className="font-data text-sm text-[var(--color-ink-muted)]">{dayPlan.time}</span>
          </div>

          <div className="flex flex-col gap-4">
            {dayPlan.exercises.map((ex) => {
              const plannedSets = isCalibration ? calibrationAdjustedSets(ex.sets) : ex.sets
              const sets = setsFor(ex.name, plannedSets)
              const prev = findPreviousExerciseLog(state, selectedDate, ex.name)
              const isCardio = ex.repRange.includes('min')
              return (
                <div key={ex.name} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium">{ex.name}</span>
                    <span className="font-data text-xs text-[var(--color-ink-muted)]">
                      {isCardio ? ex.repRange : `${plannedSets}×${ex.repRange}`}
                    </span>
                  </div>
                  {prev && !isCardio && (
                    <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                      Last time:{' '}
                      <span className="font-data">
                        {prev.sets.map((s) => `${s.weight}×${s.reps}`).join(', ')}
                      </span>
                    </p>
                  )}
                  {isCardio ? (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        value={sets[0]?.reps || ''}
                        onChange={(e) => updateSet(ex.name, plannedSets, 0, 'reps', Number(e.target.value))}
                        placeholder="min"
                        className="w-20 rounded-md border border-[var(--color-line)] px-2 py-1.5 font-data text-sm"
                      />
                      <span className="text-sm text-[var(--color-ink-muted)]">minutes easy pace</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-col gap-2">
                      {sets.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-5 text-xs text-[var(--color-ink-muted)]">{i + 1}</span>
                          <input
                            type="number"
                            value={s.weight || ''}
                            onChange={(e) => updateSet(ex.name, plannedSets, i, 'weight', Number(e.target.value))}
                            placeholder="kg"
                            className="w-20 rounded-md border border-[var(--color-line)] px-2 py-1.5 font-data text-sm"
                          />
                          <span className="text-[var(--color-ink-muted)]">×</span>
                          <input
                            type="number"
                            value={s.reps || ''}
                            onChange={(e) => updateSet(ex.name, plannedSets, i, 'reps', Number(e.target.value))}
                            placeholder="reps"
                            className="w-20 rounded-md border border-[var(--color-line)] px-2 py-1.5 font-data text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    defaultValue={existingLog?.exercises.find((e) => e.exerciseName === ex.name)?.note ?? ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [ex.name]: e.target.value }))}
                    placeholder="Note (form cue, how it felt...)"
                    className="mt-2 w-full rounded-md border border-[var(--color-line)] px-2 py-1.5 text-sm"
                  />
                </div>
              )
            })}
          </div>

          <button
            onClick={saveWorkout}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-white"
          >
            {existingLog?.completed ? 'Update workout log' : 'Save workout as complete'}
          </button>
        </>
      )}
    </div>
  )
}
