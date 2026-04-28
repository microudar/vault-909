export const dynamic = 'force-dynamic'

import * as XLSX from 'xlsx'

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export async function GET() {
  const base = 'https://vault909.ru'

  const res = await fetch(`${base}/music.xlsx`)
  const buffer = await res.arrayBuffer()

  const workbook = XLSX.read(buffer, { type: 'array' })

  const urls = new Set()

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    data.forEach((row) => {
      const text = Array.isArray(row) ? row.join(' ') : ''
      if (!text) return

      const artist = text.split(' - ')[0]?.trim()

      if (artist) {
        urls.add(`${base}/artist/${slugify(artist)}`)
      }
    })
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(urls).map(url => `
  <url>
    <loc>${url}</loc>
  </url>`).join('')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
