import { v2 as cloudinary } from "cloudinary"
import { env } from "@/env"

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

export async function uploadBuffer(
  buffer: Buffer,
  mimetype: string,
  folder = "submissions"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype === "application/pdf" ? "raw" : "image"

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"))
        resolve(result.secure_url)
      }
    )

    stream.end(buffer)
  })
}
