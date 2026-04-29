import ArtistClient from './ArtistClient'

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
  return <ArtistClient slug={params.slug} />
}
