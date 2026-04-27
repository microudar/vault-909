'use client'

import Header from '../../components/Header'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

// 🔥 slug
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

// 🔥 поиск ссылки
function buildSearchQuery(r) {
  return encodeURIComponent(`${r.artists.join(' ')} ${r.title}`)
}

// 🔥 парсер
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
        .replace(/\b[Vv]s\.?\b/g, ',')
        .replace(/\b[Ff]eat\.?\b/g, ',')
        .replace(/\b[Ff]t\.?\b/g, ',')
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
  const [loaded, setLoaded] = useState(false)

  // debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(t)
  }, [query])

  // загрузка Excel
  useEffect(() => {
    if (!debouncedQuery || loaded) return

    fetch('/music.xlsx')
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' })

        let list = []

        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

          data.forEach(row => {
            const text = Array.isArray(row) ? row.join(' ') : ''
            const parsed = parseRelease(text)

            if (parsed.title) {
              list.push(parsed)
            }
          })
        })

        setAll(list)
        setLoaded(true)
      })
  }, [debouncedQuery, loaded])

  // фильтр
  const results = all
    .filter(r => {
      if (!debouncedQuery) return false

      const text = [
        r.artists.join(' '),
        r.title,
        r.label,
        r.catalog
      ]
        .join(' ')
        .toLowerCase()

      return text.includes(debouncedQuery.toLowerCase())
    })
    .slice(0, 50)

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

      {!loaded && debouncedQuery && (
        <div style={{ marginBottom: '10px', color: '#71717a' }}>
          Загрузка...
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {results.map((r, i) => (
          <div
            key={i}
            style={{
              padding: '14px 16px',
              border: '1px solid #27272a',
              background: '#18181b',
              borderRadius: '10px'
            }}
          >
            {/* артисты */}
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

            {/* лейбл */}
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

            {/* кнопки */}
            <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
              
              {/* Bandcamp */}
              <a
                href={`https://bandcamp.com/search?q=${buildSearchQuery(r)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '12px',
                  padding: '4px 6px',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#60a5fa',
                  textDecoration: 'none'
                }}
              >
                🟦 BC
              </a>

              {/* Discogs */}
              <a
                href={`https://www.discogs.com/search/?q=${buildSearchQuery(r)}&type=release`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '12px',
                  padding: '4px 6px',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#60a5fa',
                  textDecoration: 'none'
                }}
              >
                🟡 DG
              </a>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
