const XLSX = require('xlsx')
const fs = require('fs')

const workbook = XLSX.readFile('music.xlsx')
const all = []
const seen = new Set()

/* ------------------ универсальный парсер ------------------ */

function parseRow(row) {
  if (!row) return null

  row = String(row).trim()

  let label = ''
  let catalog_number = ''

  /* ---------- 1. достаем [ ... ] ---------- */
  const bracketMatch = row.match(/\[(.*?)\]/)

  if (bracketMatch) {
    const inside = bracketMatch[1]

    if (inside.includes('/')) {
      const parts = inside.split('/')
      label = parts.shift().trim()
      catalog_number = parts.join('/').trim()
    } else {
      catalog_number = inside.trim()
    }

    row = row.replace(bracketMatch[0], '').trim()
  }

  /* ---------- 2. Artist - Title ---------- */
  let artist = ''
  let title = ''

  if (row.includes(' - ')) {
    const parts = row.split(' - ')
    artist = parts[0].trim()
    title = parts.slice(1).join(' - ').trim()
  } else {
    title = row
  }

  /* ---------- 3. Year ---------- */
  let year = ''

const years = title.match(/\b(19|20)\d{2}\b/g)

if (years && years.length) {
  year = years[years.length - 1] // берём последний год
  title = title.replace(/\b(19|20)\d{2}\b$/, '').trim()
}

  /* ---------- 4. артисты (разделение) ---------- */
  const artists = artist
    .split(/\s*(?:,|&|\/)\s*/i)
    .map(a => a.trim())
    .filter(Boolean)

  return {
    artist,
    artists: artists.length ? artists : [artist],
    title,
    year,
    label,
    catalog_number
  }
}

/* ------------------ проход по всем листам ------------------ */

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  rows.forEach(row => {
    if (!row) return

    row.forEach(cell => {
      const parsed = parseRow(cell)

      if (parsed && parsed.title) {
        const key = [
  parsed.artist?.toLowerCase(),
  parsed.title?.toLowerCase(),
  parsed.year,
  parsed.catalog_number?.toLowerCase() || ''
].join('|')

        if (!seen.has(key)) {
          seen.add(key)
          parsed.sheet = sheetName
          all.push(parsed)
        }
      }
    })
  })
})

/* ------------------ сохранение ------------------ */

fs.writeFileSync(
  'data/releases.json',
  JSON.stringify(all, null, 2)
)

console.log('✅ done:', all.length)
