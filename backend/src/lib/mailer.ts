import nodemailer from "nodemailer"
import { env } from "@/env"
import { logger } from "@/lib/logger"

function createTransport() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  })
}

const transport = createTransport()

export async function sendMail(opts: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  if (!transport) {
    logger.debug({ to: opts.to, subject: opts.subject }, "SMTP not configured — skipping email")
    return
  }
  try {
    await transport.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
    logger.info({ to: opts.to, subject: opts.subject }, "Email sent")
  } catch (err) {
    logger.error({ err, to: opts.to, subject: opts.subject }, "Failed to send email")
  }
}
