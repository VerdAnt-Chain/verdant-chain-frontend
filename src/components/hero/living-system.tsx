"use client"

import styles from "./living-system.module.css"

export function LivingSystem() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
        role="presentation"
      >
        {/* Subtle orbital rings */}
        <g className={styles.orbitSlow}>
          <circle
            cx="200"
            cy="200"
            r="110"
            stroke="var(--va-outline-variant)"
            strokeOpacity="0.25"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
        </g>
        <g className={styles.orbitMed}>
          <circle
            cx="200"
            cy="200"
            r="145"
            stroke="var(--va-accent-leaf)"
            strokeOpacity="0.18"
            strokeWidth="1"
            strokeDasharray="2 12"
          />
        </g>
        <g className={styles.orbitFast}>
          <circle
            cx="200"
            cy="200"
            r="78"
            stroke="var(--va-primary)"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        </g>

        {/* Branching network — mycelial / root */}
        <g
          className={styles.branch}
          stroke="var(--va-accent-moss)"
          strokeOpacity="0.4"
          strokeWidth="1.4"
          strokeLinecap="round"
        >
          <path d="M200 200 C 185 175, 160 145, 135 118" />
          <path d="M135 118 C 128 105, 122 92, 118 78" />
          <path d="M135 118 C 148 108, 162 102, 175 95" />
          <path d="M200 200 C 215 182, 240 160, 268 142" />
          <path d="M268 142 C 285 132, 300 120, 312 105" />
          <path d="M268 142 C 260 155, 252 172, 248 188" />
          <path d="M200 200 C 192 225, 185 250, 178 275" />
          <path d="M178 275 C 172 292, 165 308, 155 322" />
          <path d="M178 275 C 192 285, 208 290, 224 293" />
          <path d="M200 200 C 205 222, 218 245, 235 262" />
        </g>

        {/* Leaf / seed nodes */}
        <g className={styles.nodes}>
          <g className={styles.nodePulse} style={{ animationDelay: "0ms" }}>
            <circle cx="118" cy="78" r="7" fill="var(--va-primary)" fillOpacity="0.9" />
            <circle cx="118" cy="78" r="11" fill="var(--va-primary)" fillOpacity="0.12" />
          </g>
          <g className={styles.nodePulse} style={{ animationDelay: "400ms" }}>
            <circle cx="175" cy="95" r="5" fill="var(--va-accent-leaf)" fillOpacity="0.85" />
          </g>
          <g className={styles.nodePulse} style={{ animationDelay: "800ms" }}>
            <circle cx="312" cy="105" r="6" fill="var(--va-secondary)" fillOpacity="0.8" />
            <circle cx="312" cy="105" r="10" fill="var(--va-secondary)" fillOpacity="0.1" />
          </g>
          <g className={styles.nodePulse} style={{ animationDelay: "1200ms" }}>
            <circle cx="248" cy="188" r="4" fill="var(--va-accent-moss)" fillOpacity="0.7" />
          </g>
          <g className={styles.nodePulse} style={{ animationDelay: "1600ms" }}>
            <circle cx="155" cy="322" r="6" fill="var(--va-primary)" fillOpacity="0.75" />
          </g>
          <g className={styles.nodePulse} style={{ animationDelay: "2000ms" }}>
            <circle cx="224" cy="293" r="4.5" fill="var(--va-accent-earth)" fillOpacity="0.7" />
          </g>
          <g className={styles.nodePulse} style={{ animationDelay: "600ms" }}>
            <circle cx="235" cy="262" r="5.5" fill="var(--va-tertiary)" fillOpacity="0.65" />
          </g>
          {/* Central seed */}
          <g className={styles.centerPulse}>
            <circle cx="200" cy="200" r="14" fill="var(--va-primary)" />
            <circle cx="200" cy="200" r="14" fill="white" fillOpacity="0.12" />
            <circle cx="200" cy="200" r="22" fill="var(--va-primary)" fillOpacity="0.08" />
            <circle cx="200" cy="200" r="32" fill="var(--va-primary)" fillOpacity="0.04" />
          </g>
        </g>

        {/* Data points — small luminous dots on orbits */}
        <g fill="var(--va-accent-leaf)" fillOpacity="0.5">
          <circle
            cx="200"
            cy="90"
            r="1.8"
            className={styles.drift}
            style={{ animationDelay: "0ms" }}
          />
          <circle
            cx="310"
            cy="200"
            r="1.8"
            className={styles.drift}
            style={{ animationDelay: "700ms" }}
          />
          <circle
            cx="200"
            cy="310"
            r="1.8"
            className={styles.drift}
            style={{ animationDelay: "1400ms" }}
          />
          <circle
            cx="90"
            cy="200"
            r="1.8"
            className={styles.drift}
            style={{ animationDelay: "2100ms" }}
          />
        </g>

        {/* Subtle leaf silhouettes */}
        <g fill="var(--va-accent-leaf)" fillOpacity="0.07" className={styles.leafFloat}>
          <path d="M 165 185 C 172 175, 185 172, 195 178 C 188 188, 175 190, 165 185 Z" />
          <path d="M 225 215 C 235 208, 248 210, 255 220 C 245 226, 232 224, 225 215 Z" />
        </g>
      </svg>

      {/* Soft botanical glow behind */}
      <div className={styles.glow} />
      <div className={styles.glow2} />
    </div>
  )
}
