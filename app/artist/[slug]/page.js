'use client'

import Header from '../../../components/Header'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useParams } from 'next/navigation'

// 🔥 тот же slug
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

function getReleaseKey(r) {
  return [
    r.artists.join(','),
    r.title,
    r.year
  ].join('|').toLowerCase()
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
    ? artistPart
        .replace(/\b[Vv]s\.?\b/g, ',')
        .replace(/\b[Ff]eat\.?\b/g, ',')
        .replace(/\b[Ff]t\.?\b/g, ',')
        .replace(/,\s*\./g, ',')
        .split(/[\/,&,]/)
        .map(a => a.trim().replace(/^\.+/, ''))
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

  useEffect(() => {
    fetch('/music.xlsx')
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' })

        let all = []
const seen = new Set()

        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

          data.forEach(row => {
            const text = Array.isArray(row) ? row.join(' ') : ''
            const parsed = parseRelease(text)

            if (parsed.artists.some(a => normalizeSlug(a) === slug)) {
              const key = getReleaseKey(parsed)

if (!seen.has(key)) {
  seen.add(key)
  all.push(parsed)
}

              all.sort((a, b) => Number(b.year) - Number(a.year))

              const found = parsed.artists.find(a => normalizeSlug(a) === slug)
              if (found && !name) setName(found)
            }
          })
        })

        setReleases(all)
      })
  }, [slug])

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px' }}>
      <Header />
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {releases.map((r, i) => (
          <div
            key={i}
            style={{
              padding: '14px 16px',
              border: '1px solid #27272a',
              background: '#18181b',
              borderRadius: '10px'
            }}
          >
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
          </div>
        ))}
      </div>
    </div>
  )
}
