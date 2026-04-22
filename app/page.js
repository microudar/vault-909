'use client'

import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'

export default function Home() {
  const [sheets, setSheets] = useState([])
  const [activeSheet, setActiveSheet] = useState('')
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/music.xlsx')
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: 'array' })

        const loadedSheets = workbook.SheetNames.map((name) => {
          const sheet = workbook.Sheets[name]
          const data = XLSX.utils.sheet_to_json(sheet)

          return {
            name,
            data,
          }
        })

        setSheets(loadedSheets)

        if (loadedSheets.length > 0) {
          setActiveSheet(loadedSheets[0].name)
          setRows(loadedSheets[0].data)
        }
      })
  }, [])

  useEffect(() => {
    const current = sheets.find((sheet) => sheet.name === activeSheet)
    setRows(current ? current.data : [])
  }, [activeSheet, sheets])

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
                key={sheet.name}
                onClick={() => {
                  setActiveSheet(sheet.name)
                  setQuery('')
                }}
                className={`rounded-t-xl border px-4 py-2 text-sm whitespace-nowrap transition ${
                  activeSheet === sheet.name
                    ? 'border-zinc-700 bg-zinc-900 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-white'
                }`}
              >
                {sheet.name}
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
                    className="border-r border-zinc-800 px-4 py-3 text-left font-semibold text-zinc-400"
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
                      className="border-r border-zinc-800 px-4 py-3 text-zinc-200"
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
