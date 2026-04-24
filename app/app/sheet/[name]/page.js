'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useParams } from 'next/navigation'

export default function SheetPage() {
  const { name } = useParams()

  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/music.xlsx')
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: 'array' })

        const sheet = workbook.Sheets[name]

        if (!sheet) return

        const data = XLSX.utils.sheet_to_json(sheet)
        setRows(data)
      })
  }, [name])

  const filtered = rows.filter((row) =>
    Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">{name}</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск..."
        className="mb-6 w-full max-w-md p-3 bg-zinc-900 border border-zinc-700"
      />

      <div className="space-y-2">
        {filtered.map((row, i) => (
          <div key={i} className="border-b border-zinc-800 py-2">
            {Object.values(row).join(' ')}
          </div>
        ))}
      </div>
    </div>
  )
}
