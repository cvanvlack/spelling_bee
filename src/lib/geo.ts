export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult extends Coordinates {
  label: string;
  city?: string;
  state?: string;
  country?: string;
}

interface GeocodeProgress {
  current: number;
  total: number;
  query: string;
  resolved: boolean;
}

type GeocodeCache = Record<string, GeocodeResult | null>;

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    state?: string;
    country?: string;
  };
}

const STORAGE_KEY = "member-geo-search-cache-v1";
const NETWORK_DELAY_MS = 1000;

const seedGeocodes: Record<string, GeocodeResult> = {
  "new york": {
    lat: 40.7128,
    lng: -74.006,
    label: "New York, New York, USA",
    city: "New York",
    state: "New York",
    country: "USA",
  },
  "new york new york usa": {
    lat: 40.7128,
    lng: -74.006,
    label: "New York, New York, USA",
    city: "New York",
    state: "New York",
    country: "USA",
  },
  "brooklyn new york usa": {
    lat: 40.6782,
    lng: -73.9442,
    label: "Brooklyn, New York, USA",
    city: "Brooklyn",
    state: "New York",
    country: "USA",
  },
  "queens new york usa": {
    lat: 40.7282,
    lng: -73.7949,
    label: "Queens, New York, USA",
    city: "Queens",
    state: "New York",
    country: "USA",
  },
  "jersey city new jersey usa": {
    lat: 40.7178,
    lng: -74.0431,
    label: "Jersey City, New Jersey, USA",
    city: "Jersey City",
    state: "New Jersey",
    country: "USA",
  },
  "newark new jersey usa": {
    lat: 40.7357,
    lng: -74.1724,
    label: "Newark, New Jersey, USA",
    city: "Newark",
    state: "New Jersey",
    country: "USA",
  },
  "hoboken new jersey usa": {
    lat: 40.743,
    lng: -74.0324,
    label: "Hoboken, New Jersey, USA",
    city: "Hoboken",
    state: "New Jersey",
    country: "USA",
  },
  "yonkers new york usa": {
    lat: 40.9312,
    lng: -73.8988,
    label: "Yonkers, New York, USA",
    city: "Yonkers",
    state: "New York",
    country: "USA",
  },
  "long island city new york usa": {
    lat: 40.7447,
    lng: -73.9485,
    label: "Long Island City, New York, USA",
    city: "Long Island City",
    state: "New York",
    country: "USA",
  },
  "albany new york usa": {
    lat: 42.6526,
    lng: -73.7562,
    label: "Albany, New York, USA",
    city: "Albany",
    state: "New York",
    country: "USA",
  },
  "boston massachusetts usa": {
    lat: 42.3601,
    lng: -71.0589,
    label: "Boston, Massachusetts, USA",
    city: "Boston",
    state: "Massachusetts",
    country: "USA",
  },
  "toronto ontario canada": {
    lat: 43.6532,
    lng: -79.3832,
    label: "Toronto, Ontario, Canada",
    city: "Toronto",
    state: "Ontario",
    country: "Canada",
  },
  "london england united kingdom": {
    lat: 51.5072,
    lng: -0.1276,
    label: "London, England, United Kingdom",
    city: "London",
    state: "England",
    country: "United Kingdom",
  },
};

let cacheLoaded = false;
let geocodeCache: GeocodeCache = {};
const inflightRequests = new Map<string, Promise<GeocodeResult | null>>();

function loadCache(): void {
  if (cacheLoaded || typeof window === "undefined") {
    cacheLoaded = true;
    return;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      geocodeCache = JSON.parse(raw) as GeocodeCache;
    }
  } catch {
    geocodeCache = {};
  }

  cacheLoaded = true;
}

function saveCache(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(geocodeCache));
  } catch {
    // Ignore quota and privacy-mode errors.
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function toGeocodeResult(result: NominatimResult): GeocodeResult {
  return {
    lat: Number.parseFloat(result.lat),
    lng: Number.parseFloat(result.lon),
    label: result.display_name,
    city:
      result.address?.city ??
      result.address?.town ??
      result.address?.village ??
      result.address?.hamlet,
    state: result.address?.state,
    country: result.address?.country,
  };
}

async function fetchGeocode(query: string): Promise<GeocodeResult | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`,
    {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as NominatimResult[];
  return payload[0] ? toGeocodeResult(payload[0]) : null;
}

async function resolveGeocode(
  query: string,
): Promise<{ result: GeocodeResult | null; fromCache: boolean }> {
  const key = normalizeLocationText(query);
  loadCache();

  if (!key) {
    return { result: null, fromCache: true };
  }

  if (key in geocodeCache) {
    return { result: geocodeCache[key], fromCache: true };
  }

  if (seedGeocodes[key]) {
    geocodeCache[key] = seedGeocodes[key];
    saveCache();
    return { result: seedGeocodes[key], fromCache: true };
  }

  const existing = inflightRequests.get(key);
  if (existing) {
    return { result: await existing, fromCache: true };
  }

  const request = fetchGeocode(query)
    .then((result) => {
      geocodeCache[key] = result;
      saveCache();
      return result;
    })
    .finally(() => {
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, request);

  return { result: await request, fromCache: false };
}

export function normalizeLocationText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export async function geocodePlace(query: string): Promise<GeocodeResult | null> {
  const { result } = await resolveGeocode(query);
  return result;
}

export async function geocodeMany(
  queries: string[],
  onProgress?: (progress: GeocodeProgress) => void,
): Promise<Map<string, GeocodeResult | null>> {
  const uniqueQueries = Array.from(
    new Set(
      queries
        .map((query) => query.trim())
        .filter(Boolean),
    ),
  );

  const results = new Map<string, GeocodeResult | null>();

  for (let index = 0; index < uniqueQueries.length; index += 1) {
    const query = uniqueQueries[index];
    let result: GeocodeResult | null = null;
    let fromCache = true;

    try {
      const resolved = await resolveGeocode(query);
      result = resolved.result;
      fromCache = resolved.fromCache;
    } catch {
      result = null;
    }

    results.set(query, result);
    onProgress?.({
      current: index + 1,
      total: uniqueQueries.length,
      query,
      resolved: Boolean(result),
    });

    if (!fromCache && index < uniqueQueries.length - 1) {
      await sleep(NETWORK_DELAY_MS);
    }
  }

  return results;
}

export function distanceBetweenKm(start: Coordinates, end: Coordinates): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(end.lat - start.lat);
  const dLng = toRadians(end.lng - start.lng);
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
