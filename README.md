# Webhook Blog

A headless blog built with Next.js 16, TypeScript, and Tailwind CSS v4. This project demonstrates SnowSEO webhook integration by receiving and displaying content via webhooks.

## Purpose

This is a **demo blog** that showcases:

- Webhook endpoint receiving content from SnowSEO
- HTML content rendering from webhook payloads
- Event-driven content management (publish, draft, best-effort unpublish)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL database (for webhook content storage)

### Installation

```bash
pnpm install
```

### Environment Setup

Put these values in `.env` and configure a shared webhook secret:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
SNOWSEO_WEBHOOK_SECRET=your-secure-webhook-secret
WEBHOOK_DEBUG=false
# Public URL of this blog (used to return cmsUrl in webhook responses)
# e.g. "https://your-blog.vercel.app" — no trailing slash
WEBHOOK_BLOG_BASE_URL=https://your-blog.vercel.app
```

Use the same `SNOWSEO_WEBHOOK_SECRET` value in SnowSEO's webhook settings and in this app. Every webhook request is rejected unless it includes `Authorization: Bearer <your-secure-webhook-secret>`. If the secret is missing, the receiver returns a configuration error instead of accepting the ping.

### Database Setup

Push the schema to your database:

```bash
pnpm db:push
```

This will create the `posts` and `webhook_logs` tables used by the demo. If you add or change tables, re-run `pnpm db:push` from the project root.

### Development

```bash
pnpm dev
```

Open [http://localhost:3002](http://localhost:3002) to view the blog.

### Inspecting Requests

All webhook calls are stored in the `webhook_logs` table. Open [http://localhost:3002/logs](http://localhost:3002/logs) to inspect the masked headers, raw payload, and parsed JSON for each request.

## Project Structure

```
src/
├── app/
│   ├── api/webhook/snowseo/route.ts   # Webhook endpoint
│   ├── blog/[slug]/page.tsx           # Blog post pages
│   └── page.tsx                       # Blog listing
└── lib/
    ├── db/
    │   ├── index.ts                   # Database client
    │   └── schema.ts                  # Database schema
    ├── webhook/
    │   ├── storage.ts                # Post storage operations
    │   ├── types.ts                  # TypeScript types
    │   └── config.ts                  # Configuration
    └── utils.ts                       # Utility functions
