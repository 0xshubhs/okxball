import { NextRequest, NextResponse } from "next/server";
import { dexQuote, isConfigured, NATIVE_TOKEN } from "@/lib/okx/dexClient";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { ok: false, error: "OKX DEX API keys not configured" },
      { status: 501 }
    );
  }
  const sp = req.nextUrl.searchParams;
  try {
    const data = await dexQuote({
      amount: sp.get("amount") ?? "",
      fromTokenAddress: sp.get("fromTokenAddress") ?? NATIVE_TOKEN,
      toTokenAddress: sp.get("toTokenAddress") ?? "",
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "quote failed" },
      { status: 500 }
    );
  }
}
