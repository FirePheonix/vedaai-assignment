import express from "express"
import { Webhook } from "svix"
import { User } from "@/models/User"
import { logger } from "@/lib/logger"
import { env } from "@/env"

const router = express.Router()

// Clerk sends JSON but Svix needs the raw body to verify signature
router.post("/clerk", express.raw({ type: "application/json" }), async (req, res) => {
  const secret = env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    // Webhook not configured — skip silently in dev
    res.status(200).json({ ok: true })
    return
  }

  const svix_id = req.headers["svix-id"] as string
  const svix_timestamp = req.headers["svix-timestamp"] as string
  const svix_signature = req.headers["svix-signature"] as string

  if (!svix_id || !svix_timestamp || !svix_signature) {
    res.status(400).json({ error: "Missing Svix headers" })
    return
  }

  let event: { type: string; data: Record<string, unknown> }
  try {
    const wh = new Webhook(secret)
    event = wh.verify(req.body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as typeof event
  } catch (err) {
    logger.warn({ err }, "Clerk webhook signature verification failed")
    res.status(400).json({ error: "Invalid signature" })
    return
  }

  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      const data = event.data as {
        id: string
        first_name?: string
        last_name?: string
        email_addresses?: { email_address: string }[]
      }

      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || "Unknown"
      const email = data.email_addresses?.[0]?.email_address ?? ""

      await User.findOneAndUpdate(
        { clerkId: data.id },
        { $set: { name, email }, $setOnInsert: { clerkId: data.id, role: null } },
        { upsert: true, new: true }
      )

      logger.info({ clerkId: data.id, event: event.type }, "User synced from Clerk webhook")
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    logger.error({ err }, "Webhook handler error")
    res.status(500).json({ error: "Internal error" })
  }
})

export { router as webhookRouter }
