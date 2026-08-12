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

export type OcrOutcome =
  | { status: 'ok'; text: string }
  /** The add-on is not on the Cloudinary plan — the caller falls back to typing. */
  | { status: 'unavailable'; detail: string }
  /** Ran, but found no text at all: a dark or out-of-focus photograph. */
  | { status: 'no_text' }

/**
 * Reads the text off an already-uploaded image.
 *
 * Uses `explicit` rather than asking for OCR during the upload itself, so the
 * signed upload params stay as they are and a failure surfaces here — on the
 * server, where it can be logged — instead of breaking the member's upload.
 *
 * Requires Cloudinary's "OCR Text Detection and Extraction" add-on. Without it
 * every call fails, so that case is reported rather than thrown: a member must
 * still be able to register by typing the number.
 */
export async function readTextFromImage(publicId: string): Promise<OcrOutcome> {
  try {
    const result = await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      ocr: 'adv_ocr',
    })

    const data = (
      result as {
        info?: { ocr?: { adv_ocr?: { status?: string; data?: unknown[] } } }
      }
    ).info?.ocr?.adv_ocr

    // Without the subscription, `explicit` quietly drops the ocr parameter and
    // answers with an ordinary asset payload — no error, no info block. Only
    // `upload` fails loudly. Treating that silence as "no text" would report a
    // missing add-on as an unreadable photograph, so it is caught by the
    // absent key instead.
    if (!data) {
      console.error(
        '[ocr] no OCR block in the Cloudinary response — the "OCR Text Detection and ' +
          'Extraction" add-on is probably not active on this account'
      )
      return { status: 'unavailable', detail: 'add-on not active' }
    }

    const first = data.data?.[0] as
      | { fullTextAnnotation?: { text?: string }; textAnnotations?: { description?: string }[] }
      | undefined

    const text = first?.fullTextAnnotation?.text ?? first?.textAnnotations?.[0]?.description ?? ''

    return text.trim() ? { status: 'ok', text } : { status: 'no_text' }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[ocr] Cloudinary OCR failed', detail)
    return { status: 'unavailable', detail }
  }
}

export { cloudinary }
