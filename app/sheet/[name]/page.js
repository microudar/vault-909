'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useParams } from 'next/navigation'

// 🔥 slug функция
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
}

// 🔥 парсер релиза
function parseRelease(text) {
  if (!text) return {}
  // 🔥 убираем год в начале строки (например "Brodinski 2011 — ...")
// 🔥 убираем год перед "—" (любой формат пробелов)
text = text.replace(/^(.*?)\s+\d{4}\s+—/, '$1 —')
// 🔥 чистим двойные скобки
text = text.replace(/\[\[/g, '[')
  const match = text.match(/\[(.*?)\]/)

  let label = ''
  let catalog = ''

  if (match) {
    const inside = match[1]
  .replace('//', '/')
  .trim()

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

// 🔥 чистим артиста от года
const cleanArtistPart = artistPart
  ? artistPart
      .replace(/\s*\b\d{4}\b$/, '') // 🔥 убираем год ТОЛЬКО в конце
      .trim()
  : ''

let artists = []

if (cleanArtistPart) {
  if (cleanArtistPart.toLowerCase() === 'va') {
    const parts = restJoined.split(' - ')
    const possibleArtist = parts[1]

    if (possibleArtist) {
      artists = [possibleArtist.trim()]
    } else {
      artists = ['VA']
    }
  } else {
    artists = cleanArtistPart
      .split(/[\/,&]/)
      .map(a => a.trim())
      .filter(Boolean)
  }
}

let title = ''
let year = ''

if (restJoined) {
  // 🔥 ищем год нормально
  const yearMatch = restJoined.match(/\b\d{4}\b/)
  year = yearMatch ? yearMatch[0] : ''

  // 🔥 убираем год из названия
  title = restJoined.replace(/\b\d{4}\b/, '').trim()
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

        // 🔥 ищем реальное имя листа
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
      {/* Заголовок */}
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        {title || name}
      </h1>

      {/* Поиск */}
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

      {/* Список релизов */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((row, i) => {
          const text = Array.isArray(row)
  ? row.join(' ')
  : Object.values(row).join(' ')
          const parsed = parseRelease(text)

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
              {/* Артист + название */}
              <div style={{ fontSize: '15px', color: '#fff' }}>
                {parsed.artists.map((artist, i) => (
  <span key={i}>
    <a
      href={`/artist/${artist.toLowerCase().replace(/\s+/g, '-')}`}
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
                  {parsed.label}
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
