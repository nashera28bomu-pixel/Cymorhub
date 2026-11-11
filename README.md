# CymorFlix 1.0

Movies, made cinematic. Built by **Legendary Smiley Cymor** · Cymor Tech Services, Nairobi.

Next.js 16 · React 19 · Tailwind 4. No extra dependencies were added.

## Features
- 3D animated logo intro (skippable, can be turned off in Settings)
- Rotating hero banner (swipe on mobile) with rows by category and a Top 10 row
- Bottom nav: Home · Football · Downloads · Settings (top links on desktop)
- Netflix-style player: auto-hiding controls, ±10s skip, double-tap seek, speed, quality menu, fullscreen, resume position, HLS (.m3u8) support
- Download overlay with quality choice (4K / Full HD / HD / Standard)
- Settings with developer credit, version, playback / download / appearance options

## Deploy
1. Push this folder to GitHub.
2. Import the repo in Vercel (framework: Next.js, auto-detected).
3. Project → Settings → Environment Variables: add `FRAMEX_API_KEY`, then redeploy.
4. Project → Settings → Domains: add your domain and set the DNS records Vercel shows.

Without the key the app runs in **preview mode** with sample titles.

## FrameX data
All FrameX response handling is in `lib/framex.ts`. Titles, posters, genres and cast are read from several common field names; playable/downloadable links are read from fields such as `sources`, `streams`, `downloads`, `stream_url`, `download_url`. If your FrameX plan names a field differently, add it to the alias lists there. Titles with no source simply show a "No stream available" screen.

Make sure you have the rights to stream or distribute whatever your catalog source provides.

## Local run
```
pnpm install
cp .env.example .env.local
pnpm dev
```
