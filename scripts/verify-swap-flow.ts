/**
 * End-to-end check of a deployed Chimp Swap, driven through the *web app's own*
 * transaction builders — the same code the UI runs — against a live cluster.
 *
 *   pnpm verify-swap --rpc <url> --authority <keypair.json> --collection <pk>
 *
 * Mints two throwaway chimps into the collection (needs the collection
 * authority keypair, i.e. the devnet deployer), then walks
 * list → swap → re-list → delist and checks custody, the fee split and
 * account cleanup at each step. Uses fresh local keypairs, so no real wallet
 * is touched. Intended for localnet/devnet; it airdrops.
 */
import {
  TokenStandard,
  createV1,
  findMetadataPda,
  mintV1,
  mplTokenMetadata,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey as umiPk,
  some,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { readFileSync } from "node:fs";

import { fetchSwapConfig, fetchSwapListingsByOwner } from "../src/lib/chimp-swap/accounts";
import {
  buildDelistTransaction,
  buildListTransaction,
  buildSwapTransaction,
} from "../src/lib/chimp-swap/instructions";
import { splitFee } from "../src/lib/chimp-swap/fee";

const argv = process.argv.slice(2);
const flags = new Map<string, string>();
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const next = argv[i + 1];
  if (next !== undefined && !next.startsWith("--")) {
    flags.set(argv[i].slice(2), next);
    i++;
  } else {
    flags.set(argv[i].slice(2), "true");
  }
}
const need = (name: string): string => {
  const v = flags.get(name);
  if (!v) {
    console.error(`missing --${name}\n\nusage: pnpm verify-swap --rpc <url> --authority <keypair.json> --collection <pk>`);
    process.exit(1);
  }
  return v;
};

const rpcUrl = flags.get("rpc") ?? "http://127.0.0.1:8899";
const connection = new Connection(rpcUrl, "confirmed");

function loadKeypair(path: string): Keypair {
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(path, "utf8"))));
}

async function airdrop(who: PublicKey, sol: number): Promise<void> {
  const sig = await connection.requestAirdrop(who, Math.ceil(sol * LAMPORTS_PER_SOL));
  const latest = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");
}

/** Sign a builder-produced transaction with a local keypair and confirm it. */
async function send(tx: Transaction, signer: Keypair): Promise<string> {
  const latest = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = latest.blockhash;
  tx.feePayer = tx.feePayer ?? signer.publicKey;
  tx.sign(signer);
  const sig = await connection.sendRawTransaction(tx.serialize(), {
    preflightCommitment: "confirmed",
  });
  const res = await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");
  if (res.value.err) throw new Error(`${sig} failed: ${JSON.stringify(res.value.err)}`);
  return sig;
}

