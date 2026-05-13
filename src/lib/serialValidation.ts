/**
 * Serial number validation service.
 *
 * Abstracts the client CRM integration so the endpoint and auth method
 * can be swapped when client IT provides the final spec.
 *
 * ⚠️  MOCK DATA in use - replace MOCK_SERIAL_NUMBERS with real CRM lookup
 * before MVP launch (July 21, 2026). Set SERIAL_VALIDATION_ENDPOINT env var
 * and mockValidation becomes unreachable.
 */

import { MOCK_SERIAL_NUMBERS } from '@/data/mockSerialNumbers'

export interface SerialValidationResult {
  valid: boolean
  message?: string
}

export async function validateSerialNumber(
  serialNumber: string
): Promise<SerialValidationResult> {
  const endpoint = process.env.SERIAL_VALIDATION_ENDPOINT
  const apiKey = process.env.SERIAL_VALIDATION_API_KEY

  if (!endpoint) {
    return mockValidation(serialNumber)
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ serialNumber }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      console.error(`Serial validation API error: ${response.status}`)
      return { valid: false, message: 'service_unavailable' }
    }

    const data = await response.json()
    return { valid: Boolean(data.valid), message: data.message }
  } catch (error) {
    console.error('Serial validation request failed:', error)
    return { valid: false, message: 'service_unavailable' }
  }
}

function mockValidation(serialNumber: string): SerialValidationResult {
  const isValid = MOCK_SERIAL_NUMBERS.has(serialNumber.trim())
  return {
    valid: isValid,
    message: isValid ? undefined : 'serial_not_found',
  }
}
