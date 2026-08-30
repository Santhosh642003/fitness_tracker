import { Logo } from './Logo'
import { weekRangeLabel } from '../lib/dates'

export type Tab = 'today' | 'tracker' | 'program' | 'kitchen'

const TABS: { key: Tab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'tracker', label: 'Tracker' },
  { key: 'program', label: 'Program' },
  { key: 'kitchen', label: 'Kitchen' },
]

export function TopBar({
  active,
  onChange,
  onOpenSettings,
}: {
  active: Tab
  onChange: (t: Tab) => void
  onOpenSettings: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <Logo />
        <span className="hidden text-sm font-medium tracking-tight sm:inline">The Average</span>
        <nav className="ml-2 flex flex-1 gap-1 overflow-x-auto" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              aria-current={active === t.key ? 'page' : undefined}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
                active === t.key
                  ? 'bg-[var(--color-ink)] text-white'
                  : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-line)]/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <span className="hidden font-data text-xs text-[var(--color-ink-muted)] md:inline">
          {weekRangeLabel(today)}
        </span>
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="rounded-full p-2 text-[var(--color-ink-muted)] hover:bg-[var(--color-line)]/60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
      <div className="mx-auto max-w-3xl px-4 pb-2 text-xs font-data text-[var(--color-ink-muted)] md:hidden">
        {weekRangeLabel(today)}
      </div>
    </header>
  )
}
