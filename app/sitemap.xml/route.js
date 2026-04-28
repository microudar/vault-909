import * as XLSX from 'xlsx'

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\+/g, 'plus')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const base = 'https://vault909.ru'

  const res = await fetch(`${base}/music.xlsx`)
  const buffer = await res.arrayBuffer()

  const workbook = XLSX.read(buffer, { type: 'array' })

  const urls = new Set()

  // sheets
  workbook.SheetNames.forEach((sheet) => {
    urls.add(`${base}/sheet/${slugify(sheet)}`)
  })

  // artists + labels
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName]
    const json = XLSX.utils.sheet_to_json(sheet)

    json.forEach((row) => {
      if (row.artists) {
        row.artists.split(',').forEach((a) => {
          const slug = slugify(a.trim())
          if (slug) urls.add(`${base}/artist/${slug}`)
        })
      }

      if (row.label) {
        urls.add(`${base}/label/${slugify(row.label)}`)
      }
    })
  })

  const total = urls.size
  const chunkSize = 5000
  const parts = Math.ceil(total / chunkSize)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: parts })
  .map(
    (_, i) => `
  <sitemap>
    <loc>${base}/sitemap/${i + 1}</loc>
  </sitemap>`
  )
  .join('')}
</sitemapindex>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
