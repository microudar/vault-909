'use client'

function buildSearchQuery(r) {
  return encodeURIComponent(`${r.artists?.join(' ')} ${r.title}`)
}

export default function ReleaseLinks({ r }) {
  const bandcampUrl = `https://bandcamp.com/search?q=${buildSearchQuery(r)}`
  const discogsUrl = `https://www.discogs.com/search/?q=${buildSearchQuery(r)}&type=release`

  return (
    <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>

      {/* Bandcamp */}
      <a
        href={bandcampUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '26px',
          height: '26px',
          border: '1px solid #27272a',
          borderRadius: '6px',
          background: 'transparent',
          transition: '0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#27272a'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#60a5fa">
          <path d="M3 17h6l6-10h6l-6 10h6" />
        </svg>
      </a>

      {/* Discogs */}
      <a
        href={discogsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '26px',
          height: '26px',
          border: '1px solid #27272a',
          borderRadius: '6px',
          background: 'transparent',
          transition: '0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#27272a'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#facc15">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" fill="#09090b" />
        </svg>
      </a>

    </div>
  )
}
