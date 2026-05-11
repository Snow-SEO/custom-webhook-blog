import { NextResponse } from "next/server";
import { db, webhookLogs } from "@/lib/db";
import { desc, lt, or, and, eq } from "drizzle-orm";

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  const base = db
    .select()
    .from(webhookLogs)
    .orderBy(desc(webhookLogs.receivedAt), desc(webhookLogs.id))
    .limit(PAGE_SIZE);

  const rows = cursor
    ? await base.where(
        or(
          lt(webhookLogs.receivedAt, new Date(cursor.split("|")[0])),
          and(
            eq(webhookLogs.receivedAt, new Date(cursor.split("|")[0])),
            lt(webhookLogs.id, cursor.split("|")[1])
          )
        )
      )
    : await base;

  const formatted = rows.map((r) => {
    const row = r as unknown as Record<string, unknown>;
    return {
      id: String(row.id),
      event: String(row.event ?? ""),
      receivedAt:
        row.receivedAt &&
        typeof row.receivedAt === "object" &&
        "toISOString" in row.receivedAt
          ? (row.receivedAt as Date).toISOString()
          : null,
      slug: row.slug ? String(row.slug) : null,
      preview: String(row.payload ?? "").slice(0, 300),
    };
  });

  const lastRow = formatted.at(-1);
  const nextCursor =
    formatted.length === PAGE_SIZE && lastRow?.receivedAt
      ? `${lastRow.receivedAt}|${lastRow.id}`
      : null;

  return NextResponse.json({ ok: true, rows: formatted, nextCursor });
}
