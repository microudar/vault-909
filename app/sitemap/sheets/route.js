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

  const urls = workbook.SheetNames.map(
    (sheet) => `${base}/sheet/${slugify(sheet)}`
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `
  <url>
    <loc>${url}</loc>
  </url>`).join('')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
