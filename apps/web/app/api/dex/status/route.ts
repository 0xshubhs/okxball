import { NextResponse } from "next/server";
import { isConfigured } from "@/lib/okx/dexClient";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ configured: isConfigured() });
}
