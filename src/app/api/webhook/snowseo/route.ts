import { type NextRequest, NextResponse } from "next/server";
import type { SnowSEOWebhookPayload } from "@/lib/webhook/types";
import { savePost, deletePostById, generateSlug } from "@/lib/webhook/storage";
import { webhookConfig } from "@/lib/webhook/config";
import { db, webhookLogs } from "@/lib/db";
import { createHash } from "node:crypto";

const TRAILING_SLASH_REGEX = /\/+$/;

/**
 * Webhook receiver endpoint for SnowSEO events.
 *
 * Events handled:
 * - article.published: Save post with markdown and HTML content
 * - article.drafted: Save post as draft
 * - article.unpublished: Optional best-effort remove post; unsupported receivers should not block local state updates
 * - webhook.connected: Connection ping (validation)
 *
 * The webhook payload includes both markdown (original) and html (rendered) content,
 * plus featuredImage and metaData for SEO.
 *
 * To test locally:
 * curl -X POST http://localhost:3002/api/webhook/snowseo \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer your-secret" \
 *   -d '{"event":"article.published","timestamp":"2024-01-01T00:00:00Z","article":{"slug":"test-post","title":"Test Post","markdown":"# Hello\n\nWorld","html":"<h1>Hello</h1><p>World</p>","status":"publish","featuredImage":{"url":"https://example.com/image.jpg","caption":"Test"},"metaData":{"metaDescription":"Test excerpt"}}}'
 */

export async function POST(request: NextRequest) {
  try {
    // Only keep headers that SnowSEO actually sends from the API backend
    const ALLOWED_HEADERS = new Set([
      "authorization",
      "content-type",
      "user-agent",
    ]);
    const headersObj: Record<string, string> = {};
    for (const [k, v] of request.headers.entries()) {
      if (ALLOWED_HEADERS.has(k.toLowerCase())) {
        headersObj[k] = k.toLowerCase() === "authorization" ? "REDACTED" : v;
      }
    }

    // Read raw body for payload processing and idempotency
    const rawBody = await request.text();

    if (!webhookConfig.secret) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing SNOWSEO_WEBHOOK_SECRET configuration",
        },
        { status: 500 }
      );
    }

    // Every webhook request must present the shared bearer token.
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    if (token !== webhookConfig.secret) {
      return NextResponse.json(
        { success: false, error: "Invalid secret" },
        { status: 401 }
      );
    }

    let payload: SnowSEOWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!payload.event) {
      return NextResponse.json(
        { success: false, error: "Missing event type" },
        { status: 400 }
      );
    }

    if (webhookConfig.debug) {
      console.log("[Webhook] Full payload:", JSON.stringify(payload, null, 2));
    }

    console.log(`[Webhook] Received: ${payload.event} at ${payload.timestamp}`);

    // determine slug (if present) so we can store it in the log
    const slugCandidate =
      payload.article?.slug ||
      (payload.article?.title
        ? generateSlug(payload.article.title, "snowseo")
        : null);

    // compute idempotency key from raw body
    const idempotencyKey = createHash("sha256")
      .update(rawBody || "")
      .digest("hex");

    // persist incoming request into webhook_logs (best-effort; don't fail the webhook if log insert errors)
    try {
      await db.insert(webhookLogs).values({
        event: payload.event,
        receivedAt: new Date(),
        slug: slugCandidate,
        idempotencyKey,
        status: "received",
        rawBody,
        payload: JSON.stringify(payload),
        headers: JSON.stringify(headersObj),
      });
    } catch (err) {
      console.warn("[Webhook] Failed to persist log:", err);
    }

    const result = await handleEvent(payload);

    const savedPost = result.savedPost;
    if (!savedPost) {
      return NextResponse.json({
        event: payload.event,
        timestamp: payload.timestamp,
        ...result,
      });
    }

    const responseBody = {
      event: payload.event,
      timestamp: payload.timestamp,
      ...result,
      cmsArticleId: savedPost.id,
      cmsUrl:
        `${webhookConfig.blogBaseUrl ?? ""}/blog/${savedPost.slug}`.replace(
          TRAILING_SLASH_REGEX,
          ""
        ),
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

async function handleEvent(payload: SnowSEOWebhookPayload): Promise<{
  success: boolean;
  slug?: string;
  action?: string;
  message?: string;
  savedPost?: { id: string; slug: string } | null;
}> {
  switch (payload.event) {
    case "article.published":
    case "article.drafted": {
      const article = payload.article;
      if (!article) {
        return { success: false, message: "No article in payload" };
      }

      // Use provided slug or generate one from title
      const slug = article.slug || generateSlug(article.title, "snowseo");
      const isPublished = payload.event === "article.published";
      const saved = await savePost({
        slug,
        title: article.title,
        markdown: article.markdown,
        html: article.html,
        originalId: article.id,
        featuredImage: article.featuredImage,
        metaData: article.metaData as Record<string, unknown>,
        publishedAt: isPublished ? new Date() : (undefined as Date | undefined),
      });

      return {
        success: true,
        slug: saved.slug,
        action: isPublished ? "published" : "drafted",
        message: `Post "${saved.title}" saved successfully`,
        savedPost: { id: saved.id, slug: saved.slug },
      };
    }

    case "article.unpublished": {
      const article = payload.article;
      if (!article) {
        return { success: false, message: "No article in payload" };
      }

      // article.id is the CMS-assigned ID when available (returned during publish),
      // falling back to SnowSEO's internal article ID.
      const cmsArticleId = article.id;
      const deleted = await deletePostById(cmsArticleId);

      return {
        success: true,
        action: "unpublished",
        message: deleted
          ? `Post "${article.title}" removed`
          : `Post "${article.title}" not found (may already be deleted)`,
        savedPost: null,
      };
    }

    case "webhook.connected": {
      console.log("[Webhook] Connection ping received:", payload.message);
      return {
        success: true,
        action: "ping",
        message: payload.message || "Webhook connection confirmed",
        savedPost: null,
      };
    }

    default:
      return {
        success: true,
        action: "unknown",
        message: `Unhandled event type: ${payload.event}`,
        savedPost: null,
      };
  }
}

// Health check
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "snowseo-webhook-receiver",
    timestamp: new Date().toISOString(),
  });
}
