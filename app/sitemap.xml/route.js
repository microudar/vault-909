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

export async function GET() {
  try {
    const res = await fetch('https://vault909.ru/music.xlsx')
    const buffer = await res.arrayBuffer()

    const workbook = XLSX.read(buffer, { type: 'array' })

    const urls = new Set()

    // Главная
    urls.add('https://vault909.ru/')

    // Sheet страницы
    workbook.SheetNames.forEach((sheetName) => {
      const sheetSlug = slugify(sheetName)
      urls.add(`https://vault909.ru/sheet/${sheetSlug}`)
    })

    // Данные из всех листов
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(sheet)

      json.forEach((row) => {
        // Артисты
        if (row.artists) {
          const artists = row.artists.split(',')
          artists.forEach((artist) => {
            const slug = slugify(artist.trim())
            if (slug) {
              urls.add(`https://vault909.ru/artist/${slug}`)
            }
          })
        }

        // Лейблы
        if (row.label) {
          const slug = slugify(row.label)
          urls.add(`https://vault909.ru/label/${slug}`)
        }
      })
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls]
  .map(
    (url) => `
  <url>
    <loc>${url}</loc>
  </url>`
  )
  .join('')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (err) {
    return new Response('Error generating sitemap', { status: 500 })
  }
}
