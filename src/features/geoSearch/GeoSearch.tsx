import { useEffect, useMemo, useState } from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import {
  distanceBetweenKm,
  geocodeMany,
  geocodePlace,
  normalizeLocationText,
} from "../../lib/geo";
import type { GeocodeResult } from "../../lib/geo";
import { SAMPLE_MEMBER_CSV } from "./sampleMembers";

interface GeoSearchProps {
  onBack: () => void;
}

interface ParsedMember {
  id: string;
  name: string;
  city: string;
  province: string;
  country: string;
  locationQuery: string;
  searchableText: string;
}

interface MemberMatch extends ParsedMember {
  geocode: GeocodeResult | null;
  distanceKm: number | null;
  mentionsSearch: boolean;
  withinRadius: boolean;
}

interface SearchResults {
  query: string;
  radiusKm: number;
  center: GeocodeResult;
  members: MemberMatch[];
  resolvedCount: number;
}

interface ParsedMembersState {
  members: ParsedMember[];
  issues: string[];
}

interface SummaryStats {
  directMatches: number;
  withinRadius: number;
  nearbyOnly: number;
  directAndNearby: number;
  unresolved: number;
}

const DEFAULT_SEARCH_QUERY = "New York";
const DEFAULT_RADIUS_KM = 50;

