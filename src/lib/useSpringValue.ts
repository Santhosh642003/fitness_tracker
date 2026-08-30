import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Animates a numeric display value toward `target` using simple spring physics
 * (critically-damped-ish), so the Average Line eases rather than snaps.
 */
export function useSpringValue(target: number | undefined, opts?: { stiffness?: number; damping?: number }) {
  const stiffness = opts?.stiffness ?? 120
  const damping = opts?.damping ?? 18
  const [display, setDisplay] = useState(target ?? 0)
  const velocity = useRef(0)
  const raf = useRef<number | null>(null)
  const current = useRef(target ?? 0)

  useEffect(() => {
    if (target === undefined) return

    if (prefersReducedMotion()) {
      current.current = target
      setDisplay(target)
      return
    }

    if (raf.current) cancelAnimationFrame(raf.current)

    let lastTime = performance.now()

    function tick(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      const displacement = current.current - (target as number)
      const springForce = -stiffness * displacement
      const dampingForce = -damping * velocity.current
      const accel = springForce + dampingForce
      velocity.current += accel * dt
      current.current += velocity.current * dt

      if (Math.abs(current.current - (target as number)) < 0.001 && Math.abs(velocity.current) < 0.001) {
        current.current = target as number
        setDisplay(current.current)
        raf.current = null
        return
      }

      setDisplay(current.current)
      raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  return display
}
