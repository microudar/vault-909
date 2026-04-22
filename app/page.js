'use client'

import { useEffect, useMemo, useState } from 'react'

const sheets = [
  { key: 'albums', title: 'Albums' },
  { key: 'eps', title: 'EPs' },
  { key: 'compilations', title: 'Compilations' },
  { key: 'labels', title: 'Labels' },
]

export default function Home() {
  const [activeSheet, setActiveSheet] = useState('albums')
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch(`/data/${activeSheet}.json`)
      .then((r) => r.json())
      .then((data) => setRows(data))
      .catch(() => setRows([]))
  }, [activeSheet])

  const columns = useMemo(() => {
    if (!rows.length) return []
    return Object.keys(rows[0])
  }, [rows])

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
    )
  }, [rows, query])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="mb-6 text-4xl font-black">Архив 909</h1>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {sheets.map((sheet) => (
              <button
                key={sheet.key}
                onClick={() => {
                  setActiveSheet(sheet.key)
                  setQuery('')
                }}
                className={`rounded-t-xl border px-4 py-2 text-sm whitespace-nowrap transition ${
                  activeSheet === sheet.key
                    ? 'border-zinc-700 bg-zinc-900 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-white'
                }`}
              >
                {sheet.title}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по текущему листу..."
            className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-zinc-600"
          />

          <div className="text-sm text-zinc-500 whitespace-nowrap">
            {filteredRows.length} строк
          </div>
        </div>

        <div className="overflow-auto rounded-2xl border border-zinc-800 bg-zinc-900">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="sticky top-0 border-r border-zinc-800 bg-zinc-900 px-4 py-3 text-left font-semibold text-zinc-400"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-zinc-800 hover:bg-zinc-800/30"
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="border-r border-zinc-800 px-4 py-3 align-top text-zinc-200"
                    >
                      {String(row[column] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
