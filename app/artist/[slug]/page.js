'use client'

import ReleaseLinks from '../../../components/ReleaseLinks'
import Header from '../../../components/Header'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useParams } from 'next/navigation'

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

export default function ArtistPage() {
  const { slug } = useParams()

  const [releases, setReleases] = useState([])
  const [name, setName] = useState('')
  const [covers, setCovers] = useState({})

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
    if (covers[key]) return

    const query = encodeURIComponent(`${r.artists.join(' ')} ${r.title} ${r.year}`)

    try {
      const res = await fetch(`https://api.discogs.com/database/search?q=${query}&type=release`)
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

  useEffect(() => {
    releases.slice(0, 15).forEach(fetchCover)
  }, [releases])

  return (
    <div style={{ padding: '40px', background: '#09090b', minHeight: '100vh', color: '#fff' }}>
      <Header />

      <h1>{name || slug}</h1>

      {releases.map((r, i) => {
        const key = getKey(r)

        return (
          <div key={i} style={{ display: 'flex', gap: 12, padding: 12, background: '#18181b' }}>

            {covers[key] ? (
              <img src={covers[key]} style={{ width: 60, height: 60 }} />
            ) : (
              <div style={{ width: 60, height: 60, background: '#111' }} />
            )}

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
