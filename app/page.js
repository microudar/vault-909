'use client'

import Header from '../components/Header'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090b',
      color: '#fff',
      padding: '40px'
    }}>
      
      <Header />

      <h1 style={{ fontSize: '32px' }}>
        Vault 909
      </h1>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <a href="/search">🔍 Search</a>
        <a href="/sheet/albums">📀 Albums</a>
      </div>

    </div>
  )
}
