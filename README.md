# CymorFlix 1.0

Movies, made cinematic. Built by **Legendary Smiley Cymor** · Cymor Tech Services, Nairobi.

Next.js 16 · React 19 · Tailwind 4. No extra dependencies were added.

## Features
- 3D animated logo intro (skippable, can be turned off in Settings)
- Rotating hero banner (swipe on mobile) with trending, popular, new-release, series, upcoming and genre rows
- Bottom nav: Home · Football · Downloads · Settings · Novel
- MovieBox playback links are requested server-side on demand; the browser receives only a short-lived media URL
- Movie downloads request a fresh signed URL for the selected quality; the browser handles the download
- Football tabs for live matches, fixtures, and replays, including available streams
- Netflix-style player: auto-hiding controls, ±10s skip, double-tap seek, speed, quality menu, fullscreen, resume position, HLS (.m3u8) support, and signed-link refresh
- Novel button opens the connected Rumion Novel Hub
- Settings with developer credit, version, playback / download / appearance options

## Deploy
1. Push this folder to GitHub.
2. Import the repo in Vercel (framework: Next.js, auto-detected).
3. Project → Settings → Environment Variables: add `FRAMEX_API_KEY` for **Production**, then redeploy. FrameX requests use `https://cymortechservices.my.id` as their `Origin` and `Referer`, even when the app is opened through Vercel's `www` redirect or a preview deployment.
4. Project → Settings → Domains: add your domain and set the DNS records Vercel shows.

Without the key the app runs in **preview mode** with sample titles.

## FrameX data
The FrameX key is used only by Next.js API routes and is never sent to browser code. Catalog requests are made through `/api/framex`; playback and downloads use `/api/framex/play`; football feeds use `/api/framex/sports`. The API origin defaults to `https://cymortechservices.my.id`, not Vercel's deployment-specific hostname; use `FRAMEX_SITE_ORIGIN` only if your FrameX key is registered for a different HTTPS origin.

The app uses documented MovieBox catalog routes for trending, popular, latest, popular series, upcoming, search, and title detail. It uses the signed `/api/v1/stream-url` endpoint for playback and downloads. Signed links expire, so the player refreshes them rather than storing them as permanent URLs.

FrameX search may fall back to Showbox. The current public docs state that Showbox stream-source routes are unavailable, so those results are labeled as not playable by this integration. Football uses the documented `/api/v1/sports/ongoing`, `/matches`, and `/replays` endpoints. Actual stream availability depends on what the provider returns for a match.

Make sure you have the rights to stream or distribute whatever your catalog source provides.

## Local run
```
pnpm install
cp .env.example .env.local
pnpm dev
```
