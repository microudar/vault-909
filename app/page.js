'use client'

import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'

export default function Home() {
  const [sheets, setSheets] = useState([])
  const [activeSheet, setActiveSheet] = useState('')
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/music.xlsx')
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: 'array' })

        const loadedSheets = workbook.SheetNames.map((name) => {
          const sheet = workbook.Sheets[name]
          const data = XLSX.utils.sheet_to_json(sheet)
          return { name, data }
        })

        setSheets(loadedSheets)

        if (loadedSheets.length > 0) {
          setActiveSheet(loadedSheets[0].name)
          setRows(loadedSheets[0].data)
        }
      })
      .catch((error) => {
        console.error('Ошибка загрузки Excel:', error)
      })
  }, [])

  useEffect(() => {
    const current = sheets.find((s) => s.name === activeSheet)
    setRows(current ? current.data : [])
  }, [activeSheet, sheets])

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
    )
  }, [rows, query])

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

      {/* ВКЛАДКИ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '1px solid #27272a',
          paddingBottom: '4px',
          marginBottom: '16px'
        }}>
          {sheets.map((sheet) => (
            <a
              key={sheet.name}
              href={`/sheet/${sheet.name}`}
              style={{
                padding: '10px 16px',
                background: '#18181b',
                border: '1px solid #27272a',
                borderBottom: 'none',
                borderRadius: '10px 10px 0 0',
                color: '#a1a1aa',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#27272a'
                e.target.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#18181b'
                e.target.style.color = '#a1a1aa'
              }}
            >
              {sheet.name}
            </a>
          ))}
        </div>
      </div>

      {/* ПОИСК */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 20px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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

        <div style={{ marginTop: '10px', color: '#71717a' }}>
          {filteredRows.length} строк
        </div>
      </div>

      {/* СПИСОК РЕЛИЗОВ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredRows.map((row, i) => {
            const text = Object.values(row).join(' ')

            return (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  border: '1px solid #27272a',
                  background: '#18181b',
                  borderRadius: '8px'
                }}
              >
                {text}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
