import Link from 'next/link'

export default function RootNotFound() {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#fff', color: '#0a0a0a' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 40px' }}>
          <div style={{ maxWidth: 560 }}>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a8a8a8', display: 'block', marginBottom: 24 }}>
              [ ERROR · 404 ]
            </span>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
              页面不存在
              <span style={{ display: 'block', fontSize: '0.5em', fontWeight: 400, color: '#757575', marginTop: 8, letterSpacing: 0 }}>Page Not Found</span>
            </h1>
            <div style={{ width: 48, height: 3, background: '#0046E5', marginBottom: 40 }} />
            <Link
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0046E5', color: '#fff', fontSize: 13, fontWeight: 700, padding: '14px 24px', textDecoration: 'none', letterSpacing: '0.04em' }}
            >
              返回首页 / Back to Home →
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
