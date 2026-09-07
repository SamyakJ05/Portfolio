# Portfolio

Source for [samyak.space](https://samyak.space), personal site and blog for Samyak Jain, Software Engineer at UBS.

Static HTML/CSS/JS front end deployed on Netlify, with a serverless blog (`blog.samyak.space`) rendered on the fly from Netlify Blobs via Netlify Functions.

## Stack

- Vanilla HTML/CSS/JS, no framework, no build step for the main site
- Netlify Functions (`netlify/functions`) for the blog API and server-rendered article/index pages
- Netlify Blobs for blog post storage
- Netlify redirects (`netlify.toml`) for canonical-host enforcement and legacy URL handling

## Structure

| Path | Purpose |
|---|---|
| `index.html` | Main portfolio page: hero, about, experience, awards, projects, writing, contact |
| `admin.html` | Blog post admin/editor UI |
| `styles.css` | Site-wide styles |
| `main.js` | Front-end interactivity (theme toggle, scroll reveal, cursor, nav) |
| `articles.js` | Blog article rendering logic |
| `netlify/functions/` | Serverless functions: blog SSR, legacy redirect handling, blog API |
| `images/` | Static assets |

## Sections

- **Projects**: RetainIQ (Amazon AIdeaS 2026 Innovation Category winner), Apex Atlas, ProofBoard, KineticFlow, Soul Train, SignalScan, Email Verifier, and IntelliFunnel Labs client work.
- **Writing**: technical articles, served from `blog.samyak.space`.

## Local development

No build step required for the static site. Open `index.html` directly or serve the repo root with any static file server.

For the blog functions, use the Netlify CLI:

```bash
npm install
netlify dev
```

## Deployment

Pushes to `main` deploy automatically via Netlify. See `netlify.toml` for redirect and header configuration.

## Links

- Live site: [samyak.space](https://samyak.space)
- GitHub: [SamyakJ05](https://github.com/SamyakJ05)
- LinkedIn: [samyakj05](https://www.linkedin.com/in/samyakj05/)
