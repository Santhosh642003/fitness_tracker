import { useMemo, useState } from 'react'
import type { AppState, AdjustStatus } from '../lib/types'
import {
  MEAL_TEMPLATE,
  MEAL_MACROS,
  SWAP_LIST,
  GROCERY_CATALOG,
  DO_NOT_BUY_YET,
  HUNGER_TIPS,
  RED_FLAGS,
} from '../lib/seed'
import { fetchPrices, refreshPrices } from '../lib/api'

const STATUS_COLORS: Record<AdjustStatus, string> = {
  hold: 'var(--color-status-hold)',
  watch: 'var(--color-status-watch)',
  adjust: 'var(--color-status-adjust)',
}

function budgetStatus(ratio: number): AdjustStatus {
  if (ratio < 0.8) return 'hold'
  if (ratio <= 1.0) return 'watch'
  return 'adjust'
}

export function Kitchen({
  state,
  setState,
}: {
  state: AppState
  setState: (updater: (prev: AppState) => AppState) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { zip, serverUrl } = state.settings

  async function doFetch(refresh: boolean) {
    if (!zip) {
      setError('Set a zip code in Settings to fetch live Walmart pricing.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = refresh ? await refreshPrices(serverUrl, zip) : await fetchPrices(serverUrl, zip)
      setState((prev) => {
        const nextGrocery = { ...prev.groceryState }
        for (const item of res.items) {
          nextGrocery[item.id] = {
            ...nextGrocery[item.id],
            id: item.id,
            walmartPrice: item.price,
            walmartLastUpdated: item.lastUpdated,
          }
        }
        return { ...prev, groceryState: nextGrocery }
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach the price server.')
    } finally {
      setLoading(false)
    }
  }

  function setWeeePrice(id: string, price: number) {
    setState((prev) => ({
      ...prev,
      groceryState: {
        ...prev.groceryState,
        [id]: {
          ...prev.groceryState[id],
          id,
          weeePrice: price,
          weeeLastUpdated: new Date().toISOString().slice(0, 10),
        },
      },
    }))
  }

  const priced = useMemo(
    () =>
      GROCERY_CATALOG.map((item) => {
        const g = state.groceryState[item.id]
        const price = g?.walmartPrice ?? item.fallbackPrice
        const isLive = typeof g?.walmartPrice === 'number'
        return { ...item, price, isLive, walmartLastUpdated: g?.walmartLastUpdated, weeePrice: g?.weeePrice, weeeLastUpdated: g?.weeeLastUpdated }
      }),
    [state.groceryState],
  )

  const cartTotal = priced.reduce((sum, i) => sum + i.price, 0)
  const ceiling = state.settings.budgetCeilingMonthly
  const ratio = cartTotal / ceiling
  const status = budgetStatus(ratio)
  const weeklyDelta = cartTotal - state.settings.budgetSoftWeekly
  const remaining = ceiling - cartTotal

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
            Grocery budget
          </h2>
          <button
            onClick={() => doFetch(true)}
            disabled={loading}
            className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs font-medium disabled:opacity-50"
          >
            {loading ? 'Refreshing…' : 'Refresh prices'}
          </button>
        </div>

        <div className="mt-2 flex items-end gap-2">
          <span className="font-data text-4xl font-bold">${cartTotal.toFixed(2)}</span>
          <span className="pb-1 text-sm text-[var(--color-ink-muted)]">of ${ceiling}/mo ceiling</span>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
          <div
            className="h-full transition-all"
            style={{ width: `${Math.min(100, ratio * 100)}%`, background: STATUS_COLORS[status] }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-ink-muted)]">
          <span>
            Remaining this month:{' '}
            <span className="font-data font-medium text-[var(--color-ink)]">${remaining.toFixed(2)}</span>
          </span>
          <span>
            vs ${state.settings.budgetSoftWeekly}/wk soft line:{' '}
            <span
              className="font-data font-medium"
              style={{ color: weeklyDelta > 0 ? 'var(--color-status-adjust)' : 'var(--color-status-hold)' }}
            >
              {weeklyDelta > 0 ? '+' : ''}
              {weeklyDelta.toFixed(2)}
            </span>
          </span>
        </div>
        {!zip && (
          <p className="mt-3 text-xs text-[var(--color-status-watch)]">
            Add a zip code in Settings to pull live Walmart pricing — showing budget-estimate prices for now.
          </p>
        )}
        {error && <p className="mt-3 text-xs text-[var(--color-status-adjust)]">{error}</p>}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          Grocery cart
        </h2>
        <div className="flex flex-col divide-y divide-[var(--color-line)] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
          {priced.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[15px] font-medium">{item.name}</div>
                <div className="text-xs text-[var(--color-ink-muted)]">
                  {item.qtyLabel} · reorder {item.cadence}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-data text-base font-semibold">${item.price.toFixed(2)}</div>
                  <div className="text-[10px] text-[var(--color-ink-muted)]">
                    {item.isLive ? `Walmart · ${item.walmartLastUpdated}` : 'Walmart · estimate'}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <label className="text-[10px] text-[var(--color-ink-muted)]">Weee $</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={item.weeePrice ?? ''}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value)
                      if (Number.isFinite(v)) setWeeePrice(item.id, v)
                    }}
                    className="w-16 rounded-md border border-[var(--color-line)] px-1.5 py-1 font-data text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
          Do not buy yet: {DO_NOT_BUY_YET.join(' · ')}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          Swap list <span className="normal-case text-[var(--color-ink-muted)]">(don't stack)</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {SWAP_LIST.map((s) => (
            <span
              key={s.from}
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
            >
              {s.from} <span className="text-[var(--color-ink-muted)]">↔</span> {s.to}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          Weekly meal template
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase text-[var(--color-ink-muted)]">
                <th className="px-3 py-2 font-medium">Day</th>
                <th className="px-3 py-2 font-medium">Breakfast</th>
                <th className="px-3 py-2 font-medium">Lunch</th>
                <th className="px-3 py-2 font-medium">Pre-gym</th>
                <th className="px-3 py-2 font-medium">Dinner</th>
              </tr>
            </thead>
            <tbody>
              {MEAL_TEMPLATE.map((d) => (
                <tr key={d.day} className="border-b border-[var(--color-line)] last:border-0 align-top">
                  <td className="px-3 py-2 font-medium">{d.day}</td>
                  <td className="px-3 py-2 text-[var(--color-ink-muted)]">{d.breakfast}</td>
                  <td className="px-3 py-2 text-[var(--color-ink-muted)]">{d.lunch}</td>
                  <td className="px-3 py-2 text-[var(--color-ink-muted)]">{d.preGym}</td>
                  <td className="px-3 py-2 text-[var(--color-ink-muted)]">{d.dinner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 font-data text-xs text-[var(--color-ink-muted)]">
          Breakfast ~{MEAL_MACROS.breakfast.kcal}kcal/{MEAL_MACROS.breakfast.proteinG}g · Lunch ~
          {MEAL_MACROS.lunch.kcal}kcal/{MEAL_MACROS.lunch.proteinG}g · Pre-gym ~{MEAL_MACROS.preGym.kcal}kcal/
          {MEAL_MACROS.preGym.proteinG}g · Dinner ~{MEAL_MACROS.dinner.kcal}kcal/{MEAL_MACROS.dinner.proteinG}g ·
          Daily total ~{MEAL_MACROS.dailyTotal.kcal}kcal/{MEAL_MACROS.dailyTotal.proteinLowG}-
          {MEAL_MACROS.dailyTotal.proteinHighG}g protein
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          Hunger & adherence
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-[var(--color-ink-muted)]">
          {HUNGER_TIPS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mt-3 rounded-lg border border-[var(--color-status-adjust)]/30 bg-[var(--color-status-adjust)]/5 px-3 py-2 text-xs text-[var(--color-status-adjust)]">
          Stop and get medical help for: {RED_FLAGS.join(', ')}.
        </p>
      </section>
    </div>
  )
}
