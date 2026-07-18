import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/testnet-fusion-metadata/[token]/route";

const metadata = (token: string) =>
  GET(new Request(`https://example.test/api/testnet-fusion-metadata/${token}`), {
    params: Promise.resolve({ token })
  });

describe("testnet fusion metadata API", () => {
  it("returns a fused result document", async () => {
    const response = await metadata("1.json");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("Munchos Fused Testnet #1");
    expect(body.attributes).toContainEqual({ trait_type: "Fusion Result", value: true });
  });

  it("rejects malformed token ids", async () => {
    expect((await metadata("0.json")).status).toBe(404);
    expect((await metadata("not-a-token")).status).toBe(404);
  });
});
