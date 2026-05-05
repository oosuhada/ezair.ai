export function Header() {
  return (
    <header style={{ padding: '28px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: 24 }}>EZ AIR</strong>
        <span style={{ color: '#64748b' }}>Next.js fullstack scaffold</span>
      </div>
    </header>
  );
}
