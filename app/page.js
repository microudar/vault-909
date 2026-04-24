'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

export default function Home() {
  const [sheets, setSheets] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/music.xlsx')
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: 'array' })

        const loadedSheets = workbook.SheetNames.map((name) => ({
          name,
        }))

        setSheets(loadedSheets)
      })
      .catch((error) => {
        console.error('Ошибка загрузки Excel:', error)
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#e4e4e7' }}>
      
      {/* HERO */}
      <div style={{ borderBottom: '1px solid #27272a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '10px' }}>
            Архив 909
          </h1>

          <p style={{ color: '#a1a1aa', marginBottom: '10px' }}>
            Архив электронной музыки
          </p>

          <p style={{ color: '#a1a1aa', maxWidth: '700px' }}>
            Коллекция редкой электронной музыки: техно, минимал,
            эмбиент, андеграундные лейблы и полные дискографии.
          </p>
        </div>
      </div>

      {/* ПОИСК */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск (пока не подключён)..."
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

      {/* КАТЕГОРИИ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>
          Категории
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {sheets.map((sheet) => (
            <a
              key={sheet.name}
              href={`/sheet/${sheet.name.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                padding: '10px 14px',
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#fff',
                textDecoration: 'none'
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
