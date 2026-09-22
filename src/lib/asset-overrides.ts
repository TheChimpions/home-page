// Stopgap media overrides for chimps whose on-chain `uri` still points at
// storage that has gone away.
//
// The Firstborn is the only one of the 222: its metadata and art were hosted on
// Shadow Drive, which now 404s (every other chimp is on Arweave). The art has
// since been re-uploaded to Arweave, but the on-chain metadata account still
// references the dead Shadow Drive URLs, so Helius hands us URLs that resolve
// to nothing.
//
// This applies only as a *fallback* — see `resolveAssetImage` — so once the
// on-chain `uri` is updated by the update authority, the live value wins and
// this table can be deleted outright.
const DEAD_MEDIA_HOSTS = ["shdw-drive.genesysgo.net"];

const MEDIA_OVERRIDES: Record<string, string> = {
  // The Firstborn — re-upload of TheFirstBorn-katsudon_sol.gif
  A7HbvY4EadvxBMVRwpbDDxbMxTG36CrP8KQxfy9MyPjA:
    "https://arweave.net/rlZJVAADUF8enhEoFOF5L9y-dWLgJilT-jx0OCDL_FA",
};

function isDeadMedia(url: string): boolean {
  return !url || DEAD_MEDIA_HOSTS.some((host) => url.includes(host));
}

/**
 * The usable image URL for a mint: whatever the chain says, unless that points
 * at storage known to be gone and we have a recovered copy to fall back to.
 */
export function resolveAssetImage(mint: string, image: string): string {
  if (!isDeadMedia(image)) return image;
  return MEDIA_OVERRIDES[mint] ?? image;
}
