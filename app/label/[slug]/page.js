'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useParams } from 'next/navigation'

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-')
}
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
}
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

        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

          data.forEach(row => {
            const text = Array.isArray(row) ? row.join(' ') : ''
            const parsed = parseRelease(text)
// 🔥 добавляем лейбл из листа, если нужно
if (SHEET_LABELS[sheetName]) {
  parsed.label = parsed.label || SHEET_LABELS[sheetName]
}
            if (slugify(parsed.label) === slug) {
              all.push(parsed)
              setLabelName(parsed.label)
            }
          })
        })

        setReleases(all)
      })
  }, [slug])

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px' }}>
      
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {releases.map((r, i) => (
          <div
            key={i}
            style={{
              padding: '14px',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '10px'
            }}
          >
            <div>
              {r.artists.join(', ')} — {r.title} ({r.year})
            </div>
            <div style={{ fontSize: '13px', color: '#71717a' }}>
              {r.label} {r.catalog && `/ ${r.catalog}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
