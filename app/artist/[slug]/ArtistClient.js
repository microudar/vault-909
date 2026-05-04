'use client'

import releasesData from '../../../data/releases.json'
import ReleaseLinks from '../../../components/ReleaseLinks'
import Header from '../../../components/Header'
import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slugify'
import { splitArtists } from '@/lib/artistParser'


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
  return `${r.artists.join('-')}-${r.title}`
}

export default function ArtistClient({ slug }) {
  const [releases, setReleases] = useState([])
  const [name, setName] = useState('')

  const [covers, setCovers] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('covers')
      return cached ? JSON.parse(cached) : {}
    }
    return {}
  })

  useEffect(() => {
    localStorage.setItem('covers', JSON.stringify(covers))
  }, [covers])

  useEffect(() => {
    let filtered = []

    releasesData.forEach((r) => {
      // ❗ ВСЕГДА берем из строки, а не r.artists
      const artists = splitArtists(r.artist)

      if (artists.some(a => slugify(a) === slug)) {
        const labelName = r.label || SHEET_LABELS[r.sheet] || ''

        filtered.push({
          artists,
          title: r.title,
          year: r.year,
          label: labelName,
          catalog: r.catalog_number
        })

        const found = artists.find(a => slugify(a) === slug)
        if (found && !name) setName(found)
      }
    })

    filtered.sort((a, b) => Number(b.year) - Number(a.year))
    setReleases(filtered)
  }, [slug])

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
      setTimeout(() => {
        fetchCover(r)
      }, i * 200)
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
          {name || slug} — электронный артист. Здесь собрана дискография,
          включая EP, альбомы и редкие релизы.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {releases.map((r, i) => {
            const key = getKey(r)
            const cover = covers[key]

            return (
              <div
                key={i}
                style={{
                  padding: '14px 16px',
                  border: '1px solid #27272a',
                  background: '#18181b',
                  borderRadius: '10px'
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
                      — {r.title} ({r.year})
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
