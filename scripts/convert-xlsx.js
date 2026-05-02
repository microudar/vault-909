const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

const workbook = XLSX.readFile(
  path.join(__dirname, '../public/music.xlsx')
)

const releases = []

workbook.SheetNames.forEach((sheetName) => {
  const sheet = workbook.Sheets[sheetName]

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: ''
  })

  rows.forEach((row, index) => {
    releases.push({
      id: `${sheetName}-${index + 1}`,

      sheet: sheetName,

      artist: row.artist || '',
      title: row.title || '',
      label: row.label || '',
      catalog_number: row.catalog_number || '',
      year: row.year || '',

      ...row
    })
  })
})

const outputPath = path.join(
  __dirname,
  '../public/data/releases.json'
)

fs.writeFileSync(
  outputPath,
  JSON.stringify(releases, null, 2),
  'utf8'
)

console.log(`Done: ${releases.length} releases exported`)