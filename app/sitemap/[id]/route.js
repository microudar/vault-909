import * as XLSX from 'xlsx'

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\+/g, 'plus')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

function parseRow(text) {
  const result = { artists: [], label: null }

  if (!text) return result

  const artistPart = text.split(' - ')[0]
  if (artistPart) {
    result.artists = artistPart.split(',').map(a => a.trim())
  }

  const labelMatch = text.match(/\[(.*?)\]/)
  if (labelMatch) {
    result.label = labelMatch[1].split('/')[0].trim()
  }

  return result
}

export async function GET(req, { params }) {
  const page = Number(params.id) || 1
  const chunkSize = 10000

  const res = await fetch('https://vault909.ru/music.xlsx')
  const buffer = await res.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })

  const urls = new Set()

  urls.add('https://vault909.ru/')

  workbook.SheetNames.forEach((sheetName) => {
    urls.add(`https://vault909.ru/sheet/${slugify(sheetName)}`)
  })

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    rows.forEach((row) => {
      const text = row[0]
      if (!text) return

      const parsed = parseRow(text)

      parsed.artists.forEach((artist) => {
        urls.add(`https://vault909.ru/artist/${slugify(artist)}`)
      })

      if (parsed.label) {
        urls.add(`https://vault909.ru/label/${slugify(parsed.label)}`)
      }
    })
  })

  const all = Array.from(urls)

  const start = (page - 1) * chunkSize
  const end = start + chunkSize

  const chunk = all.slice(start, end)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunk
  .map(
    (url) => `
  <url>
    <loc>${url}</loc>
  </url>`
  )
  .join('')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}
