'use client'

import { useEffect, useMemo, useState } from 'react'

export default function UndergroundArchiveSite() {
  const [releases, setReleases] = useState([])
  const [query, setQuery] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('Все')
  const [sortOrder, setSortOrder] = useState('new')

  useEffect(() => {
    fetch('/data/releases.json')
      .then((r) => r.json())
      .then((data) => setReleases(data))
      .catch(() => setReleases([]))
  }, [])

  const labels = useMemo(() => {
    return [
      'Все',
      ...new Set(releases.map((item) => item.label).filter(Boolean)),
    ]
  }, [releases])

  const filtered = useMemo(() => {
    const result = releases.filter((item) => {
      const text =
        `${item.artist || ''} ${item.title || ''} ${item.label || ''} ${item.catalog_number || ''} ${item.year || ''}`
          .toLowerCase()

      return (
        text.includes(query.toLowerCase()) &&
        (selectedLabel === 'Все' || item.label === selectedLabel)
      )
    })

    result.sort((a, b) => {
      return sortOrder === 'new'
        ? Number(b.year || 0) - Number(a.year || 0)
        : Number(a.year || 0) - Number(b.year || 0)
    })

    return result
  }, [releases, query, selectedLabel, sortOrder])

  const openDiscogs = (item) => {
    const search = encodeURIComponent(
      `${item.artist || ''} ${item.title || ''}`
    )
    window.open(`https://www.discogs.com/search/?q=${search}`, '_blank')
  }

  const openBandcamp = (item) => {
    const search = encodeURIComponent(
      `${item.artist || ''} ${item.title || ''}`
    )
    window.open(`https://bandcamp.com/search?q=${search}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-black mb-2">Архив 909</h1>
        <p className="text-zinc-500 mb-8">
          Каталог андеграундной электронной музыки
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск..."
            className="md:col-span-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
          />

          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
          >
            {labels.map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="text-sm text-zinc-500">
            Найдено: {filtered.length}
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
            >
              <option value="new">Новые</option>
              <option value="old">Старые</option>
            </select>

            <button
              onClick={() => {
                setQuery('')
                setSelectedLabel('Все')
              }}
              className="text-sm text-zinc-500 hover:text-white"
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          {filtered.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-5 mb-8"
            >
              <div className="text-lg font-bold mb-3 leading-snug">
                <button
                  onClick={() => setQuery(item.artist || '')}
                  className="hover:text-zinc-300 transition"
                >
                  {item.artist || 'Неизвестный артист'}
                </button>

                {' — '}

                <span>{item.title || 'Без названия'}</span>
              </div>

              <div className="text-sm text-zinc-400 mb-3">
                <button
                  onClick={() => item.label && setSelectedLabel(item.label)}
                  className="hover:text-white transition"
                >
                  {item.label || 'Без лейбла'}
                </button>

                {item.catalog_number && (
                  <span className="text-zinc-500">
                    {' '}
                    — {item.catalog_number}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setQuery(String(item.year || ''))}
                  className="text-xs text-zinc-500 hover:text-white transition"
                >
                  {item.year || 'Год неизвестен'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => openDiscogs(item)}
                    className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800 transition"
                  >
                    Discogs
                  </button>

                  <button
                    onClick={() => openBandcamp(item)}
                    className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800 transition"
                  >
                    Bandcamp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
