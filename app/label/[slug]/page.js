'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useParams } from 'next/navigation'

// 🔥 единый slug (как везде)
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

function extractNumber(str) {
  const match = str?.match(/\d+/)
  return match ? Number(match[0]) : 0
}

function getReleaseKey(r) {
  return [
    r.artists.join(','),
    r.title,
    r.year
  ].join('|').toLowerCase()
}

// 🔥 привязка листов к лейблам
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

export default function LabelPage() {
  const { slug } = useParams()

  const [releases, setReleases] = useState([])
  const [labelName, setLabelName] = useState('')

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

            // 🔥 добавляем лейбл из листа
            if (SHEET_LABELS[sheetName]) {
              parsed.label = parsed.label || SHEET_LABELS[sheetName]
            }

            // 🔥 фильтр по лейблу
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

       all.sort((a, b) => {
  const catA = (a.catalog || '').toLowerCase()
  const catB = (b.catalog || '').toLowerCase()

  const baseA = catA.replace(/\d+/g, '').trim()
  const baseB = catB.replace(/\d+/g, '').trim()

  if (baseA !== baseB) {
    return baseA.localeCompare(baseB)
  }

  const numA = extractNumber(catA)
  const numB = extractNumber(catB)

  return numA - numB
})

        setReleases(all)
      })
  }, [slug])

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px' }}>
      
      {/* кнопка */}
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

      {/* заголовок */}
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        {labelName || slug}
      </h1>

      {/* список */}
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
            {/* артисты */}
            <div>
              {r.artists.map((artist, i) => (
                <span key={i}>
                  <a
                    href={`/artist/${normalizeSlug(artist)}`}
                    style={{
                      color: '#60a5fa',
                      textDecoration: 'none'
                    }}
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
                  style={{
                    color: '#a1a1aa',
                    textDecoration: 'none'
                  }}
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
