"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AuthButton, ThemeToggle } from "@/components/ui"
import styles from "./site-header.module.css"

const navLinks = [
  { href: "/discover", label: "Discover" },
  { href: "/proofs", label: "Verification" },
  { href: "/equipment", label: "Equipment" },
  { href: "/projects", label: "Financing" },
  { href: "/livestock", label: "Livestock" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href))

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.wordmark} aria-label="VerdAnt home">
          <span className={styles.logo}>V</span>
          <strong>VerdAnt</strong>
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.navLink}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/design-system"
            className={styles.navLink}
            aria-current={isActive("/design-system") ? "page" : undefined}
          >
            Design system
          </Link>
        </nav>
        <div className={styles.actions}>
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
