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
      .catch((error) => {
        console.error('Ошибка загрузки Excel:', error)
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
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
            <img
              src="/hero.jpg"
              alt="Архив 909"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h1 className="mb-4 text-6xl font-black text-white">
              Архив 909
            </h1>

            <p className="mb-8 text-2xl text-zinc-400">
              Архив электронной музыки
            </p>

            <p className="max-w-xl text-lg leading-8 text-zinc-400">
              Коллекция редкой электронной музыки: техно, минимал,
              эмбиент, андеграундные лейблы и полные дискографии.
              Вся информация собрана и систематизирована в одном месте.
            </p>

            <button
              onClick={() => {
                document.getElementById('archive')?.scrollIntoView({
                  behavior: 'smooth',
                })
              }}
              className="mt-10 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-black transition hover:opacity-90"
            >
              Открыть архив
            </button>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="mb-6 flex gap-2 overflow-x-auto border-b border-zinc-800 pb-0">
            {sheets.map((sheet) => (
              <button
                key={sheet.name}
                onClick={() => {
                  setActiveSheet(sheet.name)
                  setQuery('')
                }}
                className={`relative -mb-px rounded-t-xl border border-b-0 px-5 py-3 text-sm font-medium whitespace-nowrap transition ${
                  activeSheet === sheet.name
                    ? 'border-zinc-700 bg-zinc-900 text-white'
                    : 'border-transparent bg-zinc-950 text-zinc-500 hover:bg-zinc-900/50 hover:text-white'
                }`}
              >
                {sheet.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main
        id="archive"
        className="mx-auto max-w-7xl px-6 py-6"
      >
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

        <div className="overflow-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-zinc-800 bg-zinc-900">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="border-r border-zinc-800 px-4 py-3 text-left font-semibold text-zinc-400 whitespace-nowrap"
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
                  className="border-b border-zinc-800 transition hover:bg-zinc-800/30"
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="border-r border-zinc-800 px-4 py-3 text-zinc-200 whitespace-nowrap"
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
