import { ChimpionMetadata } from '@/types/nft';

const CACHE_NAME = 'chimpions-nft-cache';
const CACHE_VERSION = 'v2-real-blockchain';
const CACHE_DURATION = 24 * 60 * 60 * 1000; 

interface CacheEntry {
  data: ChimpionMetadata[];
  timestamp: number;
  version: string;
}

export class NFTCache {
  private static getKey(page: number, filters?: string): string {
    return `${CACHE_NAME}-${filters || 'all'}-page-${page}`;
  }

  static set(
    page: number,
    data: ChimpionMetadata[],
    filters?: string
  ): void {
    if (typeof window === 'undefined') return;

    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(this.getKey(page, filters), JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to cache NFT data:', error);
    }
  }

  static get(page: number, filters?: string): ChimpionMetadata[] | null {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(this.getKey(page, filters));
      if (!cached) return null;

      const entry: CacheEntry = JSON.parse(cached);

      if (
        entry.version !== CACHE_VERSION ||
        Date.now() - entry.timestamp > CACHE_DURATION
      ) {
        this.clear(page, filters);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to read NFT cache:', error);
      return null;
    }
  }

  static clear(page?: number, filters?: string): void {
    if (typeof window === 'undefined') return;

    try {
      if (page !== undefined) {
        localStorage.removeItem(this.getKey(page, filters));
      } else {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(CACHE_NAME)) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to clear NFT cache:', error);
    }
  }

  static clearAll(): void {
    this.clear();
  }
}
