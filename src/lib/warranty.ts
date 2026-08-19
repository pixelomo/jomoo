/**
 * How long a warranty runs.
 *
 * Three years from the installation date, matching what the JOMOO Club section
 * of the warranty terms promises a member who registers their product. Kept in
 * one place because the length was previously written out twice in the
 * registration route — once for the record and once for the email — which is
 * exactly the sort of pair that drifts apart.
 */
export const WARRANTY_YEARS = 3

/** Expiry as a plain YYYY-MM-DD date, which is how the column stores it. */
export function warrantyExpiryFrom(installationDate?: string | null): string {
  const base = installationDate ? new Date(installationDate) : new Date()
  const expiry = new Date(base)
  expiry.setFullYear(expiry.getFullYear() + WARRANTY_YEARS)
  return expiry.toISOString().split('T')[0]
}
