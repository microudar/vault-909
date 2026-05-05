'use client'

import releases from '../../data/releases.json'
import ReleaseLinks from '../../components/ReleaseLinks'
import Header from '../../components/Header'
import { useEffect, useState, useMemo } from 'react'
import { slugify } from '@/lib/slugify'
import { splitArtists } from '@/lib/artistParser'
import Fuse from 'fuse.js'
import Link from 'next/link'

function normalize(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getKey(r) {
  return `${r.artists.join('-')}-${r.title}-${r.catalog_number}`
}

// 🔍 подсветка
function highlight(text, query) {
  if (!query) return text

  const normText = normalize(text)
  const normQuery = normalize(query)

  const index = normText.indexOf(normQuery)
  if (index === -1) return text

  const before = text.slice(0, index)
  const match = text.slice(index, index + query.length)
  const after = text.slice(index + query.length)

  return (
    <>
      {before}
      <span style={{ color: '#facc15' }}>{match}</span>
      {after}
    </>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [covers, setCovers] = useState({})

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  // 🔥 подготовка данных
  const prepared = useMemo(() => {
    return releases.map((r) => {
      const artists = splitArtists(r.artist)

      return {
        ...r,
        artists,
        searchText: normalize(
          `${artists.join(' ')} ${r.title} ${r.label} ${r.catalog_number} ${r.year}`
        )
      }
    })
  }, [])

  // 🔥 fuse
  const fuse = useMemo(() => {
    return new Fuse(prepared, {
      keys: ['searchText'],
      threshold: 0.3,
      ignoreLocation: true
    })
  }, [prepared])

  // 🔥 поиск
  const results = useMemo(() => {
    if (!debouncedQuery) return []

    return fuse
      .search(normalize(debouncedQuery))
      .slice(0, 50)
      .map(res => res.item)
  }, [debouncedQuery, fuse])

  // fetch cover
  async function fetchCover(r) {
    const key = getKey(r)
    if (covers[key]) return

    const q = encodeURIComponent(
      `${r.artists.join(' ')} ${r.title} ${r.year}`
    )

    try {
      const res = await fetch(`/api/discogs?q=${q}`)
      const data = await res.json()

      const cover =
        data.results?.[0]?.cover_image ||
        data.results?.[0]?.thumb

      if (cover) {
        setCovers(prev => ({ ...prev, [key]: cover }))
        return
      }
    } catch {}

    try {
      const itunes = await fetch(
        `https://itunes.apple.com/search?term=${q}&entity=album`
      ).then(r => r.json())

      const img = itunes.results?.[0]?.artworkUrl100

      if (img) {
        setCovers(prev => ({ ...prev, [key]: img }))
      }
    } catch {}
  }

  useEffect(() => {
    results.slice(0, 15).forEach(fetchCover)
  }, [results])

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px' }}>
      
      <Header />

      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        Search
      </h1>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search artist, label, release..."
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          background: '#18181b',
          border: '1px solid #27272a',
          color: '#fff'
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {results.map((r, i) => {
          const key = getKey(r)

          return (
            <div
  key={i}
  onClick={(e) => {
    // если клик по ссылке — не трогаем
    if (e.target.closest('a')) return

    window.location.href = `/release/${r.id}`
  }}
  style={{
    padding: '14px 16px',
    border: '1px solid #27272a',
    background: '#18181b',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = '#1f1f23'
    e.currentTarget.style.borderColor = '#3f3f46'
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = '#18181b'
    e.currentTarget.style.borderColor = '#27272a'
  }}
>
  {/* COVER */}
  {covers[key] ? (
    <img
      src={covers[key]}
      alt=""
      style={{
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '6px',
        flexShrink: 0
      }}
    />
  ) : (
    <div
      style={{
        width: '60px',
        height: '60px',
        background: '#111',
        borderRadius: '6px',
        flexShrink: 0
      }}
    />
  )}

  <div style={{ flex: 1 }}>
    <div>
      {r.artists.map((artist, i) => (
        <span key={i}>
          <a
            href={`/artist/${slugify(artist)}`}
            style={{ color: '#60a5fa', textDecoration: 'none' }}
          >
            {highlight(artist, debouncedQuery)}
          </a>
          {i < r.artists.length - 1 && ', '}
        </span>
      ))}{' '}
      
      {/* 🔥 ТОЛЬКО НАЗВАНИЕ КЛИКАБЕЛЬНО */}
      —{' '}
      <Link href={`/release/${r.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
        {highlight(r.title, debouncedQuery)} ({r.year})
      </Link>
    </div>

    <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
      {r.label && (
        <a
          href={`/label/${slugify(r.label)}`}
          style={{ color: '#a1a1aa', textDecoration: 'none' }}
        >
          {highlight(r.label, debouncedQuery)}
        </a>
      )}
      {r.label && r.catalog_number && ' / '}
      {highlight(r.catalog_number, debouncedQuery)}
    </div>

    <ReleaseLinks r={r} />
  </div>
</div>
          )
        })}
      </div>
    </div>
  )
}
