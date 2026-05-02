'use client'

import ReleaseLinks from '../../components/ReleaseLinks'
import Header from '../../components/Header'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

// slug
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

// ключ
function getKey(r) {
  return `${r.artists.join('-')}-${r.title}`
}

// парсер
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
    ? artistPart
        .replace(/\b(feat|ft|vs)\.?/gi, ',')
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

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [all, setAll] = useState([])
  const [covers, setCovers] = useState({})

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  // загрузка excel (один раз)
  useEffect(() => {
    fetch('/music.xlsx')
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' })

        let list = []

        workbook.SheetNames.forEach(sheet => {
          const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 })

          data.forEach(row => {
            const parsed = parseRelease(Array.isArray(row) ? row.join(' ') : '')
            if (parsed.title) list.push(parsed)
          })
        })

        setAll(list)
      })
  }, [])

  // fetch cover
  async function fetchCover(r) {
    const key = getKey(r)
    if (covers[key]) return

    const q = encodeURIComponent(`${r.artists.join(' ')} ${r.title} ${r.year}`)

    // Discogs
    try {
      const res = await fetch(`https://api.discogs.com/database/search?q=${q}&type=release`)
      const data = await res.json()

      const cover =
        data.results?.[0]?.cover_image ||
        data.results?.[0]?.thumb

      if (cover) {
        setCovers(prev => ({ ...prev, [key]: cover }))
        return
      }
    } catch {}

    // iTunes fallback
    try {
      const itunes = await fetch(
        `https://itunes.apple.com/search?term=${q}&entity=album`
      ).then(r => r.json())

      const img = itunes.results?.[0]?.artworkUrl100

      if (img) {
        setCovers(prev => ({ ...prev, [key]: img }))
      }
    } catch {}
  }

  // фильтр
  const results = all
    .filter(r => {
      if (!debouncedQuery) return false

      const text = `${r.artists.join(' ')} ${r.title} ${r.label} ${r.catalog}`.toLowerCase()
      return text.includes(debouncedQuery.toLowerCase())
    })
    .slice(0, 40)

  // загрузка обложек
  useEffect(() => {
    results.slice(0, 15).forEach(fetchCover)
  }, [results])

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px' }}>
      
      <Header />

      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        Search
      </h1>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search artist, label, release..."
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          background: '#18181b',
          border: '1px solid #27272a',
          color: '#fff'
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {results.map((r, i) => {
          const key = getKey(r)

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '14px 16px',
                border: '1px solid #27272a',
                background: '#18181b',
                borderRadius: '10px'
              }}
            >
              {/* COVER */}
              {covers[key] ? (
                <img
                  src={covers[key]}
                  alt=""
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    background: '#111',
                    borderRadius: '6px',
                    flexShrink: 0
                  }}
                />
              )}

              {/* CONTENT */}
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
          )
        })}
      </div>
    </div>
  )
}
