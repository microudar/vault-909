'use client'

import Link from 'next/link'

export default function Header({ hideNav = false }) {
  if (hideNav) return null

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      
      <Link
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
      </Link>

      <Link
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
      </Link>

    </div>
  )
}
