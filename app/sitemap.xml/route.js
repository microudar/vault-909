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

// парсим строку релиза
function parseRow(text) {
  const result = {
    artists: [],
    label: null
  }

  if (!text) return result

  // 👉 ARTISTS (до " - ")
  const artistPart = text.split(' - ')[0]
  if (artistPart) {
    result.artists = artistPart.split(',').map(a => a.trim())
  }

  // 👉 LABEL (внутри [...])
  const labelMatch = text.match(/\[(.*?)\]/)
  if (labelMatch) {
    const labelPart = labelMatch[1].split('/')[0]
    result.label = labelPart.trim()
  }

  return result
}

export async function GET() {
  try {
    const res = await fetch('https://vault909.ru/music.xlsx')
    const buffer = await res.arrayBuffer()

    const workbook = XLSX.read(buffer, { type: 'array' })

    const urls = new Set()

    // главная
    urls.add('https://vault909.ru/')

    // sheet страницы
    workbook.SheetNames.forEach((sheetName) => {
      const slug = slugify(sheetName)
      urls.add(`https://vault909.ru/sheet/${slug}`)
    })

    // данные
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName]

      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1
      })

      rows.forEach((row) => {
        const text = row[0]
        if (!text) return

        const parsed = parseRow(text)

        // артисты
        parsed.artists.forEach((artist) => {
          const slug = slugify(artist)
          if (slug) {
            urls.add(`https://vault909.ru/artist/${slug}`)
          }
        })

        // лейбл
        if (parsed.label) {
          const slug = slugify(parsed.label)
          if (slug) {
            urls.add(`https://vault909.ru/label/${slug}`)
          }
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
