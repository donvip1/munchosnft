import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/testnet-catalyst-metadata/[tier]/[token]/route";

const metadata = (tier: string, token: string) =>
  GET(new Request(`https://example.test/api/testnet-catalyst-metadata/${tier}/${token}`), {
    params: Promise.resolve({ tier, token })
  });

describe("catalyst fusion metadata", () => {
  it("names OG and Legendary results separately", async () => {
    const og = await (await metadata("og", "1.json")).json();
    const legendary = await (await metadata("legendary", "2.json")).json();
    expect(og.name).toBe("Munchos OG #1");
    expect(og.attributes).toContainEqual({ trait_type: "Catalysts Used", value: 1 });
    expect(legendary.name).toBe("Munchos Legendary #2");
    expect(legendary.attributes).toContainEqual({ trait_type: "Catalysts Used", value: 2 });
  });

  it("rejects invalid tiers and token ids", async () => {
    expect((await metadata("bad", "1.json")).status).toBe(404);
    expect((await metadata("og", "0.json")).status).toBe(404);
  });
});
