import Link from "next/link"
import { Button, Card, Heading, StatusPill, Text } from "@/components/ui"
import { LivingSystem } from "@/components/hero/living-system"
import styles from "./home.module.css"

const pillars = [
  {
    name: "AgriScout",
    blurb: "Farmer discovery, profiles, and agricultural reputation — the living identity layer.",
    href: "/discover",
    accent: "Discover farmers",
  },
  {
    name: "AgroProof",
    blurb: "Verification along the harvest-to-buyer chain. Proofs anchored, not paperwork.",
    href: "/verify",
    accent: "View proofs",
  },
  {
    name: "AgriLease",
    blurb: "Tractors, harvesters, irrigation — booked with on-chain escrow.",
    href: "/equipment",
    accent: "Browse equipment",
  },
  {
    name: "FarmFund",
    blurb: "Milestone-based financing that releases as work is proven.",
    href: "/financing",
    accent: "See milestones",
  },
  {
    name: "LivestockPass",
    blurb: "Identity and history for livestock — breed, health, ownership.",
    href: "/livestock",
    accent: "Track livestock",
  },
]

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero — editorial asymmetric */}
      <section className={styles.hero} aria-label="VerdAnt hero">
        <div className={styles.heroContent}>
          <StatusPill tone="success" label="Built on Stellar · Soroban" />
          <h1 className={styles.display}>
            Technology that <span className={styles.displayAccent}>grows</span> with the world.
          </h1>
          <Text size="body-lg" tone="muted" as="p" className={styles.lede}>
            VerdAnt connects sustainable production, transparent infrastructure, and programmable
            ownership — so value can take root where it’s grown.
          </Text>
          <div className={styles.actions}>
            <Button as="a" href="/discover">
              Explore VerdAnt
            </Button>
            <Button as="a" variant="outlined" href="/design-system">
              View ecosystem
            </Button>
          </div>
        </div>

        <div className={styles.heroVisual} aria-hidden="true">
          <LivingSystem />
        </div>
      </section>

      {/* Ecosystem strip — visual summary first */}
      <section className={styles.strip} aria-label="Ecosystem at a glance">
        <div className={styles.metric}>
          <span className={styles.metricValue}>12.4k</span>
          <span className={styles.metricLabel}>Verified assets</span>
          <span className={styles.metricTrend}>+8.2% this month</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricValue}>3.2k</span>
          <span className={styles.metricLabel}>Farmers onboard</span>
          <span className={styles.metricTrend}>+124 this week</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricValue}>98.1%</span>
          <span className={styles.metricLabel}>Proof liveness</span>
          <span className={styles.metricTrend}>All systems nominal</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricValue}>—</span>
          <span className={styles.metricLabel}>You — early</span>
          <span className={styles.metricTrend}>Nothing has grown here yet</span>
        </div>
      </section>

      {/* Pillars — asymmetric editorial grid, varied shapes */}
      <section className={styles.pillars} aria-label="Feature pillars">
        {pillars.map((pillar) => (
          <Link key={pillar.name} href={pillar.href} className={styles.pillarCardLink}>
            <Card interactive className={styles.pillarCard}>
              <Heading as="h3">{pillar.name}</Heading>
              <Text as="p" tone="muted">
                {pillar.blurb}
              </Text>
              <span className={styles.pillarLink}>{pillar.accent} &rarr;</span>
            </Card>
          </Link>
        ))}
      </section>

      <footer className={styles.footer}>
        <div>
          <Text as="p" size="body-sm" tone="muted">
            Foundation preview — the design system and shell. Feature surfaces arrive after API
            contracts land in <code>docs/api/</code>.
          </Text>
          <div className={styles.footerBranch} aria-hidden="true" />
        </div>
        <Text as="p" size="body-sm" tone="muted">
          Awwwards-worthy, yet functional.
        </Text>
      </footer>
    </main>
  )
}
