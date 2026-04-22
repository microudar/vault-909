'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [releases, setReleases] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/data/releases.json')
      .then((r) => r.json())
      .then((data) => setReleases(data))
  }, [])

  const filtered = releases.filter((item) =>
    `${item.artist} ${item.title} ${item.label}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-bold mb-4">Архив 909</h1>

      <input
        className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-4 mb-8"
        placeholder="Поиск по артисту, релизу или лейблу..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-zinc-800 p-5 bg-zinc-900"
          >
            <div className="text-sm text-zinc-500">{item.genre}</div>
            <div className="text-2xl font-bold">{item.title}</div>
            <div>{item.artist}</div>
            <div className="text-zinc-500">
              {item.label} · {item.year}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
