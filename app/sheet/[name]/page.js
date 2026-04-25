'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useParams } from 'next/navigation'

// 🔥 slug для листов
function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-')
}

// 🔥 slug для артистов (фикс +)
function artistSlug(name) {
  return name
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/\s+/g, '-')
}

// 🔥 slug для лейблов (фикс +)
function labelSlug(name) {
  return name
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/\s+/g, '-')
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

// 🔥 парсер релиза
function parseRelease(text) {
  if (!text) return {}

  text = text.replace(/\[\[/g, '[')

  const match = text.match(/\[(.*?)\]/)

  let label = ''
  let catalog = ''

  if (match) {
    const inside = match[1].replace('//', '/').trim()

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
  const restJoined = parts.join(' - ')

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

  if (restJoined) {
    const words = restJoined.trim().split(' ')
    year = words.pop()
    title = words.join(' ')
  }

  return {
    artists,
    title,
    label,
    catalog,
    year,
  }
}

export default function SheetPage() {
  const { name } = useParams()

  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')

  useEffect(() => {
    fetch('/music.xlsx')
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: 'array' })

        const realName = workbook.SheetNames.find(
          (n) => slugify(n) === name
        )

        if (!realName) {
          console.log('Лист не найден:', name)
          return
        }

        const sheet = workbook.Sheets[realName]
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        setRows(data)
        setTitle(realName)
      })
  }, [name])

  const filtered = rows.filter((row) =>
    Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px' }}>
      
      <button
        onClick={() => window.location.href = '/'}
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
        {title || name}
      </h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск..."
        style={{
          padding: '10px',
          marginBottom: '20px',
          background: '#18181b',
          border: '1px solid #27272a',
          color: '#fff'
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((row, i) => {
          const text = Array.isArray(row)
            ? row.join(' ')
            : Object.values(row).join(' ')

          const parsed = parseRelease(text)

          // 🔥 применяем лейбл из листа
          if (SHEET_LABELS[name]) {
            parsed.label = parsed.label || SHEET_LABELS[name]
          }

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
              {/* Артисты */}
              <div style={{ fontSize: '15px', color: '#fff' }}>
                {parsed.artists.map((artist, i) => (
                  <span key={i}>
                    <a
                      href={`/artist/${artistSlug(artist)}`}
                      style={{ color: '#60a5fa', textDecoration: 'none' }}
                    >
                      {artist}
                    </a>
                    {i < parsed.artists.length - 1 && ', '}
                  </span>
                ))} — {parsed.title}
                {parsed.year && ` (${parsed.year})`}
              </div>

              {/* Лейбл */}
              {(parsed.label || parsed.catalog) && (
                <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
                  
                  {parsed.label && (
                    <a
                      href={`/label/${labelSlug(parsed.label)}`}
                      style={{ color: '#a1a1aa', textDecoration: 'none' }}
                    >
                      {parsed.label}
                    </a>
                  )}

                  {parsed.label && parsed.catalog && ' / '}
                  {parsed.catalog}

                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
