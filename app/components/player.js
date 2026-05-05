'use client'

import { useEffect, useState } from 'react'

export default function Player({
  artist,
  title,
  soundcloud,
  bandcamp
}) {
  const [scUrl, setScUrl] = useState(null)

  useEffect(() => {
    if (!artist || !title) return

    // 👉 если нет вручную заданного soundcloud — ищем
    if (!soundcloud) {
      fetch(`/api/soundcloud?q=${encodeURIComponent(`${artist} ${title}`)}`)
        .then(res => res.json())
        .then(data => {
          if (data.url) setScUrl(data.url)
        })
        .catch(() => {})
    }
  }, [artist, title, soundcloud])

  const finalSc = soundcloud || scUrl

  return (
    <div style={{ marginTop: 20 }}>
      {/* 🎧 SoundCloud */}
      {finalSc && (
        <iframe
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={finalSc}
        />
      )}

      {/* 🎧 Bandcamp */}
      {bandcamp && (
        <iframe
          style={{ border: 0, width: '100%', height: 120, marginTop: 10 }}
          src={bandcamp}
          seamless
        />
      )}
    </div>
  )
}
