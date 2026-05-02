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
  const name = params.slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name,
    url: `https://vault909.ru/artist/${params.slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      <ArtistClient slug={params.slug} />
    </>
  )
}
