import { db, webhookLogs } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { JsonViewerDisplay } from "@/components/json-viewer";
import { WebhookPayloadViewer } from "@/app/blog/[slug]/webhook-payload-viewer";

export default async function LogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(webhookLogs)
    .where(eq(webhookLogs.id, id))
    .limit(1);

  if (!row) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <h1 className="text-2xl font-semibold">Log not found</h1>
        <Link href="/logs" className="text-sm text-zinc-500">
          Back to logs
        </Link>
      </div>
    );
  }

  const r = row as unknown as Record<string, unknown>;
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = r.payload ? JSON.parse(String(r.payload)) : null;
  } catch {
    parsed = null;
  }

  let headersObj: Record<string, unknown> = {};
  try {
    headersObj = r.headers ? JSON.parse(String(r.headers)) : {};
  } catch {
    headersObj = {};
  }

  return (
    <div className="mx-auto max-w-3xl py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Webhook Log</h1>
        <Link href="/logs" className="text-sm text-zinc-500">
          Back
        </Link>
      </div>

      <div className="mt-4 space-y-6">
        <div className="rounded-md border p-4">
          <div className="text-sm text-zinc-600">Event</div>
          <div className="font-medium">{String(r.event ?? "")}</div>
          <div className="mt-2 text-xs text-zinc-500">
            Received:{" "}
            {r.receivedAt &&
            typeof r.receivedAt === "object" &&
            "toISOString" in r.receivedAt
              ? (r.receivedAt as Date).toISOString()
              : String(r.receivedAt ?? "")}
          </div>
        </div>

        <div className="rounded-md border p-4">
          <h2 className="text-sm font-medium">Headers (masked)</h2>
          <div className="mt-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-950 dark:border-zinc-700">
            <JsonViewerDisplay
              data={headersObj}
              className="max-h-48 overflow-auto"
            />
          </div>
        </div>

        {parsed &&
        typeof parsed === "object" &&
        "event" in parsed &&
        "timestamp" in parsed ? (
          <WebhookPayloadViewer
            payload={
              parsed as unknown as import("@/lib/webhook/types").SnowSEOWebhookPayload
            }
          />
        ) : (
          <div className="rounded-md border p-4">
            <h2 className="text-sm font-medium">Payload</h2>
            <pre className="mt-2 max-h-72 overflow-auto text-xs">
              {String(r.payload ?? "")}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
