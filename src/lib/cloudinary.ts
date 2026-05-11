import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Generate a signed upload parameters object for direct client-side uploads.
 * The client POSTs these params along with the file to Cloudinary's upload endpoint.
 */
export function generateUploadSignature(folder: string): {
  timestamp: number
  signature: string
  apiKey: string
  cloudName: string
  folder: string
} {
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { timestamp, folder }
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    folder,
  }
}

export { cloudinary }
