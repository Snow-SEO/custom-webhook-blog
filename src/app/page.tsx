import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { listPosts } from "@/lib/webhook/storage";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function HomePage() {
  const posts = await listPosts();

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <Link
            href="/logs"
            className="mb-6 inline-flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            See Webhook Logs <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Webhook Blog Demo
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            A demo blog showcasing SnowSEO webhook integration.
          </p>
        </div>
      </header>

      {/* Post Grid */}
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        {posts.length === 0 ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            No posts yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {/* Featured Image */}
                  {post.featuredImage?.url ? (
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.caption || post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700" />
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="line-clamp-2 text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
                      {post.title}
                    </h2>
                    <time
                      dateTime={post.date}
                      className="mt-2 block text-sm text-zinc-500 dark:text-zinc-400"
                    >
                      {formatDate(post.date)}
                    </time>
                    {post.metaData?.metaDescription ? (
                      <p className="mt-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {String(post.metaData.metaDescription)}
                      </p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      Read more <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <Link
        href="https://snowseo.com"
        target="_blank"
        rel="noopener"
        aria-label="Go to SnowSEO"
        className="group fixed bottom-4 right-4 z-50 inline-flex items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.18)] backdrop-blur-md transition-transform duration-200 hover:scale-[1.04] hover:shadow-[0_18px_42px_rgba(15,23,42,0.24)] dark:border-zinc-700/80 dark:bg-zinc-900/90"
      >
        <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-black/5 dark:bg-zinc-950 dark:ring-white/10">
          <Image
            src="/images/logo.png"
            alt="SnowSEO"
            width={40}
            height={40}
            className="h-full w-full object-contain p-1"
            priority={false}
          />
        </span>
      </Link>
    </div>
  );
}
