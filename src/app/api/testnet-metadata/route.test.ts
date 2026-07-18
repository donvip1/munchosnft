import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/testnet-metadata/[token]/route";

async function metadata(token: string) {
  return GET(new Request(`https://example.test/api/testnet-metadata/${token}`), {
    params: Promise.resolve({ token })
  });
}

describe("testnet metadata API", () => {
  it("covers the first, cycled, and final token ids", async () => {
    const one = await (await metadata("1.json")).json();
    const four = await (await metadata("4.json")).json();
    const last = await (await metadata("4444.json")).json();

    expect(one.image).toMatch(/\/1\.png$/);
    expect(four.image).toMatch(/\/1\.png$/);
    expect(last.image).toMatch(/\/1\.png$/);
    expect(last.name).toBe("Munchos Genesis #4444");
    expect(last.attributes).toContainEqual({ trait_type: "Testnet Token ID", value: 4444 });
  });

  it("rejects ids outside the contract supply", async () => {
    expect((await metadata("0.json")).status).toBe(404);
    expect((await metadata("4445.json")).status).toBe(404);
    expect((await metadata("not-a-token")).status).toBe(404);
  });
});
