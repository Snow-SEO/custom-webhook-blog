import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, formatDate } from "@/lib/posts";
import { MarkdownRenderer } from "./markdown-renderer";

export async function generateStaticParams() {
  const posts = getAllPosts();
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
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        &larr; Back to all posts
      </Link>

      {/* Post Header */}
      <header className="mt-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {post.title}
        </h1>
        <time
          dateTime={post.date}
          className="mt-3 block text-sm text-zinc-500 dark:text-zinc-400"
        >
          {formatDate(post.date)}
        </time>
      </header>

      {/* Post Content */}
      <div className="mt-10">
        <MarkdownRenderer content={post.content} />
      </div>
    </article>
  );
}
