import { NextResponse } from "next/server";

const IMAGE_BASE_URI = "ipfs://bafybeif42pyaluqr2l4k233dxwx2gr6smwe6qllqn5hbi4zurwqpftejxi/";

type RouteContext = { params: Promise<{ tier: string; token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { tier, token } = await context.params;
  const tokenId = Number(token.replace(/\.json$/, ""));
  if (!Number.isInteger(tokenId) || tokenId < 1 || !["og", "legendary"].includes(tier)) {
    return NextResponse.json({ error: "Fused metadata not found." }, { status: 404 });
  }
  const legendary = tier === "legendary";
  return NextResponse.json(
    {
      name: `Munchos ${legendary ? "Legendary" : "OG"} #${tokenId}`,
      description:
        "A Munchos Genesis catalyst fusion result on Robinhood Chain Testnet. Final mainnet artwork and traits will be deployed separately.",
      image: `${IMAGE_BASE_URI}${legendary ? 5 : 4}.png`,
      external_url: "https://www.munchosapp.xyz/fusion",
      attributes: [
        { trait_type: "Network", value: "Robinhood Chain Testnet" },
        { trait_type: "Fusion Tier", value: legendary ? "Legendary" : "OG" },
        { trait_type: "Catalysts Used", value: legendary ? 2 : 1 },
        { trait_type: "Testnet Token ID", value: tokenId }
      ]
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } }
  );
}
