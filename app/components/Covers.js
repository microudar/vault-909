'use client'

import { useEffect, useState } from 'react'

export default function Cover({ release }) {
  const [cover, setCover] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const isVA =
          release.artist?.toLowerCase() === 'va' ||
          release.artist?.toLowerCase().includes('various')

        const isUntitled =
          release.title?.toLowerCase().includes('untitled')

        const query =
          isVA && isUntitled
            ? `${release.label} ${release.catalog_number}`
            : `${release.artist} ${release.title} ${release.year}`

        const res = await fetch(`/api/discogs?q=${encodeURIComponent(query)}`)
        const data = await res.json()

        const img =
          data.results?.[0]?.cover_image ||
          data.results?.[0]?.thumb

        if (img) setCover(img)
      } catch {}
    }

    load()
  }, [release])

  const fallback = `https://via.placeholder.com/300x300?text=${encodeURIComponent(release.title)}`

  return (
    <div style={{ width: 220 }}>
      <img
        src={cover || fallback}
        alt={release.title}
        style={{
          width: '100%',
          borderRadius: 12,
          border: '1px solid #222'
        }}
      />
    </div>
  )
}
