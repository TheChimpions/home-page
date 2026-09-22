import { describe, expect, it } from "vitest";
import { summarizeChimpAsset, type HeliusAsset } from "../helius-asset";

describe("summarizeChimpAsset", () => {
  it("prefers the animation url, then gif, then static image", () => {
    const base: HeliusAsset = {
      id: "m",
      content: {
        metadata: { name: "The Yeoman", image: "https://x/static.png", attributes: [] },
        files: [
          { uri: "https://x/a.png", mime: "image/png" },
          { uri: "https://x/a.gif", mime: "image/gif" },
        ],
      },
    };
    expect(summarizeChimpAsset(base).image).toBe("https://x/a.gif");
    expect(
      summarizeChimpAsset({
        ...base,
        content: { ...base.content, metadata: { ...base.content!.metadata, animation_url: "https://x/anim.gif" } },
      }).image,
    ).toBe("https://x/anim.gif");
    expect(
      summarizeChimpAsset({ ...base, content: { ...base.content, files: [] } }).image,
    ).toBe("https://x/static.png");
  });

  it("reads traits case-insensitively and joins artists", () => {
    const out = summarizeChimpAsset({
      id: "m",
      content: {
        metadata: {
          name: "The Trickster",
          attributes: [
            { trait_type: "tribe", value: "Planeswalkers" },
            { trait_type: "Artist 1", value: "@one" },
            { trait_type: "Artist 2", value: "@two" },
          ],
        },
      },
      ownership: { owner: "wallet" },
    });
    expect(out).toMatchObject({
      mint: "m",
      name: "The Trickster",
      tribe: "Planeswalkers",
      type: "1/1",
      artist: "@one, @two",
      holder: "wallet",
    });
  });

  it("falls back to the recovered Arweave art for The Firstborn", () => {
    const out = summarizeChimpAsset({
      id: "A7HbvY4EadvxBMVRwpbDDxbMxTG36CrP8KQxfy9MyPjA",
      content: {
        metadata: { name: "The Firstborn", image: "https://shdw-drive.genesysgo.net/dead.gif" },
      },
    });
    expect(out.image).toBe("https://arweave.net/rlZJVAADUF8enhEoFOF5L9y-dWLgJilT-jx0OCDL_FA");
  });

  it("defaults the name when metadata is missing", () => {
    expect(summarizeChimpAsset({ id: "m" }).name).toBe("Unknown Chimpion");
  });
});
