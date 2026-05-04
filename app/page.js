'use client'

import LabelMarquee from '../components/LabelMarquee'
import Header from '../components/Header'
import releases from '../data/releases.json'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { slugify } from '../lib/slugify'

export default function Home() {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const fuse = useMemo(() => {
    return new Fuse(releases, {
      keys: ['artist', 'title', 'label'],
      threshold: 0.35
    })
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query).slice(0, 8).map(r => r.item)
  }, [query, fuse])

  const highlight = (text) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <span key={i} style={{ color: '#60a5fa' }}>{part}</span>
        : part
    )
  }

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      setActiveIndex(i => Math.min(i + 1, results.length - 1))
    }
    if (e.key === 'ArrowUp') {
      setActiveIndex(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && results[activeIndex]) {
      window.location.href = `/artist/${slugify(results[activeIndex].artist)}`
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
      <Header hideNav />

      {/* HERO */}
      <div style={{ borderBottom: '1px solid #27272a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900' }}>Архив 909</h1>
          <p style={{ color: '#a1a1aa', marginTop: '10px' }}>
            Electronic music archive database (over 70k releases) of techno, house, electro, ambient...
          </p>
        </div>
      </div>

      <LabelMarquee />

      {/* SEARCH */}
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', position: 'relative' }}>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(-1)
          }}
          onKeyDown={handleKey}
          placeholder="discover the underground"
          style={{
            width: '100%',
            padding: '14px 16px',
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '16px'
          }}
        />

        {results.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '60px',
              width: '100%',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '10px',
              overflow: 'hidden',
              zIndex: 10
            }}
          >
            {results.map((r, i) => (
              <Link
                key={i}
                href={`/artist/${slugify(r.artist)}`}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  background: i === activeIndex ? '#27272a' : 'transparent',
                  textDecoration: 'none',
                  color: '#fff',
                  borderBottom: '1px solid #27272a'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: '#000',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  {r.cover && (
                    <img
                      src={r.cover}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: '500' }}>
                    {highlight(r.artist)} — {highlight(r.title)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                    {highlight(r.label)} • {r.year}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
        >
          ✉
        </a>
      </div>
    </div>
  )
}
