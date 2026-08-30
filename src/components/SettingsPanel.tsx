import { useRef, useState } from 'react'
import type { AppState } from '../lib/types'
import { exportStateFile, parseImportedState } from '../lib/storage'

export function SettingsPanel({
  state,
  setState,
  onClose,
}: {
  state: AppState
  setState: (updater: (prev: AppState) => AppState) => void
  onClose: () => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importedOk, setImportedOk] = useState(false)

  function handleImportFile(f: File) {
    setImportError(null)
    setImportedOk(false)
    f.text()
      .then((text) => {
        const parsed = parseImportedState(text)
        setState(() => parsed)
        setImportedOk(true)
      })
      .catch(() => setImportError('Could not read that file — is it a valid export?'))
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/20" onClick={onClose}>
      <div
        className="h-full w-full max-w-sm overflow-y-auto bg-[var(--color-surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} aria-label="Close settings" className="p-1 text-[var(--color-ink-muted)]">
            ✕
          </button>
        </div>

        <section className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-[var(--color-ink-muted)]">Grocery pricing</h3>
          <label className="mb-1 block text-sm">Zip code</label>
          <input
            type="text"
            inputMode="numeric"
            value={state.settings.zip}
            onChange={(e) =>
              setState((prev) => ({ ...prev, settings: { ...prev.settings, zip: e.target.value } }))
            }
            placeholder="07002"
            className="w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-data text-sm"
          />
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
            Used to fetch localized Walmart pricing for the grocery cart.
          </p>

          <label className="mb-1 mt-4 block text-sm">Price server URL</label>
          <input
            type="text"
            value={state.settings.serverUrl}
            onChange={(e) =>
              setState((prev) => ({ ...prev, settings: { ...prev.settings, serverUrl: e.target.value } }))
            }
            className="w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-data text-sm"
          />
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-[var(--color-ink-muted)]">Budget</h3>
          <label className="mb-1 block text-sm">Monthly ceiling ($)</label>
          <input
            type="number"
            value={state.settings.budgetCeilingMonthly}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                settings: { ...prev.settings, budgetCeilingMonthly: Number(e.target.value) },
              }))
            }
            className="w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-data text-sm"
          />
          <label className="mb-1 mt-4 block text-sm">Weekly soft-check line ($)</label>
          <input
            type="number"
            value={state.settings.budgetSoftWeekly}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                settings: { ...prev.settings, budgetSoftWeekly: Number(e.target.value) },
              }))
            }
            className="w-full rounded-md border border-[var(--color-line)] px-3 py-2 font-data text-sm"
          />
        </section>

        <section>
          <h3 className="mb-2 text-sm font-medium text-[var(--color-ink-muted)]">Data backup</h3>
          <p className="mb-3 text-xs text-[var(--color-ink-muted)]">
            Everything lives in this browser only. Export regularly so a cleared browser can't erase 15 weeks of
            logs.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => exportStateFile(state)}
              className="flex-1 rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white"
            >
              Export data
            </button>
            <button
              onClick={() => fileInput.current?.click()}
              className="flex-1 rounded-md border border-[var(--color-line)] px-3 py-2 text-sm font-medium"
            >
              Import data
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImportFile(f)
              e.target.value = ''
            }}
          />
          {importError && <p className="mt-2 text-xs text-[var(--color-status-adjust)]">{importError}</p>}
          {importedOk && <p className="mt-2 text-xs text-[var(--color-status-hold)]">Import complete.</p>}
        </section>
      </div>
    </div>
  )
}
