import { NextResponse } from "next/server";

// Temporary testnet result art. The contract URI can be corrected before freeze.
const IMAGE_URI = "ipfs://bafybeif42pyaluqr2l4k233dxwx2gr6smwe6qllqn5hbi4zurwqpftejxi/1.png";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const match = /^(\d+)\.json$/.exec(token);
  const tokenId = match ? Number(match[1]) : Number.NaN;

  if (!Number.isInteger(tokenId) || tokenId < 1) {
    return NextResponse.json({ error: "Fused metadata not found." }, { status: 404 });
  }

  return NextResponse.json(
    {
      name: `Munchos Fused Testnet #${tokenId}`,
      description:
        "A Munchos Genesis fusion result on Robinhood Chain Testnet. This asset is a testnet prototype; final mainnet art and traits will be deployed separately.",
      image: IMAGE_URI,
      external_url: "https://www.munchosapp.xyz/fusion",
      attributes: [
        { trait_type: "Network", value: "Robinhood Chain Testnet" },
        { trait_type: "Collection", value: "Munchos Fused Testnet" },
        { trait_type: "Fusion Result", value: true },
        { trait_type: "Testnet Token ID", value: tokenId }
      ]
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } }
  );
}
