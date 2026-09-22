// The Chimpions on-chain identity. Membership is defined by the verified
// Metaplex collection, not by a shared verified creator: The Firstborn was
// minted under a different creator pair and only shows up in the collection
// group, so any creator-based query silently drops it.
export const COLLECTION_ADDRESS =
  process.env.NEXT_PUBLIC_COLLECTION_ADDRESS ||
  "2k8iNEAB6EK8TyK2KtFdPzWp9tmW7dHpDbBhT6hPNMD8";

interface AssetGrouping {
  group_key?: string;
  group_value?: string;
}

/** True when a Helius asset belongs to the verified Chimpions collection. */
export function isChimpionAsset(asset: {
  grouping?: AssetGrouping[];
}): boolean {
  return (
    asset.grouping?.some(
      (g) =>
        g.group_key === "collection" && g.group_value === COLLECTION_ADDRESS,
    ) ?? false
  );
}
