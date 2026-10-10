import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { extractSignatures, isAuthorized } from "@/lib/grail-grove/webhook";

export const dynamic = "force-dynamic";

/**
 * Helius webhook for Grail Grove program transactions. Each signature is
 * handed to Inngest, which decodes it and announces any swaps; the event id
 * dedupes Helius redeliveries.
 */
export async function POST(request: NextRequest) {
  if (
    !isAuthorized(
      request.headers.get("authorization"),
      process.env.HELIUS_WEBHOOK_AUTH,
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const signatures = extractSignatures(payload);
  if (signatures.length > 0) {
    await inngest.send(
      signatures.map((signature) => ({
        id: `grail-grove-tx-${signature}`,
        name: "grail-grove/transaction",
        data: { signature },
      })),
    );
  }
  return NextResponse.json({ received: signatures.length });
}
