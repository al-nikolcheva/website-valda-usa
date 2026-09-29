// Map/globe locations: VALDA factories and project cities (edit here).
export type Place = { name: string; lat: number; lng: number };

export const FACTORIES: Place[] = [
  { name: "Sofia", lat: 42.6977, lng: 23.3219 },
  { name: "Veliko Tarnovo", lat: 43.0757, lng: 25.6172 },
];

export const PROJECT_CITIES: Place[] = [
  { name: "Milwaukee", lat: 43.0389, lng: -87.9065 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298 },
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "Austin", lat: 30.2672, lng: -97.7431 },
  { name: "Cospicua, Malta", lat: 35.8826, lng: 14.5222 },
];

// Visual sea route for the scroll-driven shipping globe (illustrative, not an exact shipping lane).
export const SHIP_ROUTE: [number, number][] = [
  [42.7, 23.32], // Sofia
  [40.3, 23.6],
  [37.2, 24.6], // Aegean
  [36.4, 15.2], // central Mediterranean
  [37.9, 8.2],
  [36.0, -5.6], // Gibraltar
  [36.6, -25.0],
  [39.0, -50.0], // mid-Atlantic
  [40.5, -73.8], // New York
];

// Where we deliver in the USA (shown on the journey's USA map). `coast` groups the arrival routes.
export type Destination = Place & { region: string; coast: "east" | "gulf" | "west" | "inland" };
export const US_DESTINATIONS: Destination[] = [
  { name: "New York", region: "NY", lat: 40.7128, lng: -74.006, coast: "east" },
  { name: "New Jersey", region: "NJ", lat: 40.7357, lng: -74.1724, coast: "east" },
  { name: "Miami", region: "FL", lat: 25.7617, lng: -80.1918, coast: "east" },
  { name: "Mobile", region: "AL", lat: 30.6954, lng: -88.0399, coast: "gulf" },
  { name: "Houston", region: "TX", lat: 29.7604, lng: -95.3698, coast: "gulf" },
  { name: "Los Angeles", region: "CA", lat: 34.0522, lng: -118.2437, coast: "west" },
  { name: "Chicago", region: "IL", lat: 41.8781, lng: -87.6298, coast: "inland" },
];
