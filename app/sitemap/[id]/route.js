import * as XLSX from 'xlsx'
export const dynamic = 'force-dynamic'

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
        if (row.artists) {
          row.artists.split(',').forEach((artist) => {
            const slug = slugify(artist.trim())
            if (slug) {
              urls.push(`https://vault909.ru/artist/${slug}`)
            }
          })
        }

        if (row.label) {
          const slug = slugify(row.label)
          urls.push(`https://vault909.ru/label/${slug}`)
        }
      })
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
