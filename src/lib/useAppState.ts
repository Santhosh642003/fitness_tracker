import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppState } from './types'
import { loadState, saveState } from './storage'

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState())
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    saveState(state)
  }, [state])

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev)
      saveState(next)
      return next
    })
  }, [])

  return { state, setState: update }
}
