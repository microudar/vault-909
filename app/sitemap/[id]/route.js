export const dynamic = 'force-dynamic'

import * as XLSX from 'xlsx'

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export async function GET(req, { params }) {
  try {
    const res = await fetch('https://vault909.ru/music.xlsx')
    const buffer = await res.arrayBuffer()

    const workbook = XLSX.read(buffer, { type: 'array' })

    const urls = []

    workbook.SheetNames.forEach((sheetName) => {
      urls.push(`https://vault909.ru/sheet/${slugify(sheetName)}`)
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `
  <url>
    <loc>${url}</loc>
  </url>`).join('')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store'
      },
    })

  } catch (e) {
    return new Response('Error', { status: 500 })
  }
}
