'use client'

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
    ? artistPart.split(/[\/,&]/).map(a => a.trim())
    : []

  let title = ''
  let year = ''

  if (rest) {
    const words = rest.split(' ')
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

        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

          data.forEach(row => {
            const text = Array.isArray(row) ? row.join(' ') : ''
            const parsed = parseRelease(text)

            if (parsed.artists.some(a => normalizeSlug(a) === slug)) {
              all.push(parsed)

              const found = parsed.artists.find(a => normalizeSlug(a) === slug)
              if (found && !name) setName(found)
            }
          })
        })

        setReleases(all)
      })
  }, [slug])

  return (
    <div>
      <button onClick={() => window.history.back()}>← Назад</button>

      <h1>{name || slug}</h1>

      {releases.map((r, i) => (
        <div key={i}>
          {r.artists.join(', ')} — {r.title} ({r.year})
          <div>{r.label} {r.catalog && `/ ${r.catalog}`}</div>
        </div>
      ))}
    </div>
  )
}
