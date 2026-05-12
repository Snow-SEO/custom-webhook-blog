import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getPost, listPosts } from "@/lib/webhook/storage";
import type { SnowSEOWebhookPayload } from "@/lib/webhook/types";
import { HtmlRenderer } from "./markdown-renderer";
import { WebhookPayloadViewer } from "./webhook-payload-viewer";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const payload: SnowSEOWebhookPayload = {
    event: "article.published",
    timestamp: (post.publishedAt ?? post.createdAt).toISOString(),
    article: {
      id: post.originalId ?? post.slug,
      slug: post.slug,
      title: post.title,
      markdown: post.markdown ?? "",
      html: post.html,
      status: "publish",
      featuredImage: post.featuredImage,
      metaData: post.metaData,
    },
  };

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to all posts
      </Link>

      {/* Featured Image */}
      {post.featuredImage?.url && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.caption || post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            loading="eager"
          />
        </div>
      )}

      {/* Post Header */}
      <header className="mt-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {post.title}
        </h1>
        <time
          dateTime={post.date}
          className="mt-3 block text-sm text-zinc-500 dark:text-zinc-400"
        >
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        {post.metaData?.metaDescription ? (
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            {String(post.metaData.metaDescription)}
          </p>
        ) : null}
      </header>

      {/* Post Content - Rendered as HTML directly */}
      <div className="mt-10">
        {/* <MarkdownRenderer content={post.markdown} /> */}
        <HtmlRenderer content={post.html} />
      </div>

      <hr className="my-12 border-zinc-200 dark:border-zinc-800" />

      <WebhookPayloadViewer payload={payload} />
    </article>
  );
}
