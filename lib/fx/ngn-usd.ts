/**
 * NGN/USD conversion using ExchangeRate-API (NGN base).
 * Rates cached in memory with TTL from FX_CACHE_TTL_SECONDS.
 */

type RatesCache = {
  ngnPerUsd: number;
  fetchedAt: number;
};

let cache: RatesCache | null = null;

const DEFAULT_NGN_PER_USD = 1600;

function getCacheTtlMs(): number {
  const sec = Number(process.env.FX_CACHE_TTL_SECONDS ?? "3600");
  if (!Number.isFinite(sec) || sec < 60) return 3600_000;
  return sec * 1000;
}

function getFallbackNgnPerUsd(): number {
  const fromEnv = Number(process.env.FX_NGN_PER_USD?.trim());
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return DEFAULT_NGN_PER_USD;
}

type ExchangeRateApiResponse = {
  base?: string;
  base_code?: string;
  rates?: Record<string, number>;
  conversion_rates?: Record<string, number>;
  result?: string;
};

function usdRateFromResponse(json: ExchangeRateApiResponse): number | null {
  if (json.result === "error") return null;
  const rates = json.rates ?? json.conversion_rates;
  const usdPerNgn = rates?.USD;
  if (usdPerNgn === undefined || !Number.isFinite(usdPerNgn) || usdPerNgn <= 0) {
    return null;
  }
  return 1 / usdPerNgn;
}

async function fetchFromUrl(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as ExchangeRateApiResponse;
    return usdRateFromResponse(json);
  } catch {
    return null;
  }
}

async function fetchNgnPerUsdFromApis(): Promise<number | null> {
  const key = process.env.EXCHANGERATE_API_KEY?.trim();

  if (key) {
    const fromKey = await fetchFromUrl(
      `https://v6.exchangerate-api.com/v6/${key}/latest/NGN`,
    );
    if (fromKey !== null) return fromKey;
  }

  return fetchFromUrl("https://open.er-api.com/v6/latest/NGN");
}

/** How many NGN (major units) equal 1 USD — e.g. ~1600. */
export async function getNgnPerUsd(): Promise<number> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < getCacheTtlMs()) {
    return cache.ngnPerUsd;
  }

  const fromApi = await fetchNgnPerUsdFromApis();
  if (fromApi !== null) {
    cache = { ngnPerUsd: fromApi, fetchedAt: now };
    return fromApi;
  }

  if (cache) {
    return cache.ngnPerUsd;
  }

  const fallback = getFallbackNgnPerUsd();
  cache = { ngnPerUsd: fallback, fetchedAt: now };
  return fallback;
}

/** Convert NGN kobo to USD cents (minor units). */
export async function convertNgnMinorToUsdMinor(ngnMinor: number): Promise<number> {
  const ngnPerUsd = await getNgnPerUsd();
  const ngnMajor = ngnMinor / 100;
  const usdMajor = ngnMajor / ngnPerUsd;
  return Math.round(usdMajor * 100);
}
