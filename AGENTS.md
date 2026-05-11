<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Webhook Blog

A headless demo blog showcasing SnowSEO webhook integration.

## Purpose

This demo blog receives and displays content via webhooks from SnowSEO:

- Demonstrates webhook endpoint receiving content
- Shows HTML content rendering from webhook payloads
- Tests event-driven content management (publish, draft, user-determined unpublish)

## Architecture

- **Content**: Received via webhook and stored in PostgreSQL database
- **Routing**:
  - `/` — Blog post listing
  - `/blog/[slug]` — Individual blog post
- **Webhook endpoint**: `POST /api/webhook/snowseo`
- **Database**: PostgreSQL via Drizzle ORM (Vercel Postgres compatible)
- **Rendering**: HTML content rendered directly with `dangerouslySetInnerHTML` + Tailwind typography

## Webhook Events Handled

| Event                 | Action                                                          |
| --------------------- | --------------------------------------------------------------- |
| `article.published`   | Save post with markdown and HTML content                        |
| `article.drafted`     | Save as draft                                                   |
| `article.unpublished` | Ask user what to do — delete, archive, or mark unpublished |
| `webhook.connected`   | Validation ping response                                        |

## Webhook Payload

SnowSEO sends a JSON payload with both `markdown` and `html` fields:

```typescript
{
  event: "article.published" | "article.drafted",
  timestamp: "2026-05-01T00:00:00Z",
  article: {
    slug: "article-title-slug",
    title: "Article Title",
    markdown: "# Markdown content\n\n paragraphs and **bold** text",
    html: "<h1>Markdown content</h1><p>paragraphs and <strong>bold</strong> text</p>",
    status: "publish" | "draft",
    featuredImage: {
      url: "https://example.com/image.jpg",
      caption: "Image caption text"
    },
    metaData: {
      metaTitle: "SEO Title",
      metaDescription: "SEO Description",
      ogTitle: "Social Title",
      ogDescription: "Social Description",
      canonicalUrl: "https://example.com/article",
      twitterTitle: "Twitter Title",
      twitterDescription: "Twitter Description"
    }
  }
}
```

**Fields:**

- `article.slug` - URL-friendly slug (use provided or generated from title)
- `article.markdown` - Original markdown content from SnowSEO
- `article.html` - Rendered HTML (processed with image optimization, link handling, sanitization)
- `article.featuredImage` - Featured image object with `url` and `caption` (optional)
- `article.metaData` - SEO and social metadata object

### Featured Image Extraction

SnowSEO extracts the first image from the article's markdown content and sends it as a separate `featuredImage` field. The image **does not appear inside `article.markdown` or `article.html`** — it has been removed from both during processing. Receiving applications should render `featuredImage` separately (e.g. at the top of the post) rather than expecting it to also appear in the content.

### Response Expectations

On `article.published` and `article.drafted` events, SnowSEO reads the response body to extract:

- **`cmsArticleId`** (string, optional) — A unique identifier the receiver assigns to the published article (e.g. a database ID). Used to link SnowSEO's article to the external article.
- **`cmsUrl`** (string, optional) — The public live URL of the published article. When present, SnowSEO uses it for the "Preview Live" link in the UI.

If either field is not returned, SnowSEO leaves the corresponding article metadata untouched. For receivers that don't track article IDs, returning an empty successful response is sufficient.

**Example response:**

```json
{
  "success": true,
  "slug": "my-article",
  "action": "published",
  "message": "Post saved successfully",
  "cmsArticleId": "123",
  "cmsUrl": "https://my-blog.com/blog/my-article"
}
```

## Key Conventions

- `params` is a `Promise` — must be `await`ed in page components
- Tailwind CSS v4 with `@import "tailwindcss"` syntax
- CSS classes via `@tailwindcss/typography` for prose styling

## Webhook Configuration

Set `SNOWSEO_WEBHOOK_SECRET` in `.env` to the same value you configure in SnowSEO. This receiver rejects every webhook request unless the `Authorization: Bearer <secret>` header matches:

```env
DATABASE_URL=postgresql://...
SNOWSEO_WEBHOOK_SECRET=your-secret
```

## Database

Run `pnpm db:push` to push schema to database. See `src/lib/db/schema.ts` for the `posts` table structure.

## Testing Webhooks

```bash
curl -X POST http://localhost:3002/api/webhook/snowseo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret" \
  -d '{
    "event": "article.published",
    "timestamp": "2026-05-01T00:00:00Z",
    "article": {
      "slug": "test-post",
      "title": "Test Post",
      "markdown": "# Hello\n\nThis is the **markdown** content.",
      "html": "<h1>Hello</h1><p>This is the <strong>markdown</strong> content.</p>",
      "status": "publish",
      "featuredImage": {
        "url": "https://example.com/image.jpg",
        "caption": "Test image caption"
      },
      "metaData": {
        "metaDescription": "Test excerpt"
      }
    }
  }'
```
