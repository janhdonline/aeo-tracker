export default function Custom500() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0F172A', color: '#fff' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px', padding: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>500 — System Error</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>An unexpected internal exception occurred. Please return to the homepage or try again later.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', borderRadius: '8px', backgroundColor: '#ffffff', color: '#0F172A', fontWeight: 600, textDecoration: 'none', fontSize: '13px' }}>
          Return to Homepage
        </a>
      </div>
    </div>
  );
}
