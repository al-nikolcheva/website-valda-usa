// Copy + layout for the interactive factory (edit copy here).
// Modelled on the Sofia factory (public/models/valda-dolni-bogorov.obj). Hall-local metres: x 0–83.76 along
// the hall (west → east), z 0–24.18 across it (north wall → south wall with the 12 loading shutters).
// The process flows west → east: goods in at the western doors, shipping out of the eastern doors.
// The northern extension (offices) sits at x 29.34–54.18, z −10.61 to −0.12.

export interface Role {
  title: string;
  body: string;
}

export interface Zone {
  id: "goods" | "pvc" | "aluminum" | "coating" | "glass" | "glazing" | "packing" | "offices";
  chip: string;
  title: string;
  body: string;
  /** floor pad [x0, z0, x1, z1] in hall-local metres */
  rect: [number, number, number, number];
  floorY: number;
  /** focus box height above the floor */
  top: number;
  /** soft floor tint */
  tint: number;
  roles?: Role[];
}

export const FACTORY_COPY = {
  label: "Inside the factory",
  heading: "Everything made under our own roof.",
  intro: "Explore our factories in Sofia and Veliko Tarnovo. Tap a point to see what happens there.",
  caption: "Modelled on our factory in Sofia.",
  play: "Follow two windows",
};

/** upper office floor in the northern extension */
export const MEZZ_Y = 2.55;
/** the pads leave a forklift aisle along the south wall */
const PZ0 = 1.2;
const PZ1 = 19.6;

export const ZONES: Zone[] = [
  {
    id: "goods",
    chip: "Goods in",
    title: "Goods in & storage",
    body: "Aluminum and PVC profiles and large glass sheets arrive by truck, are unloaded and stored on racks.",
    rect: [0.6, PZ0, 11.6, PZ1],
    floorY: 0,
    top: 5.5,
    tint: 0xeceff2,
  },
  {
    id: "pvc",
    chip: "PVC",
    title: "PVC production",
    body: "Profiles are foiled if they have a colour, cut to size, welded at the corners and cleaned: a PVC window takes shape, ready for glass.",
    rect: [12.2, PZ0, 27.2, PZ1],
    floorY: 0,
    top: 3.5,
    tint: 0xf2f1ed,
  },
  {
    id: "aluminum",
    chip: "Aluminum",
    title: "Aluminum production",
    body: "Aluminum profiles are cut, machined and corner-crimped: an aluminum window takes shape.",
    rect: [27.8, PZ0, 39.2, PZ1],
    floorY: 0,
    top: 3.5,
    tint: 0xecf0f3,
  },
  {
    id: "coating",
    chip: "Coating",
    title: "Coating",
    body: "The aluminum frame is painted on our own coating line, in any RAL colour.",
    rect: [39.8, PZ0, 50.8, PZ1],
    floorY: 0,
    top: 5.5,
    tint: 0xf2f0ef,
  },
  {
    id: "glass",
    chip: "Glass units",
    title: "Glass units",
    body: "Big glass sheets are cut to size, then assembled and pressed into insulated glass units on a fully automatic LISEC line, one for each window.",
    rect: [51.4, PZ0, 62.6, PZ1],
    floorY: 0,
    top: 3.5,
    tint: 0xeaf0f5,
  },
  {
    id: "glazing",
    chip: "Glazing",
    title: "Glazing & assembly",
    body: "The PVC and aluminum windows meet here: each gets its glass unit, and every window is checked.",
    rect: [63.2, PZ0, 69.8, PZ1],
    floorY: 0,
    top: 3,
    tint: 0xf1f1ee,
  },
  {
    id: "packing",
    chip: "Packing",
    title: "Packing & shipping",
    body: "Finished windows are wrapped, loaded onto racks and shipped by truck.",
    rect: [70.4, PZ0, 83.2, PZ1],
    floorY: 0,
    top: 3.5,
    tint: 0xedf0f2,
  },
  {
    id: "offices",
    chip: "Offices",
    title: "Offices",
    body: "Upstairs, the teams that price, engineer, draw, plan and run every project.",
    rect: [29.34, -10.61, 54.18, -0.12],
    floorY: MEZZ_Y,
    top: 2.4,
    tint: 0xf0f2f5,
    roles: [
      { title: "Quotations", body: "We price every project and send the quote in USD." },
      { title: "Engineering", body: "Structural checks and the right system for your wind zone." },
      { title: "Technical design", body: "Shop drawings and details for architects." },
      { title: "Transport & logistics", body: "Planning every container and delivery." },
      { title: "Production management", body: "The team running the factory floor." },
    ],
  },
];

/** production stations in process order (everything except the offices) */
export const STATIONS = ZONES.filter((z) => z.id !== "offices");
export const OFFICES = ZONES.findIndex((z) => z.id === "offices");
/** "Follow a window": each station is one unit of tour progress; dwell 0–0.6, travel 0.6–1. */
export const TOUR_END = STATIONS.length - 1 + 0.6;
export const DWELL = 0.6;
