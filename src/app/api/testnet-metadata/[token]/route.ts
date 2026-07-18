import { NextResponse } from "next/server";

const MAX_SUPPLY = 4444;
const SOURCE_ART_SUPPLY = 5;
const IMAGE_BASE_URI = "ipfs://bafybeif42pyaluqr2l4k233dxwx2gr6smwe6qllqn5hbi4zurwqpftejxi/";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const match = /^(\d+)\.json$/.exec(token);
  const tokenId = match ? Number(match[1]) : Number.NaN;

  if (!Number.isInteger(tokenId) || tokenId < 1 || tokenId > MAX_SUPPLY) {
    return NextResponse.json({ error: "Token metadata not found." }, { status: 404 });
  }

  const sourceArtId = ((tokenId - 1) % SOURCE_ART_SUPPLY) + 1;

  return NextResponse.json(
    {
      name: `Muncho #${tokenId}`,
      description:
        "Munchos Genesis testnet concept artwork. Final mainnet artwork and traits are deployed separately.",
      image: `${IMAGE_BASE_URI}${sourceArtId}.png`,
      external_url: "https://www.munchosapp.xyz",
      attributes: [
        { trait_type: "Network", value: "Robinhood Chain Testnet" },
        { trait_type: "Testnet Concept", value: sourceArtId },
        { trait_type: "Testnet Token ID", value: tokenId }
      ]
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400"
      }
    }
  );
}
