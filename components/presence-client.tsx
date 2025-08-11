"use client"

import * as React from "react"
import { DataAPI, getCurrentUser } from "@/lib/data"

/**
 * PresenceClient pings the current user's lastActiveAt:
 * - immediately on mount (post-login)
 * - on window focus and when tab becomes visible
 * - on user interactions (mousemove/keydown/click/scroll/touch) throttled
 * - every intervalMs (heartbeat)
 */
export function PresenceClient({
  intervalMs = 12_000,
  interactionThrottleMs = 10_000,
}: {
  intervalMs?: number
  interactionThrottleMs?: number
}) {
  const me = getCurrentUser()
  const lastInteractionRef = React.useRef(0)

  React.useEffect(() => {
    if (!me) return

    const ping = () => DataAPI.presence.ping(me.id)

    // Immediate ping on mount/login
    ping()

    const onFocus = () => ping()
    const onVisible = () => {
      if (document.visibilityState === "visible") ping()
    }

    // Throttled interaction pings
    const onInteract = () => {
      const now = Date.now()
      if (now - lastInteractionRef.current >= interactionThrottleMs) {
        lastInteractionRef.current = now
        ping()
      }
    }

    const onBeforeUnload = () => {
      try {
        ping()
      } catch {}
    }

    // Events
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("beforeunload", onBeforeUnload)

    // Common interactions
    const interactions = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const
    interactions.forEach((ev) => window.addEventListener(ev, onInteract, { passive: true }))

    const t = window.setInterval(ping, intervalMs)

    return () => {
      window.clearInterval(t)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("beforeunload", onBeforeUnload)
      interactions.forEach((ev) => window.removeEventListener(ev, onInteract))
    }
  }, [me, intervalMs, interactionThrottleMs])

  return null
}
