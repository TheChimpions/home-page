export interface ChimpListing {
  mint: string;
  name: string;
  image: string;
  price: number; 
  seller: string;
  tribe?: string;
  type?: string;
  artist?: string;
  rarityRank?: number;
  source: "magiceden" | "tensor";
}
