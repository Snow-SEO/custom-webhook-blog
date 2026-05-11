"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { FloatingBackButton } from "@/components/floating-back-button";

type LogRow = {
  id: string;
  event: string;
  receivedAt: string | null;
  slug: string | null;
  preview: string;
};

export default function LogsPage() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const fetchingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async (nextCursor?: string | null) => {
    if (fetchingRef.current) {
      return;
    }
    fetchingRef.current = true;
    setLoading(true);

    const url = new URL("/api/logs", window.location.origin);
    if (nextCursor) {
      url.searchParams.set("cursor", nextCursor);
    }

    try {
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!data.ok) {
        throw new Error("Failed to fetch logs");
      }

      const newRows: LogRow[] = data.rows;
      setRows((prev) => (nextCursor ? [...prev, ...newRows] : newRows));
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch {
      setHasMore(false);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLogs(null);
  }, [fetchLogs]);

  // Infinite scroll via Intersection Observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!(el && hasMore) || fetchingRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchLogs(cursor);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, fetchLogs, hasMore]);

  return (
    <>
      <FloatingBackButton href="/" />
      <div className="mx-auto max-w-3xl py-12">
      <h1 className="text-2xl font-semibold">Webhook Logs</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Recent webhook requests received by this demo. Click a card to view the full payload.
      </p>

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <Link
            key={row.id}
            href={`/logs/${row.id}`}
            className="block rounded-md border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">
                  {row.event || "(no event)"}
                </div>
                <div className="text-xs text-zinc-500">{row.slug || "-"}</div>
              </div>
              <div className="text-xs text-zinc-400">
                {row.receivedAt ?? ""}
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              {row.preview}
              {row.preview.length > 300 ? "..." : ""}
            </div>
          </Link>
        ))}
      </div>

      {/* Sentinel + loading state */}
      <div ref={sentinelRef} className="mt-6 flex justify-center py-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        )}
        {!hasMore && rows.length > 0 && (
          <p className="text-sm text-zinc-400">No more logs</p>
        )}
        {!hasMore && rows.length === 0 && (
          <p className="text-sm text-zinc-400">No logs yet</p>
        )}
      </div>
    </div>
    </>
  );
}
