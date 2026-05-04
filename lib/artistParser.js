const NO_SPLIT = [
  'cs + kreme',
  'wolf + lamb'
]

function normalize(str) {
  return str.toLowerCase().trim()
}

export function splitArtists(str = '') {
  const normalized = normalize(str)

  // 👉 если артист в исключениях — не делим
  if (NO_SPLIT.includes(normalized)) {
    return [str]
  }

  return str
    .split(/\s+(?:feat\.)\s+|,|&|\+|\/|\s+VS\.\s+/i)
    .map(a => a.trim())
    .filter(Boolean)
}
