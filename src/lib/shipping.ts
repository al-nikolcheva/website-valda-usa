// Copy for the "From Bulgaria to the USA" scroll story, in the real order of the process.
// `station` = which part of the 3D journey the step plays in.
export const SHIPPING_STEPS = [
  { label: "Step /01", station: "factory", title: "Manufactured in Bulgaria", body: "Made in our own two factories in Sofia and Veliko Tarnovo." },
  { label: "Step /02", station: "factory", title: "Packed and loaded", body: "Every order is packed for the crossing and loaded onto a truck to the port." },
  { label: "Step /03", station: "sea", title: "Shipped to the USA", body: "The container is loaded onto the ship and crosses the Atlantic, with full export documentation." },
  { label: "Step /04", station: "customs", title: "Customs cleared", body: "We handle US customs clearance for you, so nothing waits at the port." },
  { label: "Step /05", station: "site", title: "On your site, installed", body: "Trucked from the port to your site, from the East Coast to the West Coast, for installation. One point of contact from the factory to the final window." },
] as const;
export const SHIPPING_LABEL = "From Bulgaria to the USA";
