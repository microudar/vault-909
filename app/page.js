'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const loadLuckysheet = async () => {
      if (typeof window === 'undefined') return

      const luckysheet = await import('@dream-num/luckysheet')

      luckysheet.default.create({
        container: 'luckysheet',
        lang: 'en',
        showinfobar: false,
        showsheetbar: true,
        showtoolbar: true,
        showstatisticBar: true,
        sheetFormulaBar: true,
        enableAddRow: false,
        enableAddCol: false,
        allowEdit: false,
        data: [
          {
            name: 'Albums',
            color: '',
            index: 0,
            status: 1,
            order: 0,
            row: 100,
            column: 10,
            celldata: [
              { r: 0, c: 0, v: { v: 'Artist' } },
              { r: 0, c: 1, v: { v: 'Title' } },
              { r: 0, c: 2, v: { v: 'Label' } },
              { r: 0, c: 3, v: { v: 'Catalog Number' } },
              { r: 0, c: 4, v: { v: 'Year' } },

              { r: 1, c: 0, v: { v: 'Surgeon' } },
              { r: 1, c: 1, v: { v: 'Force + Form' } },
              { r: 1, c: 2, v: { v: 'Tresor' } },
              { r: 1, c: 3, v: { v: 'TRESOR 81' } },
              { r: 1, c: 4, v: { v: 1999 } },
            ],
          },
          {
            name: 'EPs',
            color: '',
            index: 1,
            status: 0,
            order: 1,
            row: 100,
            column: 10,
            celldata: [
              { r: 0, c: 0, v: { v: 'Artist' } },
              { r: 0, c: 1, v: { v: 'Title' } },
              { r: 0, c: 2, v: { v: 'Label' } },
              { r: 0, c: 3, v: { v: 'Catalog Number' } },
              { r: 0, c: 4, v: { v: 'Year' } },
            ],
          },
        ],
      })
    }

    loadLuckysheet()
  }, [])

  return (
    <div className="w-screen h-screen bg-white">
      <div id="luckysheet" className="w-full h-full" />
    </div>
  )
}
