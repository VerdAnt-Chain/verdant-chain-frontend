import Link from "next/link"
import { Button, Card, Heading, StatusPill, Text } from "@/components/ui"
import styles from "./home.module.css"

const pillars = [
  {
    name: "AgriScout",
    blurb: "Farmer discovery, profiles, and agricultural reputation.",
    href: "/discover",
  },
  {
    name: "AgroProof",
    blurb: "Verification along the harvest-to-buyer chain.",
    href: "/verify",
  },
  {
    name: "AgriLease",
    blurb: "Equipment marketplace with escrowed bookings.",
    href: "/equipment",
  },
  {
    name: "FarmFund",
    blurb: "Milestone-based agricultural financing.",
    href: "/financing",
  },
  {
    name: "LivestockPass",
    blurb: "Identity and history for livestock.",
    href: "/livestock",
  },
]

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <StatusPill tone="success" label="Built on Stellar" />
        <Heading as="h1" size={1}>
          Agricultural infrastructure for a resilient food web.
        </Heading>
        <Text size="body-lg" tone="muted" as="p" className={styles.lede}>
          VerdAnt is open-source technology and financial infrastructure for farmers — identity,
          verification, leasing, and financing — anchored by Soroban smart contracts.
        </Text>
        <div className={styles.actions}>
          <Button as="a" href="/design-system">
            Explore the design system
          </Button>
          <Button as="a" variant="outlined" href="/discover">
            Try AgriScout
          </Button>
        </div>
      </section>

      <section className={styles.pillars} aria-label="Feature pillars">
        {pillars.map((pillar) => (
          <Link key={pillar.name} href={pillar.href} className={styles.pillarCardLink}>
            <Card interactive className={styles.pillarCard}>
              <Heading as="h3">{pillar.name}</Heading>
              <Text as="p" tone="muted">
                {pillar.blurb}
              </Text>
              <span className={styles.pillarLink}>Explore &rarr;</span>
            </Card>
          </Link>
        ))}
      </section>

      <footer className={styles.footer}>
        <Text as="p" size="body-sm" tone="muted">
          Foundation preview — the design system and shell. Feature surfaces arrive after API
          contracts land in <code>docs/api/</code>.
        </Text>
      </footer>
    </main>
  )
}
