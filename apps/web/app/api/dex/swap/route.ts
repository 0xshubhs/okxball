import { NextRequest, NextResponse } from "next/server";
import { dexSwap, isConfigured, NATIVE_TOKEN } from "@/lib/okx/dexClient";

export const runtime = "nodejs";

/**
 * Builds an executable swap (default: OKB → a stablecoin) for the caller's
 * wallet. Returns the OKX router tx (to/value/data/gas) which the client signs
 * and broadcasts. Used to auto-convert winnings on claim.
 */
export async function GET(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { ok: false, error: "OKX DEX API keys not configured" },
      { status: 501 }
    );
  }
  const sp = req.nextUrl.searchParams;
  const userWalletAddress = sp.get("userWalletAddress");
  const toTokenAddress = sp.get("toTokenAddress");
  const amount = sp.get("amount");
  if (!userWalletAddress || !toTokenAddress || !amount) {
    return NextResponse.json(
      { ok: false, error: "amount, toTokenAddress, userWalletAddress required" },
      { status: 400 }
    );
  }
  try {
    const data = await dexSwap({
      amount,
      fromTokenAddress: sp.get("fromTokenAddress") ?? NATIVE_TOKEN,
      toTokenAddress,
      userWalletAddress,
      slippage: sp.get("slippage") ?? "0.01",
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "swap failed" },
      { status: 500 }
    );
  }
}
