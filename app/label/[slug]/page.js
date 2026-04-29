import LabelClient from './LabelClient'

export async function generateMetadata({ params }) {
  const name = params.slug.replace(/-/g, ' ')

  return {
    title: `${name} — лейбл электронной музыки | Vault 909`,
    description: `Каталог релизов лейбла ${name}. EP, винил, альбомы и редкие записи.`,
  }
}

export default function Page({ params }) {
  return <LabelClient slug={params.slug} />
}
