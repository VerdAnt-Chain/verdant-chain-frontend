import { NextRequest } from "next/server"
import { db, json, paginated, requireAuth } from "./db"

/** In-memory demo implementation for the four new cores (pre-Phase-1). */
export async function demo(req: NextRequest, seg: string[]): Promise<Response | null> {
  const store = db()
  const method = req.method
  const sp = new URL(req.url).searchParams
  const id = seg[1] ? decodeURIComponent(seg[1]) : undefined
  const sub = seg[2]
  const notFound = () => json({ error: "not found" }, 404)

  // ── Proofs ──
  if (seg[0] === "proofs") {
    if (!id && method === "GET") {
      let items = Array.from(store.proofs.values())
      const status = sp.get("status")
      const subjectType = sp.get("subjectType")
      const creator = sp.get("creator")
      if (status) items = items.filter((p) => p.status === status)
      if (subjectType) items = items.filter((p) => p.subjectType === subjectType)
      if (creator) items = items.filter((p) => p.creator === creator)
      return paginated(items, req)
    }
    if (!id && method === "POST") {
      if (!requireAuth(req)) return json({ error: "authorization required" }, 401)
      return req.json().then((b: Record<string, unknown>) => {
        if (!b.subjectId || !b.claim)
          return json({ error: "subjectId and claim are required" }, 400)
        const t = new Date().toISOString()
        const proof = {
          id: `va:proof:${crypto.randomUUID()}`,
          subjectType: String(b.subjectType ?? "batch"),
          subjectId: String(b.subjectId),
          claim: String(b.claim),
          status: "draft",
          creator: "demo",
          verificationId: null,
          evidenceCount: 0,
          evidence: [],
          createdAt: t,
          updatedAt: t,
        }
        store.proofs.set(proof.id, proof)
        return json(proof, 201)
      })
    }
    const proof = id ? store.proofs.get(id) : undefined
    if (!proof) return notFound()
    if (!sub && method === "GET") return json(proof)
    if (sub === "evidence" && method === "POST") {
      if (!requireAuth(req)) return json({ error: "authorization required" }, 401)
      return req.json().then((b: Record<string, unknown>) => {
        if (!b.contentHash) return json({ error: "contentHash is required" }, 400)
        const ev = {
          id: `va:doc:${crypto.randomUUID().replace(/-/g, "")}`,
          proofId: proof.id as string,
          type: String(b.type ?? "document"),
          uri: (b.uri as string) ?? null,
          contentHash: String(b.contentHash),
          metadata: b.metadata ?? null,
          submittedBy: "demo",
          createdAt: new Date().toISOString(),
        }
        const list = Array.isArray(proof.evidence) ? (proof.evidence as unknown[]) : []
        list.push(ev)
        proof.evidence = list
        proof.evidenceCount = list.length
        proof.updatedAt = new Date().toISOString()
        return json(ev, 201)
      })
    }
    if (sub === "submit" && method === "POST") {
      if (proof.status !== "draft") return json({ error: "invalid status transition" }, 400)
      proof.status = "submitted"
      proof.updatedAt = new Date().toISOString()
      return json(proof)
    }
    if (sub === "verify" && method === "POST") {
      if (!requireAuth(req)) return json({ error: "authorization required" }, 401)
      if (proof.status !== "submitted" && proof.status !== "under_review")
        return json({ error: "invalid status transition" }, 400)
      return req.json().then((b: Record<string, unknown>) => {
        const decision = String(b.status ?? "approved")
        proof.status = decision === "approved" ? "verified" : "rejected"
        if (decision === "approved")
          proof.verificationId = `va:verification:${String(Date.now()).padStart(12, "0").slice(-12)}`
        proof.updatedAt = new Date().toISOString()
        return json({
          proof,
          verification: {
            proofId: proof.id,
            verifier: "demo-verifier",
            status: decision === "approved" ? "approved" : "rejected",
            decision: b.decision ?? null,
            notes: b.notes ?? null,
            createdAt: new Date().toISOString(),
          },
        })
      })
    }
  }

  // ── Equipment & Leases ──
  if (seg[0] === "equipment") {
    if (!id && method === "GET") {
      let items = Array.from(store.equipment.values())
      const type = sp.get("type")
      const location = sp.get("location")
      const available = sp.get("available")
      if (type) items = items.filter((e) => e.type === type)
      if (location)
        items = items.filter((e) =>
          String(e.location).toLowerCase().includes(location.toLowerCase())
        )
      if (available === "true" || available === "false")
        items = items.filter((e) => e.available === (available === "true"))
      return paginated(items, req)
    }
    if (!id && method === "POST") {
      if (!requireAuth(req)) return json({ error: "authorization required" }, 401)
      return req.json().then((b: Record<string, unknown>) => {
        if (!b.name || !b.type || !b.location)
          return json({ error: "name, type and location are required" }, 400)
        const t = new Date().toISOString()
        const eq = {
          id: `va:equipment:${crypto.randomUUID()}`,
          name: String(b.name),
          type: String(b.type),
          owner: "demo",
          description: (b.description as string) ?? null,
          condition: String(b.condition ?? "good"),
          location: String(b.location),
          dailyRate: Number(b.dailyRate ?? 0),
          available: b.available !== false,
          verificationId: null,
          createdAt: t,
          updatedAt: t,
        }
        store.equipment.set(eq.id, eq)
        return json(eq, 201)
      })
    }
    const eq = id ? store.equipment.get(id) : undefined
    if (!eq) return notFound()
    if (!sub && method === "GET") return json(eq)
    if (!sub && method === "PUT") {
      return req.json().then((patch: Record<string, unknown>) => {
        Object.assign(eq, patch, { updatedAt: new Date().toISOString() })
        return json(eq)
      })
    }
    if (sub === "leases" && method === "GET") {
      const items = Array.from(store.leases.values()).filter((l) => l.equipmentId === eq.id)
      return paginated(items, req)
    }
  }

  if (seg[0] === "leases") {
    if (!id && method === "GET") {
      let items = Array.from(store.leases.values())
      const renter = sp.get("renter")
      const equipmentId = sp.get("equipmentId")
      const status = sp.get("status")
      if (renter) items = items.filter((l) => l.renter === renter)
      if (equipmentId) items = items.filter((l) => l.equipmentId === equipmentId)
      if (status) items = items.filter((l) => l.status === status)
      return paginated(items, req)
    }
    if (!id && method === "POST") {
      if (!requireAuth(req)) return json({ error: "authorization required" }, 401)
      return req.json().then((b: Record<string, unknown>) => {
        const eq = store.equipment.get(String(b.equipmentId))
        if (!eq) return json({ error: "unknown equipment" }, 404)
        if (!eq.available) return json({ error: "equipment unavailable" }, 400)
        const days =
          (new Date(String(b.endDate)).getTime() - new Date(String(b.startDate)).getTime()) /
          86400000
        if (!(days > 0)) return json({ error: "invalid dates" }, 400)
        const lease = {
          id: `va:booking:${crypto.randomUUID()}`,
          equipmentId: eq.id as string,
          renter: "demo",
          startDate: String(b.startDate),
          endDate: String(b.endDate),
          status: "requested",
          escrowId: `va:escrow:${String(Date.now()).padStart(12, "0").slice(-12)}`,
          totalAmount: Number(eq.dailyRate) * Math.ceil(days),
          paidAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        store.leases.set(lease.id, lease)
        return json(lease, 201)
      })
    }
    const lease = id ? store.leases.get(id) : undefined
    if (!lease) return notFound()
    if (!sub && method === "GET") return json(lease)
    if (sub === "approve" && method === "PUT") {
      if (lease.status !== "requested") return json({ error: "invalid status transition" }, 400)
      lease.status = "active"
      const eq = store.equipment.get(lease.equipmentId as string)
      if (eq) eq.available = false
      lease.updatedAt = new Date().toISOString()
      return json(lease)
    }
    if (sub === "complete" && method === "PUT") {
      if (lease.status !== "active") return json({ error: "invalid status transition" }, 400)
      lease.status = "completed"
      const eq = store.equipment.get(lease.equipmentId as string)
      if (eq) eq.available = true
      lease.updatedAt = new Date().toISOString()
      return json(lease)
    }
    if (sub === "cancel" && method === "PUT") {
      if (lease.status !== "requested" && lease.status !== "active")
        return json({ error: "invalid status transition" }, 400)
      lease.status = "cancelled"
      const eq = store.equipment.get(lease.equipmentId as string)
      if (eq) eq.available = true
      lease.updatedAt = new Date().toISOString()
      return json(lease)
    }
  }

  // ── Projects ──
  if (seg[0] === "projects") {
    if (!id && method === "GET") {
      let items = Array.from(store.projects.values())
      const status = sp.get("status")
      const category = sp.get("category")
      if (status) items = items.filter((p) => p.status === status)
      if (category) items = items.filter((p) => p.category === category)
      return paginated(items, req)
    }
    if (!id && method === "POST") {
      if (!requireAuth(req)) return json({ error: "authorization required" }, 401)
      return req.json().then((b: Record<string, unknown>) => {
        if (!b.title || !b.description || !b.fundingTarget)
          return json({ error: "title, description and fundingTarget are required" }, 400)
        const t = new Date().toISOString()
        const project = {
          id: `va:project:${crypto.randomUUID()}`,
          title: String(b.title),
          description: String(b.description),
          farmer: "demo",
          category: String(b.category ?? "crops"),
          fundingTarget: Number(b.fundingTarget),
          fundedAmount: 0,
          status: "draft",
          milestones: [],
          createdAt: t,
          updatedAt: t,
        }
        store.projects.set(project.id, project)
        return json(project, 201)
      })
    }
    const project = id ? store.projects.get(id) : undefined
    if (!project) return notFound()
    if (!sub && method === "GET") return json(project)
    if (!sub && method === "PUT") {
      return req.json().then((patch: Record<string, unknown>) => {
        Object.assign(project, patch, { updatedAt: new Date().toISOString() })
        return json(project)
      })
    }
    if (sub === "publish" && method === "POST") {
      if (project.status !== "draft") return json({ error: "invalid status transition" }, 400)
      project.status = "funding"
      project.updatedAt = new Date().toISOString()
      return json(project)
    }
    if (sub === "fund" && method === "POST") {
      if (!requireAuth(req)) return json({ error: "authorization required" }, 401)
      return req.json().then((b: Record<string, unknown>) => {
        const amount = Number(b.amount ?? 0)
        const remaining = Number(project.fundingTarget) - Number(project.fundedAmount)
        if (!(amount > 0) || amount > remaining)
          return json({ error: "amount exceeds remaining target" }, 400)
        project.fundedAmount = Number(project.fundedAmount) + amount
        project.status = "active"
        project.updatedAt = new Date().toISOString()
        return json({
          project,
          receipt: {
            id: `receipt-${crypto.randomUUID()}`,
            projectId: project.id,
            contributor: "demo",
            amount,
            status: "confirmed",
            createdAt: new Date().toISOString(),
          },
        })
      })
    }
    if (seg[2] === "milestones" && seg[3]) {
      const idx = Number(seg[3])
      const milestones = (project.milestones as Record<string, unknown>[]) ?? []
      const ms = milestones.find((m) => Number(m.index) === idx)
      if (!ms) return json({ error: "unknown milestone" }, 404)
      if (seg[4] === "submit" && method === "POST") {
        if (ms.status !== "pending") return json({ error: "invalid status transition" }, 400)
        return req.json().then((b: Record<string, unknown>) => {
          ms.status = "submitted"
          ms.proofHash = String(b.proofHash ?? "")
          ms.updatedAt = new Date().toISOString()
          project.updatedAt = ms.updatedAt
          return json({ milestone: ms, project })
        })
      }
      if (seg[4] === "verify" && method === "POST") {
        if (!requireAuth(req)) return json({ error: "authorization required" }, 401)
        if (ms.status !== "submitted") return json({ error: "invalid status transition" }, 400)
        return req.json().then((b: Record<string, unknown>) => {
          ms.status = b.status === "rejected" ? "rejected" : "verified"
          ms.updatedAt = new Date().toISOString()
          project.updatedAt = ms.updatedAt
          return json({ milestone: ms, project })
        })
      }
    }
  }

  // ── Livestock ──
  if (seg[0] === "livestock") {
    if (!id && method === "GET") {
      let items = Array.from(store.animals.values())
      const species = sp.get("species")
      const status = sp.get("status")
      const farm = sp.get("farm")
      if (species) items = items.filter((a) => a.species === species)
      if (status) items = items.filter((a) => a.status === status)
      if (farm)
        items = items.filter((a) => String(a.farm).toLowerCase().includes(farm.toLowerCase()))
      return paginated(items, req)
    }
    if (!id && method === "POST") {
      if (!requireAuth(req)) return json({ error: "authorization required" }, 401)
      return req.json().then((b: Record<string, unknown>) => {
        if (!b.species || !b.identification)
          return json({ error: "species and identification are required" }, 400)
        const t = new Date().toISOString()
        const animal = {
          id: `va:livestock:${crypto.randomUUID()}`,
          species: String(b.species),
          breed: (b.breed as string) ?? null,
          name: (b.name as string) ?? null,
          farm: (b.farm as string) ?? null,
          owner: "demo",
          identification: b.identification as Record<string, unknown>,
          dateOfBirth: (b.dateOfBirth as string) ?? null,
          status: "active",
          verificationId: null,
          createdAt: t,
          updatedAt: t,
        }
        store.animals.set(animal.id, animal)
        store.animalEvents.set(animal.id, [
          {
            id: `va:event:${crypto.randomUUID()}`,
            animalId: animal.id,
            type: "registration",
            data: { ...animal.identification },
            recordedBy: "demo",
            proofId: null,
            createdAt: t,
          },
        ])
        return json(animal, 201)
      })
    }
    const animal = id ? store.animals.get(id) : undefined
    if (!animal) return notFound()
    if (!sub && method === "GET") return json(animal)
    if (!sub && method === "PUT") {
      return req.json().then((patch: Record<string, unknown>) => {
        Object.assign(animal, patch, { updatedAt: new Date().toISOString() })
        return json(animal)
      })
    }
    if (sub === "history" && method === "GET") {
      return json(store.animalEvents.get(String(animal.id)) ?? [])
    }
    if (sub === "events" && method === "POST") {
      if (!requireAuth(req)) return json({ error: "authorization required" }, 401)
      return req.json().then((b: Record<string, unknown>) => {
        if (!b.type) return json({ error: "event type is required" }, 400)
        const ev = {
          id: `va:event:${crypto.randomUUID()}`,
          animalId: String(animal.id),
          type: String(b.type),
          data: (b.data as Record<string, unknown>) ?? {},
          recordedBy: "demo",
          proofId: (b.proofId as string) ?? null,
          createdAt: new Date().toISOString(),
        }
        const list = store.animalEvents.get(String(animal.id)) ?? []
        list.push(ev)
        store.animalEvents.set(String(animal.id), list)
        return json(ev, 201)
      })
    }
    if (sub === "transfer") {
      const transfersMap = store.animals as unknown as {
        transfers?: Map<string, Record<string, string | null>>
      }
      if (method === "POST") {
        if (!requireAuth(req)) return json({ error: "authorization required" }, 401)
        if (!transfersMap.transfers) transfersMap.transfers = new Map()
        const map = transfersMap.transfers
        return req.json().then((b: Record<string, unknown>) => {
          if (!b.toOwner) return json({ error: "toOwner is required" }, 400)
          const transfer = {
            id: `transfer-${crypto.randomUUID()}`,
            from: String(animal.owner),
            to: String(b.toOwner),
            animalId: String(animal.id),
            status: "pending",
            initiatedAt: new Date().toISOString(),
            completedAt: null as string | null,
          }
          map.set(String(animal.id), transfer)
          return json(transfer, 201)
        })
      }
      const transfer = transfersMap.transfers?.get(String(animal.id))
      if (sub2Check(seg, "accept") && method === "PUT") {
        if (!transfer || transfer.status !== "pending")
          return json({ error: "no pending transfer" }, 400)
        transfer.status = "accepted"
        return json(transfer)
      }
      if (sub2Check(seg, "complete") && method === "PUT") {
        if (!transfer || transfer.status !== "accepted")
          return json({ error: "transfer not accepted" }, 400)
        transfer.status = "completed"
        transfer.completedAt = new Date().toISOString()
        animal.owner = transfer.to
        animal.status = "transferred"
        animal.updatedAt = new Date().toISOString()
        const list = store.animalEvents.get(String(animal.id)) ?? []
        list.push({
          id: `va:event:${crypto.randomUUID()}`,
          animalId: animal.id as string,
          type: "ownership",
          data: { from: transfer.from, to: transfer.to },
          recordedBy: "demo",
          proofId: null,
          createdAt: new Date().toISOString(),
        })
        store.animalEvents.set(animal.id as string, list)
        return json({ animal, transfer })
      }
    }
  }

  return notFound()
}

function sub2Check(seg: string[], name: string): boolean {
  return seg[3] === name
}
