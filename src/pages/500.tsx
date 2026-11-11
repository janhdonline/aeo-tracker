export default function Custom500() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', backgroundColor: '#0B0F17', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>500 — Internal Error</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Something went wrong. Please return to the homepage.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 20px', borderRadius: '12px', backgroundColor: '#D4F63C', color: '#000', fontWeight: 700, textDecoration: 'none', fontSize: '13px' }}>
          Back to Safety
        </a>
      </div>
    </div>
  );
}
