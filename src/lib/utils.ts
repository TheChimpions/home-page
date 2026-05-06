import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NFTFilters } from "@/types/nft";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFilterHash(filters: NFTFilters): string {
  const parts = [];
  if (filters.tribe) parts.push(`tribe:${filters.tribe}`);
  if (filters.type) parts.push(`type:${filters.type}`);
  if (filters.search) parts.push(`search:${filters.search}`);
  return parts.join("|") || "all";
}

export function truncateAddress(address?: string | null): string {
  if (!address || address === "Unknown") return "Unknown";
  if (address.length <= 11) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
