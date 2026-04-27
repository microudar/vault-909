'use client'

function buildSearchQuery(r) {
  return encodeURIComponent(`${r.artists.join(' ')} ${r.title}`)
}

export default function ReleaseLinks({ r }) {
  return (
    <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
      
      {/* Bandcamp */}
      <a
        href={`https://bandcamp.com/search?q=${buildSearchQuery(r)}`}
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
          textDecoration: 'none',
          fontSize: '12px'
        }}
      >
        🟦
      </a>

      {/* Discogs */}
      <a
        href={`https://www.discogs.com/search/?q=${buildSearchQuery(r)}&type=release`}
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
          textDecoration: 'none',
          fontSize: '12px'
        }}
      >
        🟡
      </a>

    </div>
  )
}
