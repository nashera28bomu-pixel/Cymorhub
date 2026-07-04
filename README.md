# Cymor Hub

The single home for every Cymor Tech Services project, service and way to get in touch.

## Structure

- `index.html` — the whole page shell (loading screen, header, hero, sections)
- `assets/css/` — `variables` (design tokens) → `style` (layout/sections) → `components` (buttons/chips/timeline/stats) → `cards` (project/service cards) → `modal` → `animations` → `responsive`
- `assets/js/` — `loader` (splash screen) → `particles` (hero background) → `app` (orbit tabs + mobile nav) → `projects` / `services` (render from JSON) → `search` (project filter) → `modal` (project detail popup) → `animations` (counters + timeline reveal) → `main` (contact links from socials.json)
- `data/` — `projects.json`, `services.json`, `socials.json`. **Add a new project or service by editing these JSON files only** — no HTML/JS changes needed.

## Adding a new project

Open `data/projects.json` and add a new object to the array:

```json
{
  "id": "your-project-id",
  "name": "Project Name",
  "icon": "🚀",
  "shortDescription": "One line for the card.",
  "description": "Longer description for the modal.",
  "features": ["Feature one", "Feature two", "Feature three"],
  "category": "apps",
  "status": "Live",
  "version": "v1.0",
  "url": "https://your-live-url.com"
}
```

`category` must be `"apps"`, `"bots"`, or `"tools"` to match the filter chips. Leave `"url": null` if it's not live yet — the card will show "Coming Soon" instead of a broken link.

## Deployment note

This site fetches `data/*.json` with `fetch()`, which **will not work if you just double-click `index.html` locally** (browsers block `fetch` over `file://`). It works correctly once deployed to Vercel, Render, GitHub Pages, or any real static host.

**Deploy the whole folder as-is** (e.g. push it to a GitHub repo and connect that repo to Vercel, rather than dragging individual files into a web upload tool) — this preserves the `assets/` and `data/` folder structure, which is what broke on a previous project when folders got flattened during upload.

## Before going live

- Replace the WhatsApp numbers/email/socials in `data/socials.json` if anything changes
- Replace `REPLACE-WITH-YOUR-DOMAIN` in `sitemap.xml` with your real domain
- Swap `assets/images/logo.svg` / `assets/icons/icon.svg` for a raster logo later if you commission one — SVG works fine as-is for web and favicon use
