'use client'

import Header from '../components/Header'
import ReleaseLinks from '../components/ReleaseLinks'
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

export default function Home() {
  const [sheets, setSheets] = useState([])
  const [query, setQuery] = useState('')
  const [latest, setLatest] = useState([])

  useEffect(() => {
    fetch('/music.xlsx')
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' })

        // категории
        setSheets(workbook.SheetNames.map(name => ({ name })))

        // 🔥 собираем последние релизы
        let all = []

        workbook.SheetNames.forEach(sheetName => {
          const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })

          data.forEach(row => {
            const parsed = parseRelease(Array.isArray(row) ? row.join(' ') : '')
            if (parsed.title) all.push(parsed)
          })
        })

        all.sort((a, b) => Number(b.year) - Number(a.year))
        setLatest(all.slice(0, 12))
      })
  }, [])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#e4e4e7' }}>
      
      <Header />

      {/* HERO */}
      <div style={{ borderBottom: '1px solid #27272a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900' }}>
            Архив 909
          </h1>
          <p style={{ color: '#a1a1aa' }}>
            Архив электронной музыки
          </p>
        </div>
      </div>

      {/* ПОИСК */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Поиск..."
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px',
            background: '#18181b',
            border: '1px solid #27272a',
            color: '#fff'
          }}
        />
      </div>

      {/* 🔥 ПОСЛЕДНИЕ РЕЛИЗЫ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ marginBottom: '10px' }}>Последние релизы</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {latest.map((r, i) => (
            <div
              key={i}
              style={{
                padding: '12px',
                border: '1px solid #27272a',
                background: '#18181b',
                borderRadius: '10px'
              }}
            >
              <div>
                {r.artists.map((a, i) => (
                  <span key={i}>
                    <a href={`/artist/${normalizeSlug(a)}`} style={{ color: '#60a5fa' }}>
                      {a}
                    </a>
                    {i < r.artists.length - 1 && ', '}
                  </span>
                ))}{' '}
                — {r.title} ({r.year})
              </div>

              <div style={{ fontSize: '13px', color: '#71717a' }}>
                {r.label} {r.catalog && ` / ${r.catalog}`}
              </div>

              <ReleaseLinks r={r} />
            </div>
          ))}
        </div>
      </div>

      {/* КАТЕГОРИИ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ marginBottom: '10px' }}>Категории</h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {sheets.map((sheet) => (
            <a
              key={sheet.name}
              href={`/sheet/${sheet.name.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                padding: '10px',
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px'
              }}
            >
              {sheet.name}
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
