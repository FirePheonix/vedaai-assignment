import { Resend } from "resend"
import { env } from "@/env"
import { logger } from "@/lib/logger"

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export async function sendMail(opts: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  if (!resend) {
    logger.debug({ to: opts.to, subject: opts.subject }, "Resend not configured — skipping email")
    return
  }
  try {
    const { error } = await resend.emails.send({
      from: env.SMTP_FROM || "VedaAI <onboarding@resend.dev>",
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
    if (error) throw error
    logger.info({ to: opts.to, subject: opts.subject }, "Email sent")
  } catch (err) {
    logger.error({ err, to: opts.to, subject: opts.subject }, "Failed to send email")
  }
}
