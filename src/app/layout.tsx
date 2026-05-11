// Root layout — intentionally minimal.
// Locale layouts (app/[locale]/layout.tsx) provide <html>, <body>, and providers.
// Studio layout (app/studio/layout.tsx) provides its own <html> and <body>.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