let failures = 0;
function check(label: string, ok: boolean, detail = ""): void {
  if (!ok) failures++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  const authority = loadKeypair(need("authority"));
  const collection = new PublicKey(need("collection"));
  const config = await fetchSwapConfig(connection);
  if (!config) throw new Error(`Swap config is not initialized on ${rpcUrl}`);

  console.log(`rpc        ${rpcUrl.replace(/api-key=[^&]+/, "api-key=***")}`);
  console.log(`collection ${collection.toBase58()}`);
  console.log(
    `fee        ${Number(config.swapFeeLamports) / LAMPORTS_PER_SOL} SOL, treasury ${config.treasuryBps} bps, paused=${config.paused}\n`,
  );
  if (!config.collection || config.collection !== collection.toBase58()) {
    throw new Error(`config collection is ${config.collection}, not ${collection.toBase58()}`);
  }

  const lister = Keypair.generate();
  const taker = Keypair.generate();
  for (const kp of [lister, taker]) await airdrop(kp.publicKey, 1);

  const umi = createUmi(rpcUrl).use(mplTokenMetadata());
  umi.use(keypairIdentity(umi.eddsa.createKeypairFromSecretKey(authority.secretKey)));

  async function mintChimp(owner: PublicKey, name: string): Promise<PublicKey> {
    const mint = generateSigner(umi);
    await createV1(umi, {
      mint,
      authority: umi.identity,
      payer: umi.identity,
      name,
      symbol: "CHIMP",
      uri: "https://arweave.net/Ss0Bf84U7mx-Xi_Udh_5YIHBZoXM-ZlQTbaI6ewIbp0",
      sellerFeeBasisPoints: percentAmount(5, 2),
      tokenStandard: TokenStandard.NonFungible,
      collection: some({ key: umiPk(collection.toBase58()), verified: false }),
    })
      .add(
        mintV1(umi, {
          mint: mint.publicKey,
          authority: umi.identity,
          amount: 1,
          tokenOwner: umiPk(owner.toBase58()),
          tokenStandard: TokenStandard.NonFungible,
        }),
      )
      .sendAndConfirm(umi);

    const [metadata] = findMetadataPda(umi, { mint: mint.publicKey });
    await verifyCollectionV1(umi, {
      metadata,
      collectionMint: umiPk(collection.toBase58()),
      authority: umi.identity,
    }).sendAndConfirm(umi);
    return new PublicKey(mint.publicKey.toString());
  }

  const listedMint = await mintChimp(lister.publicKey, "Verify Listed");
  const offeredMint = await mintChimp(taker.publicKey, "Verify Offered");
  console.log(`listed  ${listedMint.toBase58()} held by lister ${lister.publicKey.toBase58()}`);
  console.log(`offered ${offeredMint.toBase58()} held by taker  ${taker.publicKey.toBase58()}\n`);

  console.log("list");
  await send(await buildListTransaction(connection, lister.publicKey, listedMint), lister);
  const listerAta = getAssociatedTokenAddressSync(listedMint, lister.publicKey);
  const afterList = await getAccount(connection, listerAta);
  check("NFT stays in the lister's wallet", afterList.owner.equals(lister.publicKey) && afterList.amount === BigInt(1));
  check("NFT is frozen while listed", afterList.isFrozen);
  const mine = await fetchSwapListingsByOwner(connection, lister.publicKey);
  const listing = mine.find((l) => l.mint === listedMint.toBase58());
  check("listing is readable by its owner", !!listing);
  if (!listing) throw new Error("listing not found; cannot continue");

  console.log("swap");
  const treasury = new PublicKey(config.treasury);
  const beforeTreasury = await connection.getBalance(treasury);
  const beforeLister = await connection.getBalance(lister.publicKey);
  await send(
    await buildSwapTransaction(
      connection,
      taker.publicKey,
      listing,
      offeredMint,
      treasury,
      config.swapFeeLamports,
    ),
    taker,
  );
  const expected = splitFee(config.swapFeeLamports, config.treasuryBps);
  const treasuryDelta = (await connection.getBalance(treasury)) - beforeTreasury;
  const listerDelta = (await connection.getBalance(lister.publicKey)) - beforeLister;
  check("treasury received exactly its share", treasuryDelta === Number(expected.treasury), `${treasuryDelta} lamports`);
  check(
    "lister received its share plus the listing rent",
    listerDelta >= Number(expected.lister),
    `${listerDelta} lamports, fee share ${expected.lister}`,
  );
  const takerGot = await getAccount(connection, getAssociatedTokenAddressSync(listedMint, taker.publicKey));
  check("taker holds the listed chimp, unfrozen", takerGot.amount === BigInt(1) && !takerGot.isFrozen);
  const listerGot = await getAccount(connection, getAssociatedTokenAddressSync(offeredMint, lister.publicKey));
  check("lister holds the offered chimp", listerGot.amount === BigInt(1));
  check("listing account is closed", (await connection.getAccountInfo(new PublicKey(listing.address))) === null);

  console.log("re-list and delist");
  await send(await buildListTransaction(connection, taker.publicKey, listedMint), taker);
  const relisted = (await fetchSwapListingsByOwner(connection, taker.publicKey)).find(
    (l) => l.mint === listedMint.toBase58(),
  );
  check("new owner can list the chimp they just received", !!relisted);
  if (!relisted) throw new Error("re-listing not found; cannot continue");
  await send(await buildDelistTransaction(connection, taker.publicKey, relisted), taker);
  const afterDelist = await getAccount(connection, getAssociatedTokenAddressSync(listedMint, taker.publicKey));
  check("delist thaws the NFT", !afterDelist.isFrozen);
  check("delist clears the delegate", afterDelist.delegate === null);
  check("listing closed after delist", (await connection.getAccountInfo(new PublicKey(relisted.address))) === null);

  console.log(failures === 0 ? "\nAll checks passed" : `\n${failures} check(s) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
