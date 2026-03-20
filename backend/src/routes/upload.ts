import express from "express"
import multer from "multer"
import pdfParse from "pdf-parse"
import OpenAI from "openai"
import { verifyToken } from "@clerk/backend"
import { logger } from "@/lib/logger"
import { storeChunks } from "@/lib/embed"
import { env } from "@/env"

const router = express.Router()
const openai = new OpenAI()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = [
      "application/pdf",
      "text/plain",
      "image/png",
      "image/jpeg",
      "image/webp",
    ]
    cb(null, allowed.includes(file.mimetype))
  },
})

async function extractText(file: Express.Multer.File): Promise<string> {
  if (file.mimetype === "application/pdf") {
    const result = await pdfParse(file.buffer)
    return result.text.trim()
  }

  if (file.mimetype.startsWith("image/")) {
    const base64 = file.buffer.toString("base64")
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${file.mimetype};base64,${base64}` },
            },
            {
              type: "text",
              text: "Extract all text, topics, concepts, diagrams, and key information from this image. This will be used as reference material to generate exam questions.",
            },
          ],
        },
      ],
      max_tokens: 4096,
    })
    return response.choices[0].message.content?.trim() ?? ""
  }

  return file.buffer.toString("utf-8").trim()
}

router.post("/", upload.single("file"), async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  try {
    await verifyToken(authHeader.slice(7), { secretKey: env.CLERK_SECRET_KEY })
  } catch {
    res.status(401).json({ error: "Invalid token" })
    return
  }

  if (!req.file) {
    res.status(400).json({ error: "No file or unsupported type. Send a PDF, image, or plain-text file." })
    return
  }

  try {
    const text = await extractText(req.file)

    if (!text) {
      res.status(422).json({ error: "Could not extract text from file." })
      return
    }

    logger.info(
      { filename: req.file.originalname, bytes: req.file.size, chars: text.length },
      "File extracted"
    )

    const { sourceId, chunksStored } = await storeChunks(req.file.originalname, text)

    res.json({ sourceId, filename: req.file.originalname, chunksStored, charCount: text.length })
  } catch (err) {
    logger.error({ err }, "File upload failed")
    res.status(500).json({ error: "Failed to process file." })
  }
})

export { router as uploadRouter }
