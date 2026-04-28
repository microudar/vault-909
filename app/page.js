'use client'

import LabelMarquee from '../components/LabelMarquee'
import Header from '../components/Header'
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

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        color: '#e4e4e7',
        background:
          'linear-gradient(rgba(0,0,0,0.6), rgba(9,9,11,1)), url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Header />

      {/* HERO */}
      <div style={{ borderBottom: '1px solid #27272a' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 20px'
          }}
        >
          <h1
            style={{
              fontSize: '48px',
              fontWeight: '900',
              marginBottom: '10px'
            }}
          >
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

      <LabelMarquee />

     
      {/* КАТЕГОРИИ */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px 40px'
        }}
      >
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>
          Категории
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {sheets.map((sheet) => {
            const slug = sheet.name
              .toLowerCase()
              .replace(/\s+/g, '-')

            return (
              <a
                key={sheet.name}
                href={`/sheet/${slug}`}
                style={{
                  padding: '10px 14px',
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: '#fff',
                  textDecoration: 'none',
                  transition: '0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3f3f46'
                  e.currentTarget.style.background = '#1f1f23'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#27272a'
                  e.currentTarget.style.background = '#18181b'
                }}
              >
                {sheet.name}
              </a>
            )
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: '60px',
          borderTop: '1px solid #27272a',
          padding: '20px',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <a
          href="mailto:micro_udar12@mail.ru"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            border: '1px solid #27272a',
            borderRadius: '8px',
            background: '#18181b',
            transition: '0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#60a5fa'
            e.currentTarget.style.boxShadow = '0 0 10px rgba(96,165,250,0.5)'
            e.currentTarget.querySelector('svg').style.stroke = '#60a5fa'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#27272a'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.querySelector('svg').style.stroke = '#a1a1aa'
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a1a1aa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
            <path d="M4 4l8 8 8-8" />
          </svg>
        </a>
      </div>
    </div>
  )
}
