import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeScript } from "@/components/theme/theme-script"
import { SiteHeader } from "@/components/site-header/site-header"
import { WalletProvider } from "@/components/wallet/wallet-provider"
import "@/styles/globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "VerdAnt",
    template: "%s · VerdAnt",
  },
  description: "Open agricultural technology and financial infrastructure built on Stellar.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7faf4" },
    { media: "(prefers-color-scheme: dark)", color: "#101410" },
  ],
}

export default function RootLayout({ children }: { children: import("react").ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <WalletProvider>
          <SiteHeader />
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
