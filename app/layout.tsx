import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JobSearch — AI Job Finder',
  description: 'Wyszukiwarka ofert pracy z generowaniem CV wspierana przez AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}
