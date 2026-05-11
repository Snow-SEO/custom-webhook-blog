export interface WebhookPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  markdown?: string;
  html: string;
  featuredImage?: {
    url: string;
    caption: string | null;
  };
  source: string;
  originalId?: string;
  metaData?: Record<string, unknown>;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Webhook event types from SnowSEO
export type SnowSEOEvent =
  | "article.published"
  | "article.drafted"
  | "article.unpublished"
  | "webhook.connected";

export interface SnowSEOArticleMetaData {
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
}

export interface SnowSEOArticle {
  id: string;
  slug: string;
  title: string;
  markdown: string; // Original markdown content from SnowSEO
  html: string; // Converted HTML content from SnowSEO
  status: "publish" | "draft";
  featuredImage?: {
    url: string;
    caption: string | null;
  };
  metaData?: SnowSEOArticleMetaData;
}

export interface SnowSEOWebhookPayload {
  event: SnowSEOEvent;
  timestamp: string;
  article?: SnowSEOArticle;
  message?: string;
}
