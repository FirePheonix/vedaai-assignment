import express from "express"
import multer from "multer"
import pdfParse from "pdf-parse"
import { logger } from "@/lib/logger"

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ["application/pdf", "text/plain"]
    cb(null, allowed.includes(file.mimetype))
  },
})

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file or unsupported type. Send a PDF or plain-text file." })
    return
  }

  try {
    let fileText = ""

    if (req.file.mimetype === "application/pdf") {
      const result = await pdfParse(req.file.buffer)
      fileText = result.text.trim()
    } else {
      fileText = req.file.buffer.toString("utf-8").trim()
    }

    if (!fileText) {
      res.status(422).json({ error: "Could not extract text from file." })
      return
    }

    logger.info({ bytes: req.file.size, chars: fileText.length }, "File uploaded and parsed")
    res.json({ fileText: fileText.slice(0, 8000) })
  } catch (err) {
    logger.error({ err }, "File parse failed")
    res.status(500).json({ error: "Failed to parse file." })
  }
})

export { router as uploadRouter }
