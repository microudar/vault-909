export default function Header() {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <a
        href="/"
        style={{
          padding: '8px 14px',
          background: '#18181b',
          border: '1px solid #27272a',
          color: '#fff',
          textDecoration: 'none'
        }}
      >
        ← Главная
      </a>

      <a
        href="/search"
        style={{
          padding: '8px 14px',
          background: '#18181b',
          border: '1px solid #27272a',
          color: '#fff',
          textDecoration: 'none'
        }}
      >
        🔍 Поиск
      </a>
    </div>
  )
}
