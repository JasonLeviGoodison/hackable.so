import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'hackable.so',
  description: 'A social platform with 12 hidden vulnerabilities. How many can you find?',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