```

## Webhook Events

| Event                 | Description                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `article.published`   | Save post with markdown and HTML content                                                                 |
| `article.drafted`     | Save post as draft                                                                                       |
| `article.unpublished` | Optional but recommended best-effort delete from remote targets; always keep local SnowSEO state in sync |
| `webhook.connected`   | Validation ping that still requires auth                                                                 |

## Webhook Payload

SnowSEO sends a JSON payload with both markdown and HTML content:

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

The receiver also accepts the `webhook.connected` validation ping, but that request still requires the same bearer token.

### Response Expectations

On `article.published` and `article.drafted` events, SnowSEO reads the response body to extract:

- **`cmsArticleId`** (string, optional) — A unique identifier the receiver assigns to the published article (e.g. a database ID or CMS post ID). Used to link SnowSEO's article to the external article for future sync/update calls.
- **`cmsUrl`** (string, optional) — The public live URL of the published article. When present, SnowSEO stores it on the article record and uses it for the "Preview Live" link in the UI.

If either field is not returned, SnowSEO leaves the corresponding article metadata untouched. For webhook receivers that don't track article IDs or URLs, returning an empty successful response is sufficient — the webhook will still appear as "published" in SnowSEO.

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

**Fields:**

- `article.slug` - URL-friendly slug for the article (use provided or generated from title)
- `article.markdown` - Original markdown content from SnowSEO
- `article.html` - Rendered HTML (processed with image optimization, link handling, sanitization)
- `article.featuredImage` - Featured image object with `url` and `caption` (optional)
- `article.metaData` - SEO and social metadata object

### Featured Image Extraction

SnowSEO extracts the first image from the article's markdown content and sends it as a separate `featuredImage` field. The image **does not appear inside `article.markdown` or `article.html`** — it has been removed from both during processing. Receiving applications should render `featuredImage` separately (e.g. at the top of the post) rather than expecting it to also appear in the content.

### Testing Webhooks

Send a test webhook with the same secret you configured in SnowSEO and in `.env`:

```bash
curl -X POST http://localhost:3002/api/webhook/snowseo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secure-webhook-secret" \
  -d '{
    "event": "article.published",
    "timestamp": "2026-05-01T00:00:00Z",
    "article": {
      "slug": "test-post",
      "title": "Test Post",
      "markdown": "# Hello\n\nThis is the **markdown** content.",
      "html": "<h1>Hello</h1><p>This is the <strong>html</strong> content.</p>",
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

If the bearer token is missing or does not match `SNOWSEO_WEBHOOK_SECRET`, the receiver returns an error and the payload will not be processed.

## Scripts

| Script                  | Description                    |
| ----------------------- | ------------------------------ |
| `pnpm dev`              | Start development server       |
| `pnpm build`            | Build for production           |
| `pnpm start`            | Start production server        |
| `pnpm type-check`       | Run TypeScript type checking   |
| `pnpm lint:biome`       | Run Biome linter               |
| `pnpm lint:biome:write` | Fix Biome issues automatically |
| `pnpm db:generate`      | Generate database migrations   |
| `pnpm db:push`          | Push schema to database        |
| `pnpm db:studio`        | Open Drizzle Studio            |

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Drizzle ORM
- **Linting**: Biome

## Integrate it with AI!

Use the prompt below in your AI assistant/agent to generate a complete, runnable webhook receiver for the current codebase. It is intentionally general: the agent should inspect the repository, infer the stack, implement the webhook receiver, and wire it up without asking the user for placeholders or extra setup details.

Copy-paste prompt:

````
You are an expert developer. Inspect this repository, determine the app's stack and structure, and implement a complete webhook integration for SnowSEO content generation.

Goal:
- Add or improve the webhook receiver so it accepts SnowSEO webhooks, persists content, and is ready for production use in this codebase.
- The solution must be runnable in this repository with minimal changes.
- Infer framework choices, file paths, or placeholders. from the codebase.

Required behavior:
- Accept `article.published`, `article.drafted`, `article.unpublished`, and `webhook.connected`.
- Save the full payload, including the raw request body, so the exact event can be reviewed later.
- For `article.published` and `article.drafted`, upsert the article content and metadata.
- For `article.unpublished`, ask the user what action to take — the receiver should not delete content silently. Common options include: hard delete the post, archive/soft-delete it (set a `deletedAt` timestamp), or mark it as unpublished in the DB. Return the chosen action in the response.
- For `webhook.connected`, return a simple successful acknowledgement.
- Validate the `Authorization: Bearer <secret>` header against a shared env var such as `SNOWSEO_WEBHOOK_SECRET` or `WEBHOOK_SECRET`.
- If the repo uses env example files, update them and clearly tell the user to paste the SnowSEO-provided secret into that variable in their actual env file.
- Use the repository's existing conventions for storage, validation, logging, and tests.
- Add any missing local docs or examples so a developer can understand how to connect their agent or app.

Deliverables:
- Update the relevant source files in this repo.
- Add or update README guidance where helpful.

On `article.published` and `article.drafted` events, return a JSON response that includes:
- **`cmsArticleId`** (string, optional) — a unique identifier for the published article (e.g. database ID, CMS post ID). SnowSEO stores this to link future updates to the correct article.
- **`cmsUrl`** (string, optional) — the public live URL of the article (e.g. `https://your-blog.com/blog/my-article`). SnowSEO uses this for the "Preview Live" link in the dashboard.

If a receiver doesn't track IDs or URLs, it can return an empty successful response — the webhook will still appear as published in SnowSEO.

Sample webhook payload:

```json
{
  "event": "article.published",
  "timestamp": "2026-05-01T00:00:00Z",
  "article": {
    "slug": "test-post",
    "title": "Test Post",
    "markdown": "# Hello\n\nThis is the **markdown** content.",
    "html": "<h1>Hello</h1><p>This is the <strong>html</strong> content.</p>",
    "status": "publish",
    "featuredImage": { "url": "https://example.com/image.jpg", "caption": "Test image" },
    "metaData": { "metaDescription": "Test excerpt" }
  }
}
````

Sample response:

```json
{
  "success": true,
  "slug": "test-post",
  "action": "published",
  "message": "Post saved successfully",
  "cmsArticleId": "123",
  "cmsUrl": "https://your-blog.com/blog/test-post"
}
```

If there is an existing webhook receiver, extend it instead of creating a duplicate.
If the repo already has tests, add or update the nearest relevant test.
Keep the implementation concise, idiomatic, and production-safe.

```

Tip: the agent should infer everything it needs from this repository, so you do not have to provide framework names, file paths, or placeholder values.
```
