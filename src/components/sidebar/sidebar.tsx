"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./sidebar.module.css"

const ACCOUNT_STORAGE_KEY = "verdant.sidebar.accountOpen"
const EXPLORE_STORAGE_KEY = "verdant.sidebar.exploreOpen"

function HomeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function TractorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="7" cy="17" r="4" />
      <circle cx="18" cy="18" r="3" />
      <path d="M10 17h5M4 13V6h6l2 5" />
    </svg>
  )
}

function SproutIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20v-8" />
      <path d="M12 12c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z" />
      <path d="M12 12c0-3-2-5-5-5 0 3 2 5 5 5z" />
    </svg>
  )
}

function PawIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="7" cy="9" r="1.6" />
      <circle cx="12" cy="7" r="1.6" />
      <circle cx="17" cy="9" r="1.6" />
      <path d="M8 15c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5c0 1.7-1.6 3-4 3s-4-1.3-4-3z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={open ? styles.chevronOpen : styles.chevron}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {collapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
    </svg>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)
  const [accountOpen, setAccountOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration from localStorage on mount
    setHydrated(true)
    const a = localStorage.getItem(ACCOUNT_STORAGE_KEY)
    if (a !== null) setAccountOpen(a === "true")
    const e = localStorage.getItem(EXPLORE_STORAGE_KEY)
    if (e !== null) setExploreOpen(e === "true")
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(ACCOUNT_STORAGE_KEY, String(accountOpen))
  }, [accountOpen, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(EXPLORE_STORAGE_KEY, String(exploreOpen))
  }, [exploreOpen, hydrated])

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href))

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
      aria-label="Sidebar"
    >
      <div className={styles.top}>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className={styles.collapseBtn}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
        {!collapsed && <span className={styles.brand}>Navigate</span>}
      </div>

      <nav className={styles.nav}>
        <Link
          href="/"
          className={`${styles.item} ${isActive("/") ? styles.active : ""}`}
          title="Home"
        >
          <span className={styles.icon}>
            <HomeIcon />
          </span>
          {!collapsed && <span className={styles.label}>Home</span>}
        </Link>

        <div className={styles.group}>
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                setCollapsed(false)
                setExploreOpen(true)
              } else {
                setExploreOpen((v) => !v)
              }
            }}
            className={`${styles.item} ${styles.accountBtn} ${isActive("/discover") || isActive("/proofs") || isActive("/verify") || isActive("/equipment") || isActive("/projects") || isActive("/financing") || isActive("/livestock") ? styles.active : ""}`}
            aria-expanded={collapsed ? undefined : exploreOpen}
            title="Explore"
          >
            <span className={styles.icon}>
              <SproutIcon />
            </span>
            {!collapsed && (
              <>
                <span className={styles.label}>Explore</span>
                <span className={styles.chevronWrap}>
                  <Chevron open={exploreOpen} />
                </span>
              </>
            )}
          </button>

          {!collapsed && exploreOpen && (
            <div className={styles.sub}>
              <Link
                href="/discover"
                className={`${styles.subItem} ${isActive("/discover") ? styles.active : ""}`}
              >
                <span className={styles.icon} style={{ marginRight: 8 }}>
                  <SearchIcon />
                </span>
                AgriScout
              </Link>
              <Link
                href="/proofs"
                className={`${styles.subItem} ${isActive("/proofs") || isActive("/verify") ? styles.active : ""}`}
              >
                <span className={styles.icon} style={{ marginRight: 8 }}>
                  <ShieldIcon />
                </span>
                AgroProof
              </Link>
              <Link
                href="/equipment"
                className={`${styles.subItem} ${isActive("/equipment") ? styles.active : ""}`}
              >
                <span className={styles.icon} style={{ marginRight: 8 }}>
                  <TractorIcon />
                </span>
                AgriLease
              </Link>
              <Link
                href="/projects"
                className={`${styles.subItem} ${isActive("/projects") || isActive("/financing") ? styles.active : ""}`}
              >
                <span className={styles.icon} style={{ marginRight: 8 }}>
                  <SproutIcon />
                </span>
                FarmFund
              </Link>
              <Link
                href="/livestock"
                className={`${styles.subItem} ${isActive("/livestock") ? styles.active : ""}`}
              >
                <span className={styles.icon} style={{ marginRight: 8 }}>
                  <PawIcon />
                </span>
                LivestockPass
              </Link>
            </div>
          )}
        </div>

        <div className={styles.group}>
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                setCollapsed(false)
                setAccountOpen(true)
              } else {
                setAccountOpen((v) => !v)
              }
            }}
            className={`${styles.item} ${styles.accountBtn} ${isActive("/account") || isActive("/profile") || isActive("/settings") ? styles.active : ""}`}
            aria-expanded={collapsed ? undefined : accountOpen}
            title="Account"
          >
            <span className={styles.icon}>
              <UserIcon />
            </span>
            {!collapsed && (
              <>
                <span className={styles.label}>Account</span>
                <span className={styles.chevronWrap}>
                  <Chevron open={accountOpen} />
                </span>
              </>
            )}
          </button>

          {!collapsed && accountOpen && (
            <div className={styles.sub}>
              <Link
                href="/account"
                className={`${styles.subItem} ${isActive("/account") && pathname === "/account" ? styles.active : ""}`}
              >
                Overview
              </Link>
              <Link
                href="/profile"
                className={`${styles.subItem} ${isActive("/profile") ? styles.active : ""}`}
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className={`${styles.subItem} ${isActive("/settings") ? styles.active : ""}`}
              >
                Settings
              </Link>
            </div>
          )}
        </div>
      </nav>

      {collapsed && (
        <div className={styles.collapsedSub}>
          <Link
            href="/account"
            className={styles.collapsedDot}
            title="Account overview"
            aria-label="Account overview"
          >
            •
          </Link>
          <Link
            href="/profile"
            className={styles.collapsedDot}
            title="Profile"
            aria-label="Profile"
          >
            •
          </Link>
          <Link
            href="/settings"
            className={styles.collapsedDot}
            title="Settings"
            aria-label="Settings"
          >
            •
          </Link>
        </div>
      )}
    </aside>
  )
}
