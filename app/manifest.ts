import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CymorFlix',
    short_name: 'CymorFlix',
    description: 'Movies, made cinematic. By Legendary Smiley Cymor.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#090a0d',
    theme_color: '#090a0d',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
