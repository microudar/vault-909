'use client'

import ReleaseLinks from '../../../components/ReleaseLinks'
import Header from '../../../components/Header'
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

// номер из каталога
function extractNumber(str) {
  const match = str?.match(/\d+/)
  return match ? Number(match[0]) : 0
}

// уникальность
function getReleaseKey(r) {
  return [
    r.artists.join(','),
    r.title,
    r.year
  ].join('|').toLowerCase()
}

// sheet → label
const SHEET_LABELS = {
  '1': 'M_nus',
  '2': 'Plus 8 Records Ltd.',
  '3': 'Mobilee',
  '4': 'Delsin',
  '5': 'Ostgut Ton',
  '6': 'Blueprint',
  '7': 'Echocord',
  '8': 'Semantica',
  '9': 'Prologue',
  '10': 'Sandwell District',
  '11': 'Stroboscopic Artefacts',
  '12': 'Tresor',
  '13': 'Music Man Records',
  '14': 'Synewave',
  '15': 'Modern Love',
  '16': '50Weapons',
  '17': 'Downwards',
  '18': 'L.I.E.S. (Long Island Electrical Systems)',
  '19': 'Stil Vor Talent',
  '20': 'Ovum Recordings',
  '21': 'Wolf + Lamb Music',
  '22': 'Liebe*Detail Digital',
  '23': 'Systematic',
  '24': 'Dirtybird',
  '25': 'Traum Schallplatten',
  '26': 'Border Community',
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

export default function LabelClient({ slug }) {

  const [releases, setReleases] = useState([])
  const [labelName, setLabelName] = useState('')
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

            if (SHEET_LABELS[sheetName]) {
              parsed.label = parsed.label || SHEET_LABELS[sheetName]
            }

            if (normalizeSlug(parsed.label) === slug) {
              const key = getReleaseKey(parsed)

              if (!seen.has(key)) {
                seen.add(key)
                all.push(parsed)
              }

              if (!labelName) setLabelName(parsed.label)
            }
          })
        })

        // сортировка по каталогу
        all.sort((a, b) => {
          const numA = extractNumber(a.catalog)
          const numB = extractNumber(b.catalog)

          if (numA !== numB) return numA - numB
          return (a.catalog || '').localeCompare(b.catalog || '')
        })

        setReleases(all)
      })
  }, [slug])

  // 🔥 ОБЛОЖКИ
  async function fetchCover(r) {
    const key = getKey(r)
    if (covers[key]) return

    const query = encodeURIComponent(
      `${r.artists.join(' ')} ${r.title} ${r.year}`
    )

    // 1. Discogs
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

    // 2. iTunes fallback
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
  releases.forEach((r, i) => {
    setTimeout(() => {
      fetchCover(r)
    }, i * 300)
  })
}, [releases])

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
  {labelName || slug}
</h1>

<p style={{
  color: '#a1a1aa',
  marginBottom: '20px',
  maxWidth: '600px'
}}>
  {labelName || slug} — лейбл электронной музыки. Здесь представлен каталог релизов,
  включая EP, винил и альбомы.
</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {releases.map((r, i) => {
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
