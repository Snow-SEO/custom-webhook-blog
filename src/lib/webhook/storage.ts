import { eq, desc } from "drizzle-orm";
import { db, posts } from "../db/index";
import type { WebhookPost } from "./types";

export interface SavePostInput {
  slug: string;
  title: string;
  markdown?: string;
  html: string;
  featuredImage?: {
    url: string;
    caption: string | null;
  };
  originalId?: string;
  source?: string;
  metaData?: Record<string, unknown>;
  publishedAt?: Date;
}

export async function savePost(input: SavePostInput): Promise<WebhookPost> {
  const now = new Date();

  const [saved] = await db
    .insert(posts)
    .values({
      slug: input.slug,
      title: input.title,
      markdown: input.markdown,
      html: input.html,
      featuredImage: input.featuredImage
        ? JSON.stringify(input.featuredImage)
        : null,
      originalId: input.originalId,
      source: input.source || "webhook",
      metaData: input.metaData ? JSON.stringify(input.metaData) : null,
      publishedAt: input.publishedAt,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: posts.slug,
      set: {
        title: input.title,
        markdown: input.markdown,
        html: input.html,
        featuredImage: input.featuredImage
          ? JSON.stringify(input.featuredImage)
          : null,
        originalId: input.originalId,
        source: input.source || "webhook",
        metaData: input.metaData ? JSON.stringify(input.metaData) : null,
        publishedAt: input.publishedAt,
        updatedAt: now,
      },
    })
    .returning();

  const post = saved as Record<string, unknown>;
  return {
    ...post,
    featuredImage: post.featuredImage
      ? JSON.parse(post.featuredImage as string)
      : undefined,
    metaData: post.metaData ? JSON.parse(post.metaData as string) : undefined,
    date:
      (post.publishedAt as Date)?.toISOString() ||
      (post.createdAt as Date).toISOString(),
  } as WebhookPost;
}

export async function deletePost(slug: string): Promise<boolean> {
  const [deleted] = await db
    .delete(posts)
    .where(eq(posts.slug, slug))
    .returning();

  return !!deleted;
}

/** Delete a post by its ID (the cmsArticleId returned during publish) */
export async function deletePostById(id: string): Promise<boolean> {
  const [deleted] = await db.delete(posts).where(eq(posts.id, id)).returning();

  return !!deleted;
}

export async function getPost(slug: string): Promise<WebhookPost | null> {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (!post) {
    return null;
  }

  const p = post as Record<string, unknown>;
  return {
    ...p,
    featuredImage: p.featuredImage
      ? JSON.parse(p.featuredImage as string)
      : undefined,
    metaData: p.metaData ? JSON.parse(p.metaData as string) : undefined,
    date:
      (p.publishedAt as Date)?.toISOString() ||
      (p.createdAt as Date).toISOString(),
  } as WebhookPost;
}

export async function listPosts(): Promise<WebhookPost[]> {
  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt));

  return allPosts.map((post) => {
    const p = post as Record<string, unknown>;
    return {
      ...p,
      featuredImage: p.featuredImage
        ? JSON.parse(p.featuredImage as string)
        : undefined,
      metaData: p.metaData ? JSON.parse(p.metaData as string) : undefined,
      date:
        (p.publishedAt as Date)?.toISOString() ||
        (p.createdAt as Date).toISOString(),
    } as WebhookPost;
  });
}

export async function postExists(slug: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  return !!existing;
}

export function generateSlug(title: string, prefix?: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60);

  return prefix ? `${prefix}-${baseSlug}` : baseSlug;
}
