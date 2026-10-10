import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/** One side of a swap: who gave which chimp. */
export interface SwapCardParty {
  /** Matrica username, or a shortened wallet when there is none. */
  name: string;
  chimpName: string;
  /** Still image (JPEG/PNG); animated art is converted before it gets here. */
  chimpImage: string;
  tribe?: string;
}

export interface SwapCardData {
  /** Posted the listing and gave the listed chimp. */
  lister: SwapCardParty;
  /** Took the listing and gave the offered chimp. */
  taker: SwapCardParty;
  feeLamports: number;
}

export const SWAP_CARD_SIZE = { width: 1200, height: 1200 };

const PURPLE = "#B411EE";
const AQUA = "#11EEB4";
const GOLD = "#EEB411";
const INK = "13, 18, 28";

const publicFile = (...parts: string[]) =>
  readFile(path.join(process.cwd(), "public", ...parts));

let assetsPromise: Promise<{
  background: string;
  fonts: { name: string; data: Buffer; weight: 400 | 700 }[];
}> | null = null;

function loadAssets() {
  assetsPromise ??= (async () => {
    const [background, alagard, pixel, pixelBold] = await Promise.all([
      publicFile("assets", "treehouse.png"),
      publicFile("fonts", "alagard.ttf"),
      publicFile("fonts", "PixelOperator.ttf"),
      publicFile("fonts", "PixelOperator-Bold.ttf"),
    ]);
    return {
      background: `data:image/png;base64,${background.toString("base64")}`,
      fonts: [
        { name: "Alagard", data: alagard, weight: 400 as const },
        { name: "PixelOperator", data: pixel, weight: 400 as const },
        { name: "PixelOperator", data: pixelBold, weight: 700 as const },
      ],
    };
  })();
  return assetsPromise;
}

/** Chunky pixel arrow, pointing up or down. */
function PixelArrow({ color, down }: { color: string; down?: boolean }) {
  // 7x9 grid: head rows widen toward the tip, then a 3-wide shaft.
  const rows = ["...#...", "..###..", ".#####.", "#######", "..###..", "..###..", "..###..", "..###..", "..###.."];
  const grid = down ? [...rows].reverse() : rows;
  const px = 10;
  return (
    <svg width={7 * px} height={9 * px} viewBox={`0 0 ${7 * px} ${9 * px}`}>
      {grid.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === "#" ? (
            <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} fill={color} />
          ) : null,
        ),
      )}
    </svg>
  );
}

function PartyPanel({
  label,
  party,
  accent,
}: {
  label: string;
  party: SwapCardParty;
  accent: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 40,
        width: 1040,
        padding: 26,
        borderRadius: 20,
        border: `4px solid ${accent}`,
        background: `rgba(${INK}, 0.82)`,
        boxShadow: `0 0 40px ${accent}55`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
      <img
        src={party.chimpImage}
        alt={party.chimpName}
        width={260}
        height={260}
        style={{ borderRadius: 14, objectFit: "cover", border: `3px solid rgba(255,255,255,0.15)` }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: accent, letterSpacing: 2 }}>
          {label}
        </div>
        <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: GOLD }}>
          {party.name}
        </div>
        <div style={{ display: "flex", fontFamily: "Alagard", fontSize: 64, color: "white", lineHeight: 1.05 }}>
          {party.chimpName}
        </div>
        {party.tribe && (
          <div style={{ display: "flex", fontSize: 32, color: "#A4A7AE" }}>{party.tribe}</div>
        )}
      </div>
    </div>
  );
}

/** Render the swap announcement image as PNG bytes. */
export async function renderSwapCard(data: SwapCardData): Promise<Buffer> {
  const { background, fonts } = await loadAssets();
  const feeLine =
    data.feeLamports > 0
      ? `Swap fee ${(data.feeLamports / 1e9).toLocaleString("en-US", { maximumFractionDigits: 4 })} SOL`
      : "No fees";

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          fontFamily: "PixelOperator",
          color: "white",
          background: `rgb(${INK})`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
        <img
          src={background}
          alt=""
          width={SWAP_CARD_SIZE.width}
          height={SWAP_CARD_SIZE.height}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background: `linear-gradient(180deg, rgba(${INK},0.2) 0%, rgba(${INK},0.5) 35%, rgba(${INK},0.88) 100%)`,
          }}
        />

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontFamily: "Alagard",
            fontSize: 124,
            lineHeight: 1,
            backgroundImage: `linear-gradient(90deg, ${PURPLE}, ${AQUA})`,
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Grail Grove
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            padding: "8px 28px",
            borderRadius: 999,
            background: PURPLE,
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: 3,
          }}
        >
          SUCCESSFUL SWAP
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 32 }}>
          <PartyPanel label="POSTED" party={data.lister} accent={AQUA} />
          <div style={{ display: "flex", gap: 28, margin: "16px 0" }}>
            <PixelArrow color={AQUA} />
            <PixelArrow color={GOLD} down />
          </div>
          <PartyPanel label="SWAPPED IN" party={data.taker} accent={GOLD} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            marginTop: "auto",
            marginBottom: 44,
          }}
        >
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
            {`1-for-1 Chimpion swaps · ${feeLine}`}
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: GOLD }}>
            chimpions.co/grail-grove
          </div>
        </div>
      </div>
    ),
    { ...SWAP_CARD_SIZE, fonts },
  );
  return Buffer.from(await image.arrayBuffer());
}
