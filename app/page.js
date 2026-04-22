'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [releases, setReleases] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/data/releases.json')
      .then((r) => r.json())
      .then((data) => setReleases(data))
      .catch((err) => console.error('Ошибка загрузки JSON:', err))
  }, [])

  const filtered = releases.filter((item) =>
    `${item.artist || ''} ${item.title || ''} ${item.label || ''} ${item.catalog_number || ''}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-bold mb-2">Архив 909</h1>
      <p className="text-zinc-500 mb-8">
        Каталог андеграундной электронной музыки
      </p>

      <input
        className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-4 mb-8 outline-none focus:border-zinc-500"
        placeholder="Поиск по артисту, релизу, лейблу или каталожному номеру..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid gap-4">
        {filtered.map((item, index) => (
          <div
            key={item.id || index}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            {item.genre && (
              <div className="text-sm text-zinc-500 mb-2">{item.genre}</div>
            )}

            <div className="text-2xl font-bold">
              {item.title || 'Без названия'}
            </div>

            <div className="text-zinc-300 mt-1">
              {item.artist || 'Неизвестный артист'}
            </div>

            <div className="text-zinc-500 mt-3 text-sm">
              {item.label || 'Без лейбла'}
              {item.catalog_number && ` · ${item.catalog_number}`}
              {item.year && ` · ${item.year}`}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
