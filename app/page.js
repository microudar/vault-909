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
      .catch(() => {
        setReleases([])
      })
  }, [])

  const labels = useMemo(() => {
    const unique = [
      ...new Set(
        releases
          .map((item) => item.label)
          .filter(Boolean)
      ),
    ]

    return ['Все', ...unique.sort()]
  }, [releases])

  const filtered = useMemo(() => {
    const result = releases.filter((item) => {
      const text =
        `${item.artist || ''} ${item.title || ''} ${item.label || ''} ${item.catalog_number || ''}`
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-[0.2em] uppercase">
              Архив 909
            </h1>
            <p className="text-sm text-zinc-400">
              Архив андеграундной электронной музыки
            </p>
          </div>

          <button className="rounded-2xl bg-white text-black px-5 py-2 text-sm font-medium hover:scale-105 transition">
            Premium
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center rounded-full border border-zinc-700 px-4 py-2 text-xs uppercase tracking-widest text-zinc-400 mb-6">
            {releases.length}+ релизов · техно · минимал · электро · эмбиент
          </div>

          <h2 className="text-4xl md:text-6xl font-black leading-tight max-w-4xl">
            Найди забытые релизы, редкие лейблы и скрытые дискографии.
          </h2>

          <p className="mt-6 text-lg text-zinc-400 max-w-2xl leading-8">
            Поиск по артистам, названиям, лейблам и каталожным номерам.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 mb-8">
          <input
            className="lg:col-span-2 rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 outline-none focus:border-zinc-600"
            placeholder="Поиск по артисту, релизу, лейблу или номеру..."
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

          <select
            className="rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-4"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="new">Сначала новые</option>
            <option value="old">Сначала старые</option>
          </select>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-500 text-sm">
            Найдено релизов: {filtered.length}
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-600 hover:-translate-y-1 transition"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-4">
                {item.label && (
                  <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-300 whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {item.catalog_number && (
                  <span className="px-3 py-1 rounded-full border border-zinc-700 text-xs text-zinc-400 whitespace-nowrap">
                    {item.catalog_number}
                  </span>
                )}

                {item.year && (
                  <span className="px-3 py-1 rounded-full border border-zinc-800 text-xs text-zinc-500 whitespace-nowrap">
                    {item.year}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold leading-tight mb-2">
                {item.title || 'Без названия'}
              </h3>

              <p className="text-zinc-300">
                {item.artist || 'Неизвестный артист'}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
