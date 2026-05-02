import releases from '@/data/releases.json'

export async function generateMetadata({ params }) {
  const name = params.slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  return {
    title: `${name} — дискография артиста | Vault 909`,
    description: `Дискография ${name}. Все релизы, включая EP, альбомы и редкие записи.`,
  }
}

export default function Page({ params }) {
  const name = params.slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

 const artistReleases = releases.filter((r) => {
  const full = `${r.artist || ''} ${r.title || ''}`.toLowerCase()
  return full.includes(name.toLowerCase())
})

  return (
    <div style={{ padding: 20 }}>
      <h1>{name}</h1>

      {artistReleases.slice(0, 100).map((r, i) => (
        <div key={i}>
          {r.artist} — {r.title} ({r.year})
        </div>
      ))}
    </div>
  )
}
