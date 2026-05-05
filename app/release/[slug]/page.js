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
    console.log('NOT FOUND:', params.slug)
    return <div style={{ padding: '40px', color: '#fff' }}>Not found</div>
  }

  // 🔥 УМНЫЙ ПОИСК (VA + Untitled фикс)
  const isVA =
    release.artist?.toLowerCase() === 'va' ||
    release.artist?.toLowerCase() === 'v.a.' ||
    release.artist?.toLowerCase().includes('various')

  const isUntitled =
    release.title?.toLowerCase().includes('untitled')

  const searchQuery =
    isVA && isUntitled
      ? `${release.label} ${release.catalog_number}`
      : `${release.artist} ${release.title}`

  // 🔗 Поисковые ссылки
  const ytSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
  const bcSearch = `https://bandcamp.com/search?q=${encodeURIComponent(searchQuery)}`
  const discogsSearch = `https://www.discogs.com/search/?q=${encodeURIComponent(searchQuery)}`

  // 🎨 UI
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
    padding: '6px 12px',
    border: '1px solid #333',
    borderRadius: 6,
    color: '#fff',
    textDecoration: 'none',
    fontSize: 13,
    background: '#111'
  }

  const icon = {
    fontSize: 12,
    opacity: 0.8
  }

  return (
    <div style={{ padding: '40px', color: '#fff', background: '#09090b', minHeight: '100vh' }}>

      {/* 🔥 Навигация */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <Link href="/" style={navBtn}>← Главная</Link>
        <Link href="/search" style={navBtn}>🔎 Поиск</Link>
      </div>

      {/* 🔥 Назад */}
      <div style={{ marginBottom: 20 }}>
        <BackButton />
      </div>

      {/* 🔥 Заголовок */}
      <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
        {release.artist} — {release.title}
      </h1>

      <div style={{ color: '#a1a1aa', marginBottom: '20px' }}>
        {release.year}
      </div>

      {/* 🔥 Label + Cat */}
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        <div>
          Label:{' '}
          <Link
            href={`/label/${slugify(release.label)}`}
            style={{
              display: 'inline-block',
              padding: '5px 10px',
              borderRadius: '8px',
              background: '#18181b',
              border: '1px solid #27272a',
              color: '#e4e4e7',
              textDecoration: 'none',
              fontSize: '13px'
            }}
          >
            {release.label}
          </Link>
        </div>

        <div style={{ color: '#a1a1aa' }}>
          Cat: {release.catalog_number}
        </div>
      </div>

      {/* 🔥 Описание */}
      <div style={{ color: '#a1a1aa', maxWidth: '600px', marginBottom: '20px' }}>
        {release.title} ({release.year}) — релиз {release.artist}, выпущенный на {release.label} ({release.catalog_number}).
      </div>

      {/* 🔥 Кнопки */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>

        <a href={ytSearch} target="_blank" rel="noopener noreferrer" style={btn}>
          <span style={icon}>▶</span>
          YouTube
        </a>

        <a href={bcSearch} target="_blank" rel="noopener noreferrer" style={btn}>
          <span style={icon}>🟡</span>
          Bandcamp
        </a>

        <a href={discogsSearch} target="_blank" rel="noopener noreferrer" style={btn}>
          <span style={icon}>⬤</span>
          Discogs
        </a>

      </div>

      {/* 🔥 Плеер */}
      <Player release={release} />

    </div>
  )
}