function GeoSearch({ onBack }: GeoSearchProps) {
  const [rawMembers, setRawMembers] = useState(SAMPLE_MEMBER_CSV);
  const [searchQuery, setSearchQuery] = useState(DEFAULT_SEARCH_QUERY);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [showAllGeocoded, setShowAllGeocoded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);

  const parsedMembers = useMemo(() => parseMembers(rawMembers), [rawMembers]);

  const summaryStats = useMemo<SummaryStats | null>(() => {
    if (!results) return null;

    return {
      directMatches: results.members.filter((member) => member.mentionsSearch).length,
      withinRadius: results.members.filter((member) => member.withinRadius).length,
      nearbyOnly: results.members.filter((member) => member.withinRadius && !member.mentionsSearch)
        .length,
      directAndNearby: results.members.filter(
        (member) => member.withinRadius && member.mentionsSearch,
      ).length,
      unresolved: results.members.filter((member) => !member.geocode).length,
    };
  }, [results]);

  const displayedMembers = useMemo(() => {
    if (!results) return [];

    if (showAllGeocoded) {
      return results.members;
    }

    return results.members.filter(
      (member) => member.mentionsSearch || member.withinRadius || !member.geocode,
    );
  }, [results, showAllGeocoded]);

  const visibleMapMembers = useMemo(() => {
    if (!results) return [];

    return results.members.filter((member) => {
      if (!member.geocode) return false;
      if (showAllGeocoded) return true;
      return member.mentionsSearch || member.withinRadius;
    });
  }, [results, showAllGeocoded]);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!parsedMembers.members.length) {
      setErrorMessage("Paste at least one member row before running a geographic search.");
      setResults(null);
      return;
    }

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setErrorMessage("Enter a city, province, or country to use as the map center.");
      return;
    }

    setIsSearching(true);
    setErrorMessage("");
    setStatusMessage("Resolving search location...");

    try {
      const center = await geocodePlace(trimmedQuery);
      if (!center) {
        throw new Error(`Could not find coordinates for "${trimmedQuery}".`);
      }

      const uniqueLocations = Array.from(
        new Set(parsedMembers.members.map((member) => member.locationQuery)),
      );

      setStatusMessage(`Resolving ${uniqueLocations.length} member locations...`);

      const geocodedLocations = await geocodeMany(uniqueLocations, (progress) => {
        const outcome = progress.resolved ? "mapped" : "missing";
        setStatusMessage(
          `Resolving member ${progress.current} of ${progress.total}: ${progress.query} (${outcome})`,
        );
      });

      const normalizedQuery = normalizeLocationText(trimmedQuery);

      const members = parsedMembers.members
        .map<MemberMatch>((member) => {
          const geocode = geocodedLocations.get(member.locationQuery) ?? null;
          const distanceKm = geocode ? distanceBetweenKm(center, geocode) : null;
          const mentionsSearch = member.searchableText.includes(normalizedQuery);

          return {
            ...member,
            geocode,
            distanceKm,
            mentionsSearch,
            withinRadius: distanceKm !== null && distanceKm <= radiusKm,
          };
        })
        .sort(sortMembers);

      setResults({
        query: trimmedQuery,
        radiusKm,
        center,
        members,
        resolvedCount: members.filter((member) => member.geocode).length,
      });

      setStatusMessage(
        `Mapped ${members.filter((member) => member.geocode).length} of ${members.length} members.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to run geographic search.";
      setErrorMessage(message);
      setResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="screen geo-search">
      <div className="geo-topbar">
        <div>
          <h1>Member geographic search</h1>
          <p className="geo-subtitle">
            Paste member city, province, and country strings, then compare direct mentions
            against members who are geographically nearby.
          </p>
        </div>
        <button className="btn btn-secondary btn-small geo-back-btn" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="geo-layout">
        <section className="geo-controls">
          <div className="geo-card">
            <div className="geo-card-header">
              <div>
                <h2>1. Member location data</h2>
                <p>CSV or TSV with `name, city, province, country`.</p>
              </div>
              <button
                className="btn btn-secondary btn-small"
                type="button"
                onClick={() => setRawMembers(SAMPLE_MEMBER_CSV)}
              >
                Load sample
              </button>
            </div>

            <textarea
              className="geo-textarea"
              value={rawMembers}
              onChange={(event) => setRawMembers(event.target.value)}
              spellCheck={false}
              placeholder="name,city,province,country"
              aria-label="Member location input"
            />

            <div className="geo-pills">
              <span className="geo-pill">{parsedMembers.members.length} parsed members</span>
              {parsedMembers.issues.length > 0 && (
                <span className="geo-pill geo-pill-warning">
                  {parsedMembers.issues.length} skipped rows
                </span>
              )}
            </div>

            {parsedMembers.issues.length > 0 && (
              <details className="geo-issues">
                <summary>Review skipped rows</summary>
                <ul>
                  {parsedMembers.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          <form className="geo-card geo-form" onSubmit={handleSearch}>
            <div className="geo-card-header">
              <div>
                <h2>2. Search area</h2>
                <p>Choose a place to use as the map center.</p>
              </div>
            </div>

            <label className="geo-label">
              Search location
              <input
                className="geo-input"
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="New York"
              />
            </label>

            <label className="geo-label">
              Radius
              <div className="geo-radius-row">
                <input
                  className="geo-range"
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={radiusKm}
                  onChange={(event) => setRadiusKm(Number(event.target.value))}
                />
                <input
                  className="geo-number-input"
                  type="number"
                  min="1"
                  max="5000"
                  step="1"
                  value={radiusKm}
                  onChange={(event) => setRadiusKm(Number(event.target.value) || 0)}
                />
                <span className="geo-unit">km</span>
              </div>
            </label>

            <p className="geo-help">
              Direct matches mention the search phrase in their city, province, or country text.
              Nearby matches land inside the radius after geocoding, even if the text never says
              the place name.
            </p>

            <button
              className="btn btn-primary btn-large"
              type="submit"
              disabled={isSearching || parsedMembers.members.length === 0}
            >
              {isSearching ? "Searching..." : "Search members"}
            </button>

            {statusMessage && <p className="geo-status">{statusMessage}</p>}
            {errorMessage && <p className="geo-error">{errorMessage}</p>}

            <p className="geo-note">
              Geocoding uses OpenStreetMap search, caches results in this browser, and falls back
              to seeded demo coordinates for the sample data.
            </p>
          </form>
        </section>

        <section className="geo-results">
          <div className="geo-card">
            <div className="geo-card-header">
              <div>
                <h2>3. Search summary</h2>
                <p>
                  {results
                    ? `Centered on ${results.center.label}`
                    : "Run a search to count direct mentions and nearby members."}
                </p>
              </div>
            </div>

            {results && summaryStats ? (
              <div className="geo-summary-grid">
                <SummaryCard
                  label="Direct mentions"
                  value={summaryStats.directMatches}
                  tone="direct"
                  description={`Members whose location text says "${results.query}".`}
                />
                <SummaryCard
                  label={`Within ${results.radiusKm} km`}
                  value={summaryStats.withinRadius}
                  tone="nearby"
                  description="Members geocoded inside the search radius."
                />
                <SummaryCard
                  label="Nearby only"
                  value={summaryStats.nearbyOnly}
                  tone="highlight"
                  description="Close members who never mention the search phrase."
                />
                <SummaryCard
                  label="Unresolved"
                  value={summaryStats.unresolved}
                  tone="muted"
                  description="Rows that could not be converted to coordinates."
                />
              </div>
            ) : (
              <div className="geo-empty-state">
                Use the sample dataset or paste your own members, then search a place like
                &nbsp;<strong>New York</strong>.
              </div>
            )}
          </div>

          <div className="geo-card geo-map-card">
            <div className="geo-card-header">
              <div>
                <h2>4. Geographic map</h2>
                <p>
                  {results
                    ? `Showing ${visibleMapMembers.length} mapped members.`
                    : "Pins appear once a search has been run."}
                </p>
              </div>
              {results && (
                <label className="geo-checkbox">
                  <input
                    type="checkbox"
                    checked={showAllGeocoded}
                    onChange={(event) => setShowAllGeocoded(event.target.checked)}
                  />
                  Show all geocoded members
                </label>
              )}
            </div>

            {results ? (
              <GeoSearchMap
                center={results.center}
                radiusKm={results.radiusKm}
                members={visibleMapMembers}
              />
            ) : (
              <div className="geo-empty-map">No map markers yet.</div>
            )}
          </div>

          {results && summaryStats && (
            <div className="geo-card">
              <div className="geo-card-header">
                <div>
                  <h2>5. Matching members</h2>
                  <p>
                    Showing {displayedMembers.length} rows, with {results.resolvedCount} mapped and{" "}
                    {summaryStats.directAndNearby} both direct and nearby.
                  </p>
                </div>
              </div>

              <div className="geo-member-list">
                {displayedMembers.map((member) => (
                  <article className="geo-member-row" key={member.id}>
                    <div className="geo-member-main">
                      <div className="geo-member-name">{member.name}</div>
                      <div className="geo-member-location">
                        {[member.city, member.province, member.country].filter(Boolean).join(", ")}
                      </div>
                    </div>
                    <div className="geo-member-meta">
                      <span className={`geo-badge ${getBadgeClassName(member)}`}>
                        {getBadgeLabel(member)}
                      </span>
                      <span className="geo-distance">{formatDistance(member.distanceKm)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: number;
  description: string;
  tone: "direct" | "nearby" | "highlight" | "muted";
}) {
  return (
    <div className={`geo-summary-card geo-summary-${tone}`}>
      <div className="geo-summary-value">{value}</div>
      <div className="geo-summary-label">{label}</div>
      <p className="geo-summary-description">{description}</p>
    </div>
  );
}

function GeoSearchMap({
  center,
  radiusKm,
  members,
}: {
  center: GeocodeResult;
  radiusKm: number;
  members: MemberMatch[];
}) {
  const mapPoints = useMemo(
    () => [center, ...members.map((member) => member.geocode).filter(Boolean)] as GeocodeResult[],
    [center, members],
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={10}
      scrollWheelZoom
      className="geo-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds points={mapPoints} />
      <Circle
        center={[center.lat, center.lng]}
        radius={radiusKm * 1000}
        pathOptions={{ color: "#4f46e5", fillColor: "#4f46e5", fillOpacity: 0.08, weight: 2 }}
      />
      <CircleMarker
        center={[center.lat, center.lng]}
        radius={10}
        pathOptions={{ color: "#312e81", fillColor: "#4f46e5", fillOpacity: 1, weight: 2 }}
      >
        <Popup>
          <strong>{center.label}</strong>
          <br />
          Search center
        </Popup>
      </CircleMarker>

      {members.map((member) => {
        if (!member.geocode) return null;

        return (
          <CircleMarker
            key={member.id}
            center={[member.geocode.lat, member.geocode.lng]}
            radius={8}
            pathOptions={getMarkerStyle(member)}
          >
            <Popup>
              <strong>{member.name}</strong>
              <br />
              {[member.city, member.province, member.country].filter(Boolean).join(", ")}
              <br />
              {getBadgeLabel(member)} - {formatDistance(member.distanceKm)}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

function MapBounds({ points }: { points: GeocodeResult[] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const bounds = points.map((point) => [point.lat, point.lng] as [number, number]);

    if (bounds.length === 1) {
      map.setView(bounds[0], 11);
      return;
    }

    map.fitBounds(bounds, { padding: [36, 36] });
  }, [map, points]);

  return null;
}

function parseMembers(rawMembers: string): ParsedMembersState {
  const lines = rawMembers
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { members: [], issues: [] };
  }

  const firstColumns = splitDelimitedLine(lines[0]).map(cleanCell);
  const headerMap = getHeaderMap(firstColumns);
  const members: ParsedMember[] = [];
  const issues: string[] = [];
  const startingLineIndex = headerMap ? 1 : 0;

  for (let index = startingLineIndex; index < lines.length; index += 1) {
    const line = lines[index];
    const columns = splitDelimitedLine(line).map(cleanCell);

    let name = "";
    let city = "";
    let province = "";
    let country = "";

    if (headerMap) {
      name = headerMap.name !== undefined ? columns[headerMap.name] ?? "" : "";
      city = headerMap.city !== undefined ? columns[headerMap.city] ?? "" : "";
      province = headerMap.province !== undefined ? columns[headerMap.province] ?? "" : "";
      country = headerMap.country !== undefined ? columns[headerMap.country] ?? "" : "";
    } else if (columns.length >= 4) {
      [name, city, province, country] = columns;
    } else if (columns.length === 3) {
      [city, province, country] = columns;
    } else {
      issues.push(`Line ${index + 1}: expected 3 or 4 columns.`);
      continue;
    }

    if (!city || !country) {
      issues.push(`Line ${index + 1}: city and country are required.`);
      continue;
    }

    const resolvedName = name || `Member ${members.length + 1}`;
    const locationParts = [city, province, country].filter(Boolean);

    members.push({
      id: `${normalizeLocationText(`${resolvedName}-${members.length}`)}-${index}`,
      name: resolvedName,
      city,
      province,
      country,
      locationQuery: locationParts.join(", "),
      searchableText: normalizeLocationText([resolvedName, ...locationParts].join(" ")),
    });
  }

  return { members, issues };
}

function getHeaderMap(columns: string[]) {
  const normalizedColumns = columns.map((column) => normalizeLocationText(column));
  const name = findHeaderIndex(normalizedColumns, ["name", "member", "member name"]);
  const city = findHeaderIndex(normalizedColumns, ["city", "town"]);
  const province = findHeaderIndex(normalizedColumns, ["province", "state", "region"]);
  const country = findHeaderIndex(normalizedColumns, ["country", "nation"]);

  if (city === -1 || country === -1) {
    return null;
  }

  return {
    name: name === -1 ? undefined : name,
    city,
    province: province === -1 ? undefined : province,
    country,
  };
}

function findHeaderIndex(columns: string[], aliases: string[]): number {
  return columns.findIndex((column) => aliases.includes(column));
}

function cleanCell(value: string): string {
  const trimmed = value.trim();
  return trimmed.replace(/^"(.*)"$/, "$1").trim();
}

function splitDelimitedLine(line: string): string[] {
  if (line.includes("\t")) {
    return line.split("\t");
  }

  const cells: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells;
}

function sortMembers(left: MemberMatch, right: MemberMatch): number {
  const leftScore = getSortScore(left);
  const rightScore = getSortScore(right);

  if (leftScore !== rightScore) {
    return leftScore - rightScore;
  }

  if (left.distanceKm !== null && right.distanceKm !== null) {
    return left.distanceKm - right.distanceKm;
  }

  if (left.distanceKm !== null) return -1;
  if (right.distanceKm !== null) return 1;

  return left.name.localeCompare(right.name);
}

function getSortScore(member: MemberMatch): number {
  if (member.withinRadius && member.mentionsSearch) return 0;
  if (member.withinRadius) return 1;
  if (member.mentionsSearch) return 2;
  if (!member.geocode) return 3;
  return 4;
}

function getBadgeClassName(member: MemberMatch): string {
  if (!member.geocode) return "geo-badge-unresolved";
  if (member.withinRadius && member.mentionsSearch) return "geo-badge-direct";
  if (member.withinRadius) return "geo-badge-nearby";
  if (member.mentionsSearch) return "geo-badge-outside";
  return "geo-badge-muted";
}

function getBadgeLabel(member: MemberMatch): string {
  if (!member.geocode) return "Unresolved";
  if (member.withinRadius && member.mentionsSearch) return "Direct + nearby";
  if (member.withinRadius) return "Nearby";
  if (member.mentionsSearch) return "Direct only";
  return "Mapped only";
}

function getMarkerStyle(member: MemberMatch) {
  if (member.withinRadius && member.mentionsSearch) {
    return { color: "#15803d", fillColor: "#22c55e", fillOpacity: 0.9, weight: 2 };
  }

  if (member.withinRadius) {
    return { color: "#0369a1", fillColor: "#38bdf8", fillOpacity: 0.9, weight: 2 };
  }

  if (member.mentionsSearch) {
    return { color: "#7c3aed", fillColor: "#8b5cf6", fillOpacity: 0.85, weight: 2 };
  }

  return { color: "#6b7280", fillColor: "#9ca3af", fillOpacity: 0.75, weight: 1 };
}

function formatDistance(distanceKm: number | null): string {
  if (distanceKm === null) return "No coordinates";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  if (distanceKm >= 100) return `${distanceKm.toFixed(0)} km`;
  return `${distanceKm.toFixed(1)} km`;
}

export default GeoSearch;
