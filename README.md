# Cymor Hub

The single home for every Cymor Tech Services project, service and way to get in touch.

## Structure

- `index.html` — the whole page shell (loading screen, header, hero, sections)
- `assets/css/` — `variables` (design tokens) → `style` (layout/sections) → `components` (buttons/chips/timeline/stats) → `cards` (project/service cards) → `modal` → `animations` → `responsive`
- `assets/js/` — `core` (CYMOR Core canvas engine) → `intro` (cinematic intro) → `hero` (core + rotating phrase) → `lattice` → `app` (socials) → `nav` (floating nav, mobile menu) → `projects` / `services` (render from JSON) → `search` (project filter) → `modal` (project detail) → `lab` → `stack` / `network` / `activity` → `system` (telemetry) → `palette` (Ctrl/⌘+K) → `animations` → `cursor` → `main`
- `assets/css/cymor.css` — the v3 theme layer (loads last; glass system, nav, hero, intro, cards).
- `data/` — `projects.json`, `services.json`, `socials.json`, `stack.json` (orbiting technologies), `lab.json` (Lab + Currently building). **Add a new project or service by editing these JSON files only** — no HTML/JS changes needed.

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

## v3.1 notes

**Page order:** Hero → Services (+ tech stack) → How I work (process flowchart) → About → Projects (grid / network toggle, lab strip) → System info → Contact → Footer. Phones also get a bottom tab bar and a full-screen menu.

- **Intro:** plays on every visit (skippable). Red text and timing live in `assets/js/intro.js` + `assets/css/cymor.css`.
- **Background:** diamond-cubic carbon lattice, `assets/js/lattice.js` (fewer atoms on phones, paused when the tab is hidden).
- **Hero phrases:** edit the `phrases` array in `assets/js/hero.js`.
- **Projects:** `data/projects.json`. Optional fields: `featured` (sorts first + star), `tags` (`"ai"`, `"pwa"` → filter chips appear automatically), `tech`, `githubUrl`, `thumb` (e.g. `assets/projects/cymor-ai.webp`). No `thumb` → a generated preview card is shown.
- **Services:** `data/services.json` (`icon, name, description, points[]`). **Stack:** `data/stack.json`. **Lab:** `data/lab.json`. **Activity:** `data/activity.json` (empty = section hidden).
- **System section:** device info is read locally. IP/provider/location use one lookup to `IP_LOOKUP_URL` in `assets/js/system.js` when the section scrolls into view; set `AUTO_LOOKUP = false` to make it click-only. Nothing is stored.
- **Scroll animations:** add `class="rv" data-rv="left|right|up|zoom"` to anything.

## Live screenshots

Project cards automatically show `assets/projects/<project-id>.jpg` when it exists (otherwise the generated card is shown). The images are produced by the GitHub Actions workflow `.github/workflows/screenshots.yml`, which visits each `url` in `data/projects.json` and commits fresh screenshots. Run it from the Actions tab or let it run weekly.

## Activity feed

Add entries to `data/activity.json` like `{ "date": "2026-10-05", "text": "Shipped v3", "type": "deployed" }`. The section stays hidden while the list is empty.
