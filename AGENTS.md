<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Headless Blog — Project Overview

A minimal headless blog built with Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.

## Architecture

- **Content**: Markdown files in `content/` directory (frontmatter via `gray-matter`)
- **Routing**:
  - `/` — Blog post listing (static)
  - `/blog/[slug]` — Individual blog post (SSG via `generateStaticParams`)
- **Data layer**: `src/lib/posts.ts` — reads markdown from `content/`, parses frontmatter
- **Markdown rendering**: `react-markdown` + `remark-gfm` + `@tailwindcss/typography` prose classes
- **Deployment**: Vercel-ready (all pages are statically generated)

## Key Next.js 16 Conventions Used

- `params` is a `Promise` — must be `await`ed in page components
- `PageProps<'/blog/[slug]'>` and `LayoutProps<'/'>` helpers are globally available (no import needed)
- Turbopack used as default bundler
- Tailwind CSS v4 with `@import "tailwindcss"` syntax (not `@tailwind` directives)
- CSS plugins imported via `@plugin "@tailwindcss/typography"` in CSS files

## Adding New Posts

Simply add a `.md` file to `content/` with frontmatter:
```yaml
---
title: "Post Title"
date: "2026-05-01"
excerpt: "Short description shown on the listing page."
---
```

Then rebuild (or the post will be picked up on next `generateStaticParams`).
