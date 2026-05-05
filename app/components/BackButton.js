'use client'

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      style={{
        marginBottom: '20px',
        padding: '8px 14px',
        background: '#18181b',
        border: '1px solid #27272a',
        color: '#fff',
        cursor: 'pointer'
      }}
    >
      ← Назад
    </button>
  )
}
