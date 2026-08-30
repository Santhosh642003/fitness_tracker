import type { AppState } from './types'

const STORAGE_KEY = 'the-average:v1'

export function defaultState(): AppState {
  return {
    dailyLogs: {},
    workoutLogs: {},
    groceryState: {},
    settings: {
      zip: '',
      budgetCeilingMonthly: 200,
      budgetSoftWeekly: 46,
      serverUrl: 'http://localhost:8787',
    },
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw)
    return { ...defaultState(), ...parsed, settings: { ...defaultState().settings, ...parsed.settings } }
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function exportStateFile(state: AppState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `the-average-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function parseImportedState(text: string): AppState {
  const parsed = JSON.parse(text)
  return { ...defaultState(), ...parsed, settings: { ...defaultState().settings, ...parsed.settings } }
}
