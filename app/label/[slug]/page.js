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

export default function LabelPage() {
  const { slug } = useParams()
  const [releases, setReleases] = useState([])

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

            if (text.includes('[')) {
              const label = text.match(/\[(.*?)\]/)?.[1]?.split('/')[0]

              if (normalizeSlug(label) === slug) {
                all.push(text)
              }
            }
          })
        })

        setReleases(all)
      })
  }, [slug])

  return (
    <div>
      <h1>{slug}</h1>
      {releases.map((r, i) => (
        <div key={i}>{r}</div>
      ))}
    </div>
  )
}
