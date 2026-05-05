'use client'

import releasesData from '../../../data/releases.json'
import ReleaseLinks from '../../../components/ReleaseLinks'
import Header from '../../../components/Header'
import { useEffect, useState } from 'react'
import { slugify } from '../../../lib/slugify'
import { splitArtists } from '../../../lib/artistParser'
import Link from 'next/link'

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
  '17': 'Downwards',
  '18': 'L.I.E.S. (Long Island Electrical Systems)',
  '19': 'Stil Vor Talent',
  '20': 'Ovum Recordings',
  '21': 'Wolf + Lamb Music',
  '22': 'Liebe*Detail Digital',
  '23': 'Systematic',
  '24': 'Dirtybird',
  '25': 'Traum Schallplatten',
  '26': 'Border Community',
}

function getKey(r) {
  return `${r.artists.join('-')}-${r.title}-${r.catalog}`
}

export default function LabelClient({ slug }) {
  const [releases, setReleases] = useState([])
  const [name, setName] = useState('')
  const [covers, setCovers] = useState({})
  const [sortMode, setSortMode] = useState('catalog')

  useEffect(() => {
    let filtered = []

    releasesData.forEach((r) => {
      const label =
        r.label ||
        SHEET_LABELS[String(r.sheet)] ||
        ''

      if (slugify(label) === slug) {
        const artists = splitArtists(r.artist)

        filtered.push({
          id: r.id,
          artists,
          title: r.title || '',
          year: r.year || '',
          label,
          catalog: r.catalog_number || ''
        })

        if (!name) setName(label)
      }
    })

    setReleases(filtered)
  }, [slug])

  // 🔥 сортировка
  const sorted = releases.slice().sort((a, b) => {
    if (sortMode === 'year') {
      return Number(b.year) - Number(a.year)
    }

    // лучший вариант сортировки каталога
    return (a.catalog || '').localeCompare(b.catalog || '', undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  })

  async function fetchCover(r) {
    const key = getKey(r)
    if (covers[key]) return

    const query = encodeURIComponent(
      `${r.artists.join(' ')} ${r.title} ${r.year}`
    )

    try {
      const res = await fetch(`/api/discogs?q=${query}`)
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
        `https://itunes.apple.com/search?term=${query}&entity=album`
      ).then(r => r.json())

      const img = itunes.results?.[0]?.artworkUrl100

      if (img) {
        setCovers(prev => ({ ...prev, [key]: img }))
      }
    } catch {}
  }

  useEffect(() => {
    releases.forEach((r, i) => {
      setTimeout(() => fetchCover(r), i * 200)
    })
  }, [releases])

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff' }}>
      <Header />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
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
          {name || slug}
        </h1>

        <p style={{
          color: '#a1a1aa',
          marginBottom: '20px',
          maxWidth: '600px'
        }}>
          {name || slug} — лейбл электронной музыки. Здесь представлен каталог релизов.
        </p>

        {/* 🔘 сортировка */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setSortMode('catalog')}
            style={{
              marginRight: '10px',
              padding: '6px 12px',
              background: sortMode === 'catalog' ? '#27272a' : '#18181b',
              border: '1px solid #27272a',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Catalog
          </button>

          <button
            onClick={() => setSortMode('year')}
            style={{
              padding: '6px 12px',
              background: sortMode === 'year' ? '#27272a' : '#18181b',
              border: '1px solid #27272a',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Year
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sorted.map((r, i) => {
            const key = getKey(r)
            const cover = covers[key]

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
                <div style={{ display: 'flex', gap: '12px' }}>
                  <img
                    src={cover || '/no-cover.png'}
                    alt=""
                    style={{
                      width: '56px',
                      height: '56px',
                      objectFit: 'cover',
                      borderRadius: '6px'
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div>
                      {r.artists.map((artist, i) => (
                        <span key={i}>
                          <a
                            href={`/artist/${slugify(artist)}`}
                            style={{ color: '#60a5fa', textDecoration: 'none' }}
                          >
                            {artist}
                          </a>
                          {i < r.artists.length - 1 && ', '}
                        </span>
                      ))}{' '}
                      —{' '}
<Link href={`/release/${r.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
  {r.title} ({r.year})
</Link>
                    </div>

                    <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
                      {r.label && (
                        <a
                          href={`/label/${slugify(r.label)}`}
                          style={{ color: '#a1a1aa', textDecoration: 'none' }}
                        >
                          {r.label}
                        </a>
                      )}
                      {r.label && r.catalog && ' / '}
                      {r.catalog}
                    </div>

                    <ReleaseLinks r={r} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
