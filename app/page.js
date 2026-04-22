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
    const unique = [
      ...new Set(releases.map((item) => item.label).filter(Boolean)),
    ]

    return ['Все', ...unique.sort()]
  }, [releases])

  const filtered = useMemo(() => {
    const result = releases.filter((item) => {
      const text =
        `${item.artist || ''} ${item.title || ''} ${item.label || ''} ${item.catalog_number || ''} ${item.year || ''}`
          .toLowerCase()

      const matchesQuery = text.includes(query.toLowerCase())
      const matchesLabel =
        selectedLabel === 'Все' || item.label === selectedLabel

      return matchesQuery && matchesLabel
    })

    result.sort((a, b) => {
      const yearA = Number(a.year || 0)
      const yearB = Number(b.year || 0)

      return sortOrder === 'new' ? yearB - yearA : yearA - yearB
    })

    return result
  }, [releases, query, selectedLabel, sortOrder])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-5xl font-black mb-3">Архив 909</h1>
          <p className="text-zinc-500 text-lg">
            Каталог андеграундной электронной музыки
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <input
            className="md:col-span-2 rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 outline-none focus:border-zinc-600"
            placeholder="Поиск по артисту, релизу, лейблу, году или каталожному номеру..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            className="rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-4"
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
          >
            {labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="text-zinc-500">
            Найдено релизов: {filtered.length}
          </div>

          <div className="flex items-center gap-4">
            <select
              className="rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="new">Сначала новые</option>
              <option value="old">Сначала старые</option>
            </select>

            <button
              onClick={() => {
                setQuery('')
                setSelectedLabel('Все')
              }}
              className="text-sm text-zinc-500 hover:text-white transition"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {filtered.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl hover:border-zinc-600 transition"
            >
              <div className="text-xl font-bold leading-tight mb-3">
                <button
                  onClick={() => setQuery(item.artist || '')}
                  className="hover:text-zinc-300 transition text-left"
                >
                  {item.artist || 'Неизвестный артист'}
                </button>

                {' — '}

                <span>{item.title || 'Без названия'}</span>
              </div>

              <div className="mb-2 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => item.label && setSelectedLabel(item.label)}
                  className="text-zinc-400 hover:text-white transition"
                >
                  {item.label || 'Без лейбла'}
                </button>

                {item.catalog_number && (
                  <span className="text-zinc-500">
                    — {item.catalog_number}
                  </span>
                )}
              </div>

              <button
                onClick={() => setQuery(String(item.year || ''))}
                className="text-zinc-500 text-sm hover:text-white transition"
              >
                {item.year || 'Год неизвестен'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
