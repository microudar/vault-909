import './globals.css'

export const metadata = {
  title: 'Архив 909',
  description: 'Архив электронной музыки',
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
