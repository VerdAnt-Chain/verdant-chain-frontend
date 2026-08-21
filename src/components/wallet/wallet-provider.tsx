"use client"

import { useEffect } from "react"
import { syncWallet } from "@/lib/wallet/wallet"
import { loadAuthSession } from "@/lib/wallet/auth"

export function WalletProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadAuthSession()
    syncWallet()
  }, [])
  return <>{children}</>
}
