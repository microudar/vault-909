'use client'

import ReleaseLinks from '../../../components/ReleaseLinks'
import Header from '../../../components/Header'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

function normalizeSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\+/g, 'plus')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

function getKey(r) {
  return `${r.artists.join('-')}-${r.title}`
}

function getReleaseKey(r) {
  return [r.artists.join(','), r.title, r.year].join('|').toLowerCase()
}

function parseRelease(text) {
  if (!text) return {}

  text = text.replace(/\[\[/g, '[')
  const match = text.match(/\[(.*?)\]/)

  let label = ''
  let catalog = ''

  if (match) {
    const inside = match[1].replace(/\/+/g, '/').trim()
    if (inside.includes('/')) {
      const parts = inside.split('/')
      label = parts[0]?.trim() || ''
      catalog = parts[1]?.trim() || ''
    } else {
      catalog = inside
    }
  }

  const cleaned = text.replace(/\[.*?\]/, '').trim()
  const parts = cleaned.split(' - ')
  const artistPart = parts.shift()
  const rest = parts.join(' - ')

  const artists = artistPart
    ? artistPart.replace(/\b(feat|ft|vs)\.?/gi, ',')
        .split(/[\/,&,]/)
        .map(a => a.trim())
        .filter(Boolean)
    : []

  let title = ''
  let year = ''

  if (rest) {
    const words = rest.trim().split(' ')
    year = words.pop()
    title = words.join(' ')
  }

  return { artists, title, year, label, catalog }
}

export default function ArtistClient({ slug })

  const [releases, setReleases] = useState([])
  const [name, setName] = useState('')

  // 🔥 КЭШ ОБЛОЖЕК
  const [covers, setCovers] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('covers')
      return cached ? JSON.parse(cached) : {}
    }
    return {}
  })

  // сохраняем кэш
  useEffect(() => {
    localStorage.setItem('covers', JSON.stringify(covers))
  }, [covers])

  useEffect(() => {
    fetch('/music.xlsx')
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' })

        let all = []
        const seen = new Set()

        workbook.SheetNames.forEach(sheetName => {
          const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })

          data.forEach(row => {
            const parsed = parseRelease(Array.isArray(row) ? row.join(' ') : '')

            if (parsed.artists.some(a => normalizeSlug(a) === slug)) {
              const key = getReleaseKey(parsed)

              if (!seen.has(key)) {
                seen.add(key)
                all.push(parsed)
              }

              const found = parsed.artists.find(a => normalizeSlug(a) === slug)
              if (found && !name) setName(found)
            }
          })
        })

        all.sort((a, b) => Number(b.year) - Number(a.year))
        setReleases(all)
      })
  }, [slug])

  async function fetchCover(r) {
    const key = getKey(r)

    // уже есть — не грузим
    if (covers[key]) return

    const query = encodeURIComponent(`${r.artists.join(' ')} ${r.title} ${r.year}`)

    try {
      const res = await fetch(
        `https://api.discogs.com/database/search?q=${query}&type=release`
      )
      const data = await res.json()

      const cover =
        data.results?.[0]?.cover_image ||
        data.results?.[0]?.thumb

      if (cover) {
        setCovers(prev => ({ ...prev, [key]: cover }))
        return
      }
    } catch {}

    try {
      const itunes = await fetch(
        `https://itunes.apple.com/search?term=${query}&entity=album`
      ).then(r => r.json())

      const img = itunes.results?.[0]?.artworkUrl100

      if (img) {
        setCovers(prev => ({ ...prev, [key]: img }))
      }
    } catch {}
  }

  // 🔥 грузим только часть (ускорение)
  useEffect(() => {
    releases.slice(0, 10).forEach(fetchCover)
  }, [releases])

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff' }}>
      
      <Header />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
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

          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
  {name || slug}
</h1>

<p style={{
  color: '#a1a1aa',
  marginBottom: '20px',
  maxWidth: '600px'
}}>
  {name || slug} — электронный артист (коллектив). Здесь собрана дискография,
  включая EP, альбомы и редкие релизы.
</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {releases.map((r, i) => {
            const key = getKey(r)
            const cover = covers[key]

            return (
              <div
                key={i}
                style={{
                  padding: '14px 16px',
                  border: '1px solid #27272a',
                  background: '#18181b',
                  borderRadius: '10px'
                }}
              >

                <div style={{ display: 'flex', gap: '12px' }}>

                  <img
                    src={cover || '/no-cover.png'}
                    alt=""
                    style={{
                      width: '56px',
                      height: '56px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      background: '#000'
                    }}
                  />

                  <div style={{ flex: 1 }}>

                    <div>
                      {r.artists.map((artist, i) => (
                        <span key={i}>
                          <a
                            href={`/artist/${normalizeSlug(artist)}`}
                            style={{ color: '#60a5fa', textDecoration: 'none' }}
                          >
                            {artist}
                          </a>
                          {i < r.artists.length - 1 && ', '}
                        </span>
                      ))}{' '}
                      — {r.title} ({r.year})
                    </div>

                    <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
                      {r.label && (
                        <a
                          href={`/label/${normalizeSlug(r.label)}`}
                          style={{ color: '#a1a1aa', textDecoration: 'none' }}
                        >
                          {r.label}
                        </a>
                      )}
                      {r.label && r.catalog && ' / '}
                      {r.catalog}
                    </div>

                    <ReleaseLinks r={r} />

                  </div>

                </div>

              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}
