import { pgTable as createTable } from "drizzle-orm/pg-core";
import { text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const posts = createTable("posts", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  markdown: text("markdown"), // Original markdown content
  html: text("html").notNull(), // Rendered HTML content
  featuredImage: text("featured_image"), // JSON: { url: string, caption: string | null }
  source: text("source").default("webhook"), // 'webhook' | 'snowseo' | etc.
  originalId: text("original_id"), // ID from the source system (e.g., SnowSEO article ID)
  metaData: text("meta_data"), // JSON string of metadata
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().default(new Date()),
  updatedAt: timestamp("updated_at").notNull().default(new Date()),
});

export const webhookLogs = createTable("webhook_logs", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  event: text("event"),
  receivedAt: timestamp("received_at").notNull().default(new Date()),
  slug: text("slug"),
  idempotencyKey: text("idempotency_key"),
  status: text("status"),
  message: text("message"), // human-readable description of what happened
  // raw body and parsed payload stored as text to avoid DB JSON typing issues
  rawBody: text("raw_body"),
  payload: text("payload"),
  headers: text("headers"),
});
