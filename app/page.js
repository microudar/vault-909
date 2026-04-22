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

        <div className="space-y-8">
          {filtered.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-5"
            >
              <div className="text-lg font-bold mb-2">
                <button
                  onClick={() => setQuery(item.artist || '')}
                  className="hover:text-zinc-300 transition"
                >
                  {item.artist}
                </button>{' '}
                — {item.title}
              </div>

              <div className="text-sm text-zinc-400 mb-2">
                <button
                  onClick={() => setSelectedLabel(item.label)}
                  className="hover:text-white transition"
                >
                  {item.label}
                </button>
                {item.catalog_number && ` — ${item.catalog_number}`}
              </div>

              <div className="text-xs text-zinc-500">{item.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
