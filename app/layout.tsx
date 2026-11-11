import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CymorFlix — Movies, made cinematic',
  description: 'Discover trending movies, stream and download in your favourite quality. CymorFlix by Legendary Smiley Cymor.',
  applicationName: 'CymorFlix',
  generator: 'CymorFlix',
  authors: [{ name: 'Legendary Smiley Cymor' }],
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'CymorFlix', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#090a0d',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-fx="on">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
