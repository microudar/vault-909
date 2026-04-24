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
        const data = XLSX.utils.sheet_to_json(sheet)

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
        {filtered.map((row, i) => (
          <div
            key={i}
            style={{
              padding: '12px',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px'
            }}
          >
            {Object.values(row).join(' ')}
          </div>
        ))}
      </div>

    </div>
  )
}
