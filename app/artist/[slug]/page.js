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
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function parseRelease(text) {
  if (!text) return {}

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

  return { artists, title, year }
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
        let artistName = ''

        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

          data.forEach(row => {
            const text = Array.isArray(row) ? row.join(' ') : ''
            const parsed = parseRelease(text)

            if (parsed.artists.some(a => normalizeSlug(a) === slug)) {
              all.push(parsed)

              if (!artistName) {
                artistName = parsed.artists.find(a => normalizeSlug(a) === slug)
              }
            }
          })
        })

        setName(artistName)
        setReleases(all)
      })
  }, [slug])

  return (
    <div>
      <h1>{name || slug}</h1>

      {releases.map((r, i) => (
        <div key={i}>
          {r.artists.join(', ')} — {r.title} ({r.year})
        </div>
      ))}
    </div>
  )
}
