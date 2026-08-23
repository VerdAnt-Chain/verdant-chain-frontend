"use client"

import { useEffect } from "react"
import { installClickSounds } from "@/lib/ui/sound"

/** Mounts global M3-style interaction click sounds for the whole app. */
export function ClickSounds() {
  useEffect(() => {
    return installClickSounds()
  }, [])
  return null
}
