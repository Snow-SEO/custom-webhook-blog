// Environment configuration for webhook receiver

export const webhookConfig = {
  // Secret token for verifying SnowSEO webhook requests
  secret: process.env.SNOWSEO_WEBHOOK_SECRET?.trim() || null,

  // Allowed origins for CORS (if needed)
  allowedOrigins: process.env.WEBHOOK_ALLOWED_ORIGINS?.split(",") || [],

  // Debug mode - logs more details
  debug: process.env.WEBHOOK_DEBUG === "true",

  // Base URL of this blog (used to construct cmsUrl in webhook responses)
  // e.g. "https://your-blog.vercel.app" — no trailing slash
  blogBaseUrl:
    process.env.WEBHOOK_BLOG_BASE_URL?.trim().replace(/\/+$/, "") || null,
} as const;

export type WebhookConfig = typeof webhookConfig;