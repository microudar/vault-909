'use client'

import { useEffect, useMemo, useState } from 'react'

export default function Home() {
  const [releases, setReleases] = useState([])
  const [query, setQuery] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('Все')
  const [sortOrder, setSortOrder] = useState('new')

  useEffect(() => {
    fetch('/data/releases.json')
      .then((r) => r.json())
      .then((data) => setReleases(data))
  }, [])

  const labels = useMemo(() => {
    const unique = [...new Set(releases.map((r) => r.label).filter(Boolean))]
    return ['Все', ...unique.sort()]
  }, [releases])

  const filtered = useMemo(() => {
    let data = releases.filter((item) => {
      const text =
        `${item.artist || ''} ${item.title || ''} ${item.label || ''} ${item.catalog_number || ''}`.toLowerCase()

      const matchesQuery = text.includes(query.toLowerCase())
      const matchesLabel =
        selectedLabel === 'Все' || item.label === selectedLabel

      return matchesQuery && matchesLabel
    })

    data.sort((a, b) => {
      const yearA = Number(a.year || 0)
      const yearB = Number(b.year || 0)

      return sortOrder === 'new' ? yearB - yearA : yearA - yearB
    })

    return data
  }, [releases, query, selectedLabel, sortOrder])

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-2">Архив 909</h1>
        <p className="text-zinc-500 mb-8">
          Каталог андеграундной электронной музыки
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <input
            className="md:col-span-2 rounded-xl bg-zinc-900 border border-zinc-700 p-4 outline-none focus:border-zinc-500"
            placeholder="Поиск по артисту, релизу, лейблу..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            className="rounded-xl bg-zinc-900 border border-zinc-700 p-4"
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
          >
            {labels.map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-zinc-500 text-sm">
            Найдено: {filtered.length}
          </div>

          <select
            className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="new">Сначала новые</option>
            <option value="old">Сначала старые</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filtered.map((item, index) => (
            <div
              key={item.id || index}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600 transition"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {item.label && (
                  <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-300">
                    {item.label}
                  </span>
                )}

                {item.catalog_number && (
                  <span className="px-3 py-1 rounded-full border border-zinc-700 text-xs text-zinc-400">
                    {item.catalog_number}
                  </span>
                )}

                {item.year && (
                  <span className="px-3 py-1 rounded-full border border-zinc-800 text-xs text-zinc-500">
                    {item.year}
                  </span>
                )}
              </div>

              <div className="text-2xl font-bold">
                {item.title || 'Без названия'}
              </div>

              <div className="text-zinc-300 mt-1">
                {item.artist || 'Неизвестный артист'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
