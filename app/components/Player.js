'use client'

export default function Player({ release }) {
  if (!release) return null

  const sc = release.soundcloud

  if (!sc) return null

  return (
    <div style={{ marginTop: 20 }}>
      <iframe
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(sc)}`}
      />
    </div>
  )
}
