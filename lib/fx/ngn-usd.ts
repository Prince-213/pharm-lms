/**
 * NGN/USD conversion using ExchangeRate-API (NGN base).
 * Rates cached in memory with TTL from FX_CACHE_TTL_SECONDS.
 */

type RatesCache = {
  ngnPerUsd: number;
  fetchedAt: number;
};

let cache: RatesCache | null = null;

function getCacheTtlMs(): number {
  const sec = Number(process.env.FX_CACHE_TTL_SECONDS ?? "3600");
  if (!Number.isFinite(sec) || sec < 60) return 3600_000;
  return sec * 1000;
}

type ExchangeRateApiResponse = {
  base: string;
  rates: Record<string, number>;
};

async function fetchNgnPerUsd(): Promise<number> {
  const key = process.env.EXCHANGERATE_API_KEY?.trim();
  const url = key
    ? `https://v6.exchangerate-api.com/v6/${key}/latest/NGN`
    : "https://open.er-api.com/v6/latest/NGN";

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`Exchange rate API failed: ${res.status}`);
  }

  const json = (await res.json()) as ExchangeRateApiResponse & {
    result?: string;
  };

  if (json.result === "error" || !json.rates?.USD) {
    throw new Error("Exchange rate API returned invalid USD rate");
  }

  const usdPerNgn = json.rates.USD;
  if (!Number.isFinite(usdPerNgn) || usdPerNgn <= 0) {
    throw new Error("Invalid USD rate from exchange API");
  }

  return 1 / usdPerNgn;
}

/** How many NGN (major units) equal 1 USD — e.g. ~1600. */
export async function getNgnPerUsd(): Promise<number> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < getCacheTtlMs()) {
    return cache.ngnPerUsd;
  }

  const ngnPerUsd = await fetchNgnPerUsd();
  cache = { ngnPerUsd, fetchedAt: now };
  return ngnPerUsd;
}

/** Convert NGN kobo to USD cents (minor units). */
export async function convertNgnMinorToUsdMinor(ngnMinor: number): Promise<number> {
  const ngnPerUsd = await getNgnPerUsd();
  const ngnMajor = ngnMinor / 100;
  const usdMajor = ngnMajor / ngnPerUsd;
  return Math.round(usdMajor * 100);
}
