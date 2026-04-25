'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useParams } from 'next/navigation'

// 🔥 универсальный slug
function normalizeSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\+/g, 'plus')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
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
  '22': 'Liebe*Detail Digital',
  '23': 'Systematic',
  '24': 'Dirtybird',
  '25': 'Traum Schallplatten',
  '26': 'Border Community',
}

function parseRelease(text) {
  if (!text) return {}

  text = text.replace(/\[+/g, '[')
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

export default function SheetPage() {
  const { name } = useParams()

  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')

  useEffect(() => {
    fetch('/music.xlsx')
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' })

        const realName = workbook.SheetNames.find(
          n => normalizeSlug(n) === name
        )

        if (!realName) return

        const sheet = workbook.Sheets[realName]
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        setRows(data)
        setTitle(realName)
      })
  }, [name])

  const filtered = rows.filter(row =>
    Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px' }}>

      <button onClick={() => window.location.href = '/'}>← Назад</button>

      <h1>{title || name}</h1>

      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск..." />

      {filtered.map((row, i) => {
        const text = Array.isArray(row) ? row.join(' ') : Object.values(row).join(' ')
        const parsed = parseRelease(text)

        if (SHEET_LABELS[name]) {
          parsed.label = parsed.label || SHEET_LABELS[name]
        }

        return (
          <div key={i}>
            {parsed.artists.map((artist, i) => (
              <a key={i} href={`/artist/${normalizeSlug(artist)}`}>{artist}</a>
            ))} — {parsed.title} ({parsed.year})

            <div>
              {parsed.label && (
                <a href={`/label/${normalizeSlug(parsed.label)}`}>
                  {parsed.label}
                </a>
              )}
              {parsed.catalog && ` / ${parsed.catalog}`}
            </div>
          </div>
        )
      })}
    </div>
  )
}
