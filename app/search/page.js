'use client'

import ReleaseLinks from '../../components/ReleaseLinks'
import Header from '../../components/Header'
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

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [all, setAll] = useState([])
  const [covers, setCovers] = useState({})

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (!debouncedQuery || all.length) return

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
  }, [debouncedQuery])

  async function fetchCover(r) {
    const key = `${r.artists.join('-')}-${r.title}`
    if (covers[key]) return

    try {
      const q = encodeURIComponent(`${r.artists[0]} ${r.title}`)
      const res = await fetch(`https://api.discogs.com/database/search?q=${q}&type=release`)
      const data = await res.json()
      const img = data.results?.[0]?.cover_image
      if (img) setCovers(prev => ({ ...prev, [key]: img }))
    } catch {}
  }

  const results = all
    .filter(r => {
      if (!debouncedQuery) return false
      return `${r.artists} ${r.title} ${r.label}`.toLowerCase().includes(debouncedQuery.toLowerCase())
    })
    .slice(0, 30)

  useEffect(() => {
    results.slice(0, 15).forEach(fetchCover)
  }, [results])

  return (
    <div style={{ padding: '40px', background: '#09090b', minHeight: '100vh', color: '#fff' }}>
      <Header />
      <h1>Search</h1>

      <input value={query} onChange={e => setQuery(e.target.value)} />

      {results.map((r, i) => {
        const key = `${r.artists.join('-')}-${r.title}`

        return (
          <div key={i} style={{ display: 'flex', gap: 12, padding: 12, background: '#18181b' }}>
            <img src={covers[key] || ''} style={{ width: 60, height: 60 }} />

            <div>
              {r.artists.join(', ')} — {r.title} ({r.year})
              <div>{r.label} / {r.catalog}</div>
              <ReleaseLinks r={r} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
