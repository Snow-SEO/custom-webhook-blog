import { JsonViewerDisplay } from "@/components/json-viewer";
import type { SnowSEOWebhookPayload } from "@/lib/webhook/types";

export function WebhookPayloadViewer({
  payload,
}: {
  payload: SnowSEOWebhookPayload;
}) {
  return (
    <section className="mt-14 rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Webhook Payload (JSON)
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        This is the SnowSEO webhook payload used to render this page.
      </p>

      <details className="group mt-4">
        <summary className="cursor-pointer list-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900">
          <span className="group-open:hidden">Show payload</span>
          <span className="hidden group-open:inline">Hide payload</span>
        </summary>

        <div className="mt-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-950 dark:border-zinc-700">
          <JsonViewerDisplay
            data={payload}
            className="max-h-72 overflow-auto"
          />
        </div>
      </details>
    </section>
  );
}
