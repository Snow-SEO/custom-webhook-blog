import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
}

/**
 * Renders blog post content.
 * - Use `isHtml={true}` for raw HTML content (e.g., from webhooks)
 * - Otherwise renders as Markdown
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold",
        "prose-a:text-blue-600 dark:prose-a:text-blue-400",
        "prose-code:rounded prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800",
        "prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm",
        "prose-pre:bg-zinc-950 dark:prose-pre:bg-zinc-900 prose-pre:text-zinc-50"
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

/**
 * Renders raw HTML content directly (e.g., from webhook payloads)
 */
export function HtmlRenderer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold",
        "prose-a:text-blue-600 dark:prose-a:text-blue-400",
        "prose-code:rounded prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800",
        "prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm",
        "prose-pre:bg-zinc-950 dark:prose-pre:bg-zinc-900 prose-pre:text-zinc-50",
        className
      )}
      // biome-ignore lint: webhook HTML content is intentionally rendered
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
