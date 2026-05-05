import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            My Blog
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Thoughts on web development, design, and technology.
          </p>
        </div>
      </header>

      {/* Post List */}
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="space-y-12">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <h2 className="text-2xl font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
                  {post.title}
                </h2>
                <time
                  dateTime={post.date}
                  className="mt-2 block text-sm text-zinc-500 dark:text-zinc-400"
                >
                  {formatDate(post.date)}
                </time>
                <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {post.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Read more &rarr;
                </span>
              </Link>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            No posts yet. Check back soon!
          </p>
        )}
      </main>
    </div>
  );
}
