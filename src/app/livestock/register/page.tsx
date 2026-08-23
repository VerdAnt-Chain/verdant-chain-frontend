"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Heading, Input, StatusPill, Text } from "@/components/ui"
import { registerAnimal } from "@/lib/api/livestock"
import shared from "@/components/core/shared.module.css"

export default function RegisterAnimalPage() {
  const router = useRouter()
  const [species, setSpecies] = useState("cattle")
  const [breed, setBreed] = useState("")
  const [name, setName] = useState("")
  const [farm, setFarm] = useState("")
  const [tag, setTag] = useState("")
  const [microchip, setMicrochip] = useState("")
  const [dob, setDob] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!species.trim() || !tag.trim()) {
      setError("Species and ear tag are required")
      return
    }
    setBusy(true)
    try {
      const animal = await registerAnimal({
        species: species.trim(),
        breed: breed.trim() || undefined,
        name: name.trim() || undefined,
        farm: farm.trim() || undefined,
        identification: { tag: tag.trim(), microchip: microchip.trim() || undefined },
        dateOfBirth: dob || undefined,
      })
      router.push(`/livestock/${encodeURIComponent(animal.id)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register the animal")
      setBusy(false)
    }
  }

  return (
    <div className={shared.page} style={{ maxWidth: "44rem" }}>
      <header className={shared.header}>
        <StatusPill tone="info" label="LivestockPass" />
        <Heading as="h1">Register an animal</Heading>
        <Text as="p" className={shared.lede}>
          Give an animal a portable, verifiable identity. Events build its provenance over time.
        </Text>
      </header>

      <Card elevation={1} container className={shared.detailCard}>
        <form onSubmit={submit} className={shared.formGrid}>
          <div className={shared.formRow2}>
            <div>
              <Text
                size="body-sm"
                tone="muted"
                as="label"
                style={{ display: "block", marginBottom: 6 }}
              >
                Species *
              </Text>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                aria-label="Species"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--va-shape-sm)",
                  border: "1px solid var(--va-outline-variant)",
                  background: "var(--va-surface)",
                  color: "var(--va-on-surface)",
                }}
              >
                <option value="cattle">Cattle</option>
                <option value="goat">Goat</option>
                <option value="sheep">Sheep</option>
                <option value="pig">Pig</option>
                <option value="poultry">Poultry</option>
              </select>
            </div>
            <Input
              label="Breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Angus"
            />
          </div>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bessie"
          />
          <Input
            label="Farm / location"
            value={farm}
            onChange={(e) => setFarm(e.target.value)}
            placeholder="Happy Valley Farm"
          />
          <div className={shared.formRow2}>
            <Input
              label="Ear tag *"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="BT-1234"
            />
            <Input
              label="Microchip"
              value={microchip}
              onChange={(e) => setMicrochip(e.target.value)}
              placeholder="optional"
            />
          </div>
          <Input
            label="Date of birth"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />

          {error && (
            <Card
              elevation={0}
              className={`${shared.detailCard} ${shared.alertError}`}
              style={{ padding: 12 }}
            >
              <StatusPill tone="error" label="Failed" />
              <Text tone="error" size="body-sm" as="p" style={{ marginTop: 6 }}>
                {error}
              </Text>
            </Card>
          )}

          <div className={shared.actions}>
            <Button type="submit" loading={busy}>
              Register
            </Button>
            <Button type="button" variant="text" onClick={() => router.back()} disabled={busy}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
