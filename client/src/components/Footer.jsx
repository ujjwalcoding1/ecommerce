export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: 80, padding: '40px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Voltage</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Audio and wearable tech, built for everyday carry. Test checkout only — no real charges.
        </span>
      </div>
    </footer>
  );
}
