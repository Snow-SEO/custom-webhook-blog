import { type NextRequest, NextResponse } from "next/server";
import { db, webhookLogs } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [row] = await db
    .select()
    .from(webhookLogs)
    .where(eq(webhookLogs.id, id))
    .limit(1);

  if (!row) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  }

  const r = row as unknown as Record<string, unknown>;
  return NextResponse.json({
    ok: true,
    row: {
      ...r,
      receivedAt:
        r.receivedAt &&
        typeof r.receivedAt === "object" &&
        "toISOString" in r.receivedAt
          ? (r.receivedAt as Date).toISOString()
          : null,
    },
  });
}
