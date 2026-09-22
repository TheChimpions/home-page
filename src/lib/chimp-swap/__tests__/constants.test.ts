import { PublicKey } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import idl from "../idl/chimp_swap.json";
import {
  CHIMP_SWAP_PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
  findConfigPda,
  findListingPda,
  findMasterEditionPda,
  findMetadataPda,
} from "../constants";

const MINT = new PublicKey("Hm3LYizeDM8m9ifkRASKEBNpXgmsQhbVZPKoXY9dyBnr");

type IdlSeed =
  | { kind: "const"; value: number[] }
  | { kind: "account"; path: string }
  | { kind: "arg"; path: string };

function pdaSeeds(instruction: string, account: string): IdlSeed[] {
  const ix = idl.instructions.find((i) => i.name === instruction);
  const acc = ix?.accounts.find((a) => a.name === account) as
    | { pda?: { seeds: IdlSeed[] } }
    | undefined;
  if (!acc?.pda) throw new Error(`${instruction}.${account} has no pda in IDL`);
  return acc.pda.seeds;
}

const utf8 = (bytes: number[]) => Buffer.from(bytes).toString("utf8");

describe("program id", () => {
  it("defaults to the IDL address", () => {
    expect(CHIMP_SWAP_PROGRAM_ID.toBase58()).toBe(idl.address);
  });
});

describe("PDA derivations match the IDL seed spec", () => {
  it("config = [\"config\"]", () => {
    const seeds = pdaSeeds("initialize", "config");
    expect(seeds).toHaveLength(1);
    expect(seeds[0].kind).toBe("const");
    expect(utf8((seeds[0] as { value: number[] }).value)).toBe("config");
    expect(findConfigPda().toBase58()).toBe(
      PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        CHIMP_SWAP_PROGRAM_ID,
      )[0].toBase58(),
    );
  });

  it("listing = [\"listing\", mint]", () => {
    const seeds = pdaSeeds("list", "listing");
    expect(seeds).toHaveLength(2);
    expect(utf8((seeds[0] as { value: number[] }).value)).toBe("listing");
    expect(seeds[1]).toEqual({ kind: "account", path: "mint" });
    expect(findListingPda(MINT).toBase58()).toBe(
      PublicKey.findProgramAddressSync(
        [Buffer.from("listing"), MINT.toBuffer()],
        CHIMP_SWAP_PROGRAM_ID,
      )[0].toBase58(),
    );
  });

  it("listing PDAs differ per mint and are off-curve", () => {
    const other = new PublicKey("A7HbvY4EadvxBMVRwpbDDxbMxTG36CrP8KQxfy9MyPjA");
    expect(findListingPda(MINT).equals(findListingPda(other))).toBe(false);
    expect(PublicKey.isOnCurve(findListingPda(MINT).toBytes())).toBe(false);
  });

  it("metadata and master edition derive under Token Metadata", () => {
    const md = findMetadataPda(MINT);
    const ed = findMasterEditionPda(MINT);
    expect(md.toBase58()).toBe(
      PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), MINT.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID,
      )[0].toBase58(),
    );
    expect(ed.toBase58()).toBe(
      PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          MINT.toBuffer(),
          Buffer.from("edition"),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      )[0].toBase58(),
    );
    expect(md.equals(ed)).toBe(false);
  });

  it("the IDL pins Token Metadata as the seeds program for metadata PDAs", () => {
    const ix = idl.instructions.find((i) => i.name === "list")!;
    const metadata = ix.accounts.find((a) => a.name === "metadata") as {
      pda: { program: { kind: string; value: number[] } };
    };
    expect(new PublicKey(Buffer.from(metadata.pda.program.value)).toBase58()).toBe(
      TOKEN_METADATA_PROGRAM_ID.toBase58(),
    );
  });
});
