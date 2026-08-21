import Link from "next/link"
import {
  Card,
  Container,
  Grid,
  Heading,
  Stack,
  StatusPill,
  Text,
  type StatusTone,
} from "@/components/ui"
import styles from "./feature-landing.module.css"

export type FeatureItem = {
  name: string
  meta: string
  tone: StatusTone
  label: string
}

type FeatureLandingProps = {
  title: string
  description: string
  headerTone: StatusTone
  headerLabel: string
  items: FeatureItem[]
  note: string
}

export function FeatureLanding({
  title,
  description,
  headerTone,
  headerLabel,
  items,
  note,
}: FeatureLandingProps) {
  return (
    <main className={styles.main}>
      <Container>
        <div className={styles.topbar}>
          <Link href="/">&larr; Back home</Link>
        </div>

        <header className={styles.header}>
          <StatusPill tone={headerTone} label={headerLabel} />
          <Heading as="h1" size={1}>
            {title}
          </Heading>
          <Text as="p" size="body-lg" tone="muted">
            {description}
          </Text>
        </header>

        <section aria-label={`${title} overview`}>
          <Grid cols={2} gap={4} responsive>
            {items.map((item) => (
              <Card key={item.name} elevation={1} container className={styles.item}>
                <StatusPill tone={item.tone} label={item.label} />
                <Heading as="h3">{item.name}</Heading>
                <Text as="p" size="body-sm" tone="muted">
                  {item.meta}
                </Text>
              </Card>
            ))}
          </Grid>
        </section>

        <footer className={styles.footer}>
          <Stack gap={2}>
            <Text as="p" size="body-sm" tone="muted">
              {note}
            </Text>
            <Link href="/" className={styles.homeLink}>
              Explore the design system &rarr;
            </Link>
          </Stack>
        </footer>
      </Container>
    </main>
  )
}
