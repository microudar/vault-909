import ArtistClient from './ArtistClient'

export async function generateMetadata({ params }) {
  const slug = params.slug

  // делаем красивое имя только для SEO
  const name = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  return {
    title: `${name} — дискография артиста | Vault 909`,
    description: `Дискография ${name}. Все релизы, включая EP, альбомы и редкие записи.`,
  }
}

export default function Page({ params }) {
  const slug = params.slug

  const name = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name,
    url: `https://vault909.ru/artist/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      {/* 🔥 ВАЖНО — передаём slug, НЕ decoded */}
      <ArtistClient slug={slug} />
    </>
  )
}
