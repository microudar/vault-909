export const dynamic = 'force-dynamic'
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

export async function GET(req, { params }) {
  const id = parseInt(params.id)

  try {
    const res = await fetch('https://vault909.ru/music.xlsx')
    const buffer = await res.arrayBuffer()

    const workbook = XLSX.read(buffer, { type: 'array' })

    const urls = []

    workbook.SheetNames.forEach((sheetName) => {
      const sheetSlug = slugify(sheetName)
      urls.push(`https://vault909.ru/sheet/${sheetSlug}`)

      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(sheet)

      json.forEach((row) => {
  const text = Object.values(row).join(' ')

  if (!text) return

  // === ARTISTS ===
  const parts = text.split(' - ')
  const artistPart = parts[0]

  if (artistPart) {
    artistPart
      .replace(/\b[Vv]s\.?\b/g, ',')
      .replace(/\b[Ff]eat\.?\b/g, ',')
      .replace(/\b[Ff]t\.?\b/g, ',')
      .split(/[\/,&,]/)
      .map(a => a.trim())
      .filter(Boolean)
      .forEach(artist => {
        const slug = slugify(artist)
        if (slug) {
          urls.push(`https://vault909.ru/artist/${slug}`)
        }
      })
  }

  // === LABEL ===
  const labelMatch = text.match(/\[(.*?)\]/)

  if (labelMatch) {
    const label = labelMatch[1].split('/')[0].trim()
    if (label) {
      urls.push(`https://vault909.ru/label/${slugify(label)}`)
    }
  }
})

    const uniqueUrls = [...new Set(urls)]

    const chunkSize = 5000
    const chunks = []

    for (let i = 0; i < uniqueUrls.length; i += chunkSize) {
      chunks.push(uniqueUrls.slice(i, i + chunkSize))
    }

    const selected = chunks[id - 1] || []

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${selected
  .map(
    (url) => `
  <url>
    <loc>${url}</loc>
  </url>`
  )
  .join('')}
</urlset>`

    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml' },
    })
  } catch (e) {
    return new Response('Error', { status: 500 })
  }
}
