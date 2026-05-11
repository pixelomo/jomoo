// Root-level page is never reached — next-intl middleware redirects
// all traffic to /[locale]/... before this renders.
export default function RootPage() {
  return null
}
