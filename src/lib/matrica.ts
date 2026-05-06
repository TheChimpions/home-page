import { unstable_cache } from "next/cache";

const MATRICA_API_KEY = process.env.MATRICA_API_KEY;
const MATRICA_BASE = "https://api.matrica.io/v1";
const REVALIDATE_SECONDS = 7 * 24 * 60 * 60;

export interface MatricaProfile {
  id?: string;
  user?: {
    id?: string;
    username?: string;
    profile?: {
      about?: string;
      pfp?: string;
      banner?: string;
    };
  };
  network?: { symbol?: string; name?: string };
}

let loggedFirstHit = false;
let warnedNoApiKey = false;

async function fetchProfile(wallet: string): Promise<MatricaProfile | null> {
  if (!MATRICA_API_KEY) {
    if (!warnedNoApiKey) {
      console.warn("MATRICA_API_KEY is not set; skipping Matrica lookups");
      warnedNoApiKey = true;
    }
    return null;
  }
  try {
    const res = await fetch(
      `${MATRICA_BASE}/wallet/${encodeURIComponent(wallet)}?apiKey=${MATRICA_API_KEY}`,
    );
    if (res.status === 400 || res.status === 404) return null;
    if (!res.ok) {
      console.warn(`Matrica lookup failed for ${wallet}: ${res.status}`);
      return null;
    }
    const data = (await res.json()) as MatricaProfile;
    if (!loggedFirstHit) {
      console.log(
        "Matrica /v1/wallet first response sample:",
        JSON.stringify(data, null, 2),
      );
      loggedFirstHit = true;
    }
    return data;
  } catch (err) {
    console.warn(`Matrica lookup error for ${wallet}:`, err);
    return null;
  }
}

export const getMatricaProfileByWallet = unstable_cache(
  fetchProfile,
  ["matrica-wallet-profile-v1"],
  { revalidate: REVALIDATE_SECONDS, tags: ["matrica-profile"] },
);

export function getMatricaDisplayName(
  profile: MatricaProfile | null,
): string | null {
  return profile?.user?.username || null;
}

export function getMatricaTwitterHandle(
  profile: MatricaProfile | null,
): string | null {
  const about = profile?.user?.profile?.about;
  if (!about) return null;
  const match = about.match(/Twitter:\s*@?([A-Za-z0-9_]+)/i);
  return match ? match[1] : null;
}

export function getMatricaPfp(
  profile: MatricaProfile | null,
): string | null {
  return profile?.user?.profile?.pfp || null;
}
