import releases from '../data/releases.json'
import { slugify } from '../lib/slugify'

export default function sitemap() {
  const base = 'https://vault-909.vercel.app'

  const artistSet = new Set()
  const labelSet = new Set()

  releases.forEach(r => {
    if (r.artist) artistSet.add(r.artist)
    if (r.label) labelSet.add(r.label)
  })

  const artists = Array.from(artistSet).map(name => ({
    url: `${base}/artist/${slugify(name)}`,
    lastModified: new Date()
  }))

  const labels = Array.from(labelSet).map(name => ({
    url: `${base}/label/${slugify(name)}`,
    lastModified: new Date()
  }))

  return [
    {
      url: base,
      lastModified: new Date()
    },
    ...artists,
    ...labels
  ]
}
