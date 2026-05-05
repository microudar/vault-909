import releases from '../../../data/releases.json'
import { slugify } from '../../../lib/slugify'
import Link from 'next/link'
import Player from '@/app/components/Player'
import BackButton from '@/app/components/BackButton'

export async function generateMetadata({ params }) {
  const release = releases.find(r => String(r.id) === params.slug)

  if (!release) return {}

  return {
    title: `${release.artist} – ${release.title} (${release.year}) | ${release.catalog_number}`,
    description: `${release.title} (${release.year}) — релиз ${release.artist}, выпущенный на ${release.label} (${release.catalog_number}).`,
    alternates: {
      canonical: `https://vault909.ru/release/${params.slug}`
    }
  }
}

export default function Page({ params }) {
  const release = releases.find(r => String(r.id) === params.slug)

  if (!release) {
    return <div style={{ padding: '40px', color: '#fff' }}>Not found</div>
  }

  // 🔥 умный поиск
  const isVA =
    release.artist?.toLowerCase() === 'va' ||
    release.artist?.toLowerCase().includes('various')

  const isUntitled =
    release.title?.toLowerCase().includes('untitled')

  const searchQuery =
    isVA && isUntitled
      ? `${release.label} ${release.catalog_number}`
      : `${release.artist} ${release.title}`

  const ytSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
  const bcSearch = `https://bandcamp.com/search?q=${encodeURIComponent(searchQuery)}`
  const discogsSearch = `https://www.discogs.com/search/?q=${encodeURIComponent(searchQuery)}`

  // 🔥 related релизы
  const related = releases
    .filter(r => r.label === release.label && r.id !== release.id)
    .slice(0, 4)

  const navBtn = {
    padding: '6px 12px',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    textDecoration: 'none',
    color: '#e4e4e7',
    fontSize: '13px'
  }

  const btn = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    border: '1px solid #27272a',
    borderRadius: 8,
    color: '#e4e4e7',
    textDecoration: 'none',
    fontSize: 13,
    background: '#18181b'
  }

  return (
    <div style={{ padding: '40px', color: '#fff', background: '#09090b', minHeight: '100vh' }}>

      {/* NAV */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        <Link href="/" style={navBtn}>← Главная</Link>
        <Link href="/search" style={navBtn}>🔎 Поиск</Link>
      </div>

      <BackButton />

      {/* 🔥 MAIN BLOCK */}
      <div style={{ display: 'flex', gap: 40, marginTop: 20 }}>

        {/* COVER */}
        <div style={{ width: 220 }}>
          <img
            src={`https://via.placeholder.com/300x300?text=${encodeURIComponent(release.title)}`}
            style={{ width: '100%', borderRadius: 12 }}
          />
        </div>

        {/* INFO */}
        <div style={{ flex: 1 }}>

          <h1 style={{ fontSize: 28, marginBottom: 10 }}>
            <Link href={`/artist/${slugify(release.artist)}`} style={{ color: '#fff', textDecoration: 'none' }}>
              {release.artist}
            </Link>{' '}
            — {release.title}
          </h1>

          <div style={{ color: '#a1a1aa', marginBottom: 20 }}>
            {release.year}
          </div>

          {/* META BOX */}
          <div style={{
            padding: 16,
            background: '#111',
            border: '1px solid #222',
            borderRadius: 10,
            marginBottom: 20
          }}>

            <div style={{ marginBottom: 10 }}>
              Label:{' '}
              <Link
                href={`/label/${slugify(release.label)}`}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  background: '#18181b',
                  border: '1px solid #27272a',
                  color: '#e4e4e7',
                  textDecoration: 'none',
                  fontSize: 13
                }}
              >
                {release.label}
              </Link>
            </div>

            <div style={{ color: '#a1a1aa' }}>
              Cat: {release.catalog_number}
            </div>

          </div>

          {/* DESCRIPTION */}
          <div style={{ color: '#a1a1aa', marginBottom: 20 }}>
            {release.title} ({release.year}) — релиз {release.artist}, выпущенный на {release.label}.
          </div>

          {/* BUTTONS */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>

            <a href={ytSearch} target="_blank" style={btn}>
              ▶ YouTube
            </a>

            <a href={bcSearch} target="_blank" style={btn}>
              🟡 Bandcamp
            </a>

            <a href={discogsSearch} target="_blank" style={btn}>
              ⬤ Discogs
            </a>

          </div>

          {/* PLAYER */}
          <div style={{
            padding: 16,
            background: '#111',
            borderRadius: 10
          }}>
            <Player release={release} />
          </div>

        </div>
      </div>

      {/* 🔥 RELATED */}
      {related.length > 0 && (
        <div style={{ marginTop: 50 }}>
          <h3 style={{ marginBottom: 15 }}>More from {release.label}</h3>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {related.map(r => (
              <Link
                key={r.id}
                href={`/release/${r.id}`}
                style={{
                  width: 200,
                  textDecoration: 'none',
                  color: '#fff'
                }}
              >
                <div style={{
                  background: '#111',
                  padding: 10,
                  borderRadius: 10
                }}>
                  <div style={{ fontSize: 13, marginBottom: 5 }}>
                    {r.artist}
                  </div>
                  <div style={{ fontSize: 12, color: '#a1a1aa' }}>
                    {r.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
