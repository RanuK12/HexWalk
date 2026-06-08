// Earth radius in meters
const EARTH_RADIUS = 6378137;

// Default size of hexagon radius in meters
export const DEFAULT_HEX_RADIUS = 35;

/**
 * Projects a latitude and longitude (WGS84) to Web Mercator (EPSG:3857) x/y coordinates in meters.
 */
export function latLngToMercator(lat: number, lng: number): { x: number; y: number } {
  const x = EARTH_RADIUS * lng * (Math.PI / 180);
  const y = EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return { x, y };
}

/**
 * Projects Web Mercator (EPSG:3857) x/y coordinates back to latitude and longitude (WGS84).
 */
export function mercatorToLatLng(x: number, y: number): { latitude: number; longitude: number } {
  const longitude = (x / EARTH_RADIUS) * (180 / Math.PI);
  const latitude = (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * (180 / Math.PI);
  return { latitude, longitude };
}

/**
 * Converts a latitude/longitude coordinate to integer axial hexagon coordinates (q, r).
 * Uses Web Mercator projection to ensure physical size is constant.
 */
export function getHexAxial(
  lat: number,
  lng: number,
  sizeMeters: number = DEFAULT_HEX_RADIUS
): { q: number; r: number } {
  const { x, y } = latLngToMercator(lat, lng);

  // For pointy-topped hexagons:
  // q = (sqrt(3)/3 * x - 1/3 * y) / size
  // r = (2/3 * y) / size
  const qFraction = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / sizeMeters;
  const rFraction = ((2 / 3) * y) / sizeMeters;

  // Round to nearest hex
  return hexRound(qFraction, rFraction);
}

/**
 * Generates a unique string ID for a hexagon based on its axial coordinates.
 */
export function getHexId(lat: number, lng: number, sizeMeters: number = DEFAULT_HEX_RADIUS): string {
  const { q, r } = getHexAxial(lat, lng, sizeMeters);
  return `${q}_${r}`;
}

/**
 * Rounds fractional axial coordinates (q, r) to the nearest integer hex axial coordinates.
 */
function hexRound(q: number, r: number): { q: number; r: number } {
  const s = -q - r;

  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);

  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);

  if (dq > dr && dq > ds) {
    rq = -rr - rs;
  } else if (dr > ds) {
    rr = -rq - rs;
  }

  return { q: rq, r: rr };
}

/**
 * Computes the center coordinate (latitude, longitude) of a hexagon given its axial coordinates.
 */
export function getHexCenter(
  q: number,
  r: number,
  sizeMeters: number = DEFAULT_HEX_RADIUS
): { latitude: number; longitude: number } {
  // Center coordinates in Web Mercator meters
  const x = sizeMeters * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = sizeMeters * ((3 / 2) * r);

  return mercatorToLatLng(x, y);
}

/**
 * Generates the 6 corner coordinates of a pointy-topped hexagon in WGS84 (latitude, longitude).
 * Vertices are returned in clockwise order.
 */
export function getHexPolygon(
  q: number,
  r: number,
  sizeMeters: number = DEFAULT_HEX_RADIUS
): { latitude: number; longitude: number }[] {
  // Center in Web Mercator meters
  const cx = sizeMeters * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const cy = sizeMeters * ((3 / 2) * r);

  const polygon: { latitude: number; longitude: number }[] = [];

  for (let i = 0; i < 6; i++) {
    // Pointy-topped hex angles: 30, 90, 150, 210, 270, 330 degrees
    const angleRad = (Math.PI / 180) * (60 * i + 30);
    const vx = cx + sizeMeters * Math.cos(angleRad);
    const vy = cy + sizeMeters * Math.sin(angleRad);
    polygon.push(mercatorToLatLng(vx, vy));
  }

  return polygon;
}

/**
 * Computes the distance in meters between two geographical points using the Haversine formula.
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

/**
 * Returns a list of hex IDs that represent a ring around a center hex at a given grid distance.
 */
export function getHexRing(qCenter: number, rCenter: number, radius: number): { q: number; r: number }[] {
  const hexes: { q: number; r: number }[] = [];
  
  // Directions around a hex in axial coordinates
  const dirs = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
  ];

  // Start at the hex radius steps away in direction 4 (South-West)
  let q = qCenter + dirs[4].q * radius;
  let r = rCenter + dirs[4].r * radius;

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      hexes.push({ q, r });
      q += dirs[i].q;
      r += dirs[i].r;
    }
  }

  return hexes;
}

/**
 * Returns a list of all hexes within a given grid distance (inclusive) of a center hex.
 */
export function getHexesInRange(qCenter: number, rCenter: number, maxRange: number): { q: number; r: number }[] {
  const hexes: { q: number; r: number }[] = [{ q: qCenter, r: rCenter }];
  for (let rDist = 1; rDist <= maxRange; rDist++) {
    hexes.push(...getHexRing(qCenter, rCenter, rDist));
  }
  return hexes;
}
