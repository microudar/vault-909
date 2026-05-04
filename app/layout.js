import './globals.css'

export const metadata = {
  title: 'Архив 909 — electronic music database',
  description: 'Database of techno, house, ambient and underground releases',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
