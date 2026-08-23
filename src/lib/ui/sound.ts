/**
 * M3 Expressive-style interaction sounds.
 * Modern, crisp UI clicks — short bright ticks for taps, a fuller
 * two-layer "select" for major choices. No muffled/organic synthesis.
 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null
    if (!ctx) {
      const AudioCtx =
        (
          window as unknown as {
            AudioContext: typeof AudioContext
            webkitAudioContext: typeof AudioContext
          }
        ).AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return null
      ctx = new AudioCtx()
    }
    if (ctx.state === "suspended") void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export type ClickSoundKind = "tap" | "select"

/** Crisp modern tick — short bright blip with fast decay. */
function tick(c: AudioContext, at: number, freq: number, vol: number, dur: number) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  const hp = c.createBiquadFilter()
  hp.type = "highpass"
  hp.frequency.value = 700
  osc.type = "triangle"
  osc.frequency.setValueAtTime(freq, at)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.62, at + dur)
  gain.gain.setValueAtTime(vol, at)
  gain.gain.exponentialRampToValueAtTime(0.0008, at + dur)
  osc.connect(hp).connect(gain).connect(c.destination)
  osc.start(at)
  osc.stop(at + dur)
}

/** Soft low body — gives the select variant weight without muffle. */
function thock(c: AudioContext, at: number, vol: number) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  const lp = c.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.value = 900
  osc.type = "sine"
  osc.frequency.setValueAtTime(280, at)
  osc.frequency.exponentialRampToValueAtTime(130, at + 0.09)
  gain.gain.setValueAtTime(vol, at)
  gain.gain.exponentialRampToValueAtTime(0.0008, at + 0.11)
  osc.connect(lp).connect(gain).connect(c.destination)
  osc.start(at)
  osc.stop(at + 0.11)
}

/** Play an M3-expressive interaction click. */
export function playModernClick(kind: ClickSoundKind = "tap") {
  try {
    const c = getCtx()
    if (!c) return
    const now = c.currentTime
    if (kind === "select") {
      // Fuller, confident selection sound
      tick(c, now, 1750, 0.09, 0.05)
      thock(c, now + 0.012, 0.13)
      tick(c, now + 0.055, 2300, 0.045, 0.04)
    } else {
      // Light, crisp tap
      tick(c, now, 2100, 0.06, 0.038)
    }
  } catch {
    // ignore — audio unavailable
  }
}

/**
 * Global click-sound wiring: any real button/link activation plays a tap,
 * unless opted out via [data-sound="none"] (elements that play their own
 * richer sound, e.g. result cards playing "select").
 */
export function installClickSounds(): () => void {
  if (typeof window === "undefined") return () => {}
  const handler = (e: MouseEvent) => {
    const path = e.composedPath() as HTMLElement[]
    const el = path.find(
      (n) =>
        n instanceof HTMLElement &&
        (n.matches("button, [role='button'], a") || n.dataset?.sound === "select")
    )
    if (!el) return
    if (el.closest("[data-sound='none']")) return
    if (el.dataset?.sound === "select") {
      playModernClick("select")
      return
    }
    playModernClick("tap")
  }
  document.addEventListener("click", handler, true)
  return () => document.removeEventListener("click", handler, true)
}
