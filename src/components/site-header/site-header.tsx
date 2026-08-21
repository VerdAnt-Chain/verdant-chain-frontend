import Link from "next/link"
import { AuthButton, ThemeToggle } from "@/components/ui"
import styles from "./site-header.module.css"

const navLinks = [
  { href: "/discover", label: "AgriScout" },
  { href: "/verify", label: "Verification" },
  { href: "/equipment", label: "Equipment" },
  { href: "/financing", label: "Financing" },
  { href: "/livestock", label: "Livestock" },
]

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.wordmark} aria-label="VerdAnt home">
          <span className={styles.logo}>V</span>
          <strong>VerdAnt</strong>
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
          <Link href="/design-system" className={styles.navLink}>
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
