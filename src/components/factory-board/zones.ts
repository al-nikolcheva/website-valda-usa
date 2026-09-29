// Copy + layout for the interactive factory board (edit copy here).
// Modelled on the Sofia factory (public/models/valda-dolni-bogorov.obj). Hall-local metres: x 0–83.76 along
// the hall (west → east), z 0–24.18 across it (north wall → south wall with the 12 loading shutters).
// The process flows west → east: goods in at the western doors, shipping out of the eastern doors.
// The northern extension (offices) sits at x 29.34–54.18, z −10.61 to −0.12.

export interface Step {
  title: string;
  text: string;
  /** machine to highlight (keys are defined in scene.ts); omit to highlight the whole station */
  machine?: string;
}

export interface Zone {
  id: "goods" | "pvc" | "aluminum" | "coating" | "glass" | "glazing" | "packing" | "offices";
  chip: string;
  title: string;
  intro: string;
  steps: Step[];
  /** floor pad [x0, z0, x1, z1] in hall-local metres */
  rect: [number, number, number, number];
  floorY: number;
  /** focus box height above the floor */
  top: number;
  /** soft floor tint */
  tint: number;
}

export const FACTORY_COPY = {
  label: "Inside the factory",
  heading: "Everything made under our own roof.",
  intro: "Explore our factories in Sofia and Veliko Tarnovo. Tap a point to see what happens there.",
  caption: "Modelled on our factory in Sofia.",
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
    intro: "Everything arrives here and is checked before production.",
    steps: [
      { title: "Profiles arrive", text: "PVC profiles with steel reinforcement, and thermally broken aluminum profiles, plus seals and hardware.", machine: "goods-truck" },
      { title: "Glass arrives", text: "Large float glass sheets on A-frame racks, lifted with a vacuum lifter.", machine: "goods-glass" },
      { title: "Checked and stored", text: "Every delivery is checked and stored on racks by system and colour.", machine: "goods-racks" },
    ],
    rect: [0.6, PZ0, 11.6, PZ1],
    floorY: 0,
    top: 5.5,
    tint: 0xeceff2,
  },
  {
    id: "pvc",
    chip: "PVC",
    title: "PVC production",
    intro: "PVC windows and doors, from profile to finished frame.",
    steps: [
      { title: "Foiling", text: "For colours, a decorative foil, a solid colour or wood effect, is glued and pressed onto the profile. White profiles skip this step.", machine: "pvc-foil" },
      { title: "Cutting", text: "A double-head saw cuts the profiles to length at 45°.", machine: "pvc-saw" },
      { title: "Steel reinforcement", text: "Galvanised steel is fitted inside the profile for strength.", machine: "pvc-steel" },
      { title: "Machining", text: "Drainage slots and holes for the hardware are routed.", machine: "pvc-router" },
      { title: "Welding", text: "The four corners are heated until they melt and pressed together in one go.", machine: "pvc-weld" },
      { title: "Corner cleaning", text: "The weld seam is cleaned for a smooth corner.", machine: "pvc-clean" },
      { title: "Seals and hardware", text: "Gaskets, hinges and locks are fitted.", machine: "pvc-hardware" },
    ],
    rect: [12.2, PZ0, 27.2, PZ1],
    floorY: 0,
    top: 3.5,
    tint: 0xf2f1ed,
  },
  {
    id: "aluminum",
    chip: "Aluminum",
    title: "Aluminum production",
    intro: "Thermally broken aluminum windows, doors and facades.",
    steps: [
      { title: "Thermal break", text: "The profiles have insulating strips between the inner and outer aluminum, so heat and cold do not pass through.", machine: "alu-racks" },
      { title: "Cutting", text: "A double-head saw cuts the profiles at 45° or 90°.", machine: "alu-saw" },
      { title: "CNC machining", text: "Holes and slots for locks, hinges and drainage are milled.", machine: "alu-cnc" },
      { title: "Corner crimping", text: "Corner cleats are glued in and the corners are hydraulically crimped.", machine: "alu-crimp" },
      { title: "Seals and hardware", text: "Gaskets and hardware are fitted.", machine: "alu-hardware" },
    ],
    rect: [27.8, PZ0, 39.2, PZ1],
    floorY: 0,
    top: 3.5,
    tint: 0xecf0f3,
  },
  {
    id: "coating",
    chip: "Coating",
    title: "Coating",
    intro: "Our own coating line for aluminum, in any RAL colour.",
    steps: [
      { title: "Pretreatment", text: "Profiles are cleaned and chemically treated so the paint bonds for life.", machine: "coat-pre" },
      { title: "Powder coating", text: "Electrostatically charged powder is sprayed evenly over every surface.", machine: "coat-booth" },
      { title: "Curing", text: "The oven bakes the powder at around 200 °C (400 °F) into a hard, durable finish.", machine: "coat-oven" },
      { title: "Anodizing", text: "As an alternative, an electrochemical process grows a protective layer that becomes part of the aluminum.", machine: "coat-anod" },
    ],
    rect: [39.8, PZ0, 50.8, PZ1],
    floorY: 0,
    top: 5.5,
    tint: 0xf2f0ef,
  },
  {
    id: "glass",
    chip: "Glass units",
    title: "Glass units",
    intro: "Insulated glass units on a fully automatic LISEC line.",
    steps: [
      { title: "Cutting", text: "Large sheets are scored and broken to size on an automatic cutting table.", machine: "glass-cut" },
      { title: "Washing", text: "Every pane is washed and dried.", machine: "glass-wash" },
      { title: "Spacer", text: "A spacer frame is filled with moisture absorber and coated with butyl.", machine: "glass-spacer" },
      { title: "Assembly and argon", text: "The panes and spacer are pressed together with argon gas inside.", machine: "glass-press" },
      { title: "Sealing", text: "A second seal is applied around the edge.", machine: "glass-seal" },
      { title: "Built to spec", text: "Double or triple glazing, laminated or impact-rated.", machine: "glass-rack" },
    ],
    rect: [51.4, PZ0, 62.6, PZ1],
    floorY: 0,
    top: 3.5,
    tint: 0xeaf0f5,
  },
  {
    id: "glazing",
    chip: "Glazing",
    title: "Glazing & assembly",
    intro: "Glass meets frame, and every window is checked.",
    steps: [
      { title: "Glazing", text: "The glass unit is set on setting blocks and held in with glazing beads.", machine: "glaze-bench" },
      { title: "Final check", text: "Opening, sealing and dimensions are checked, and each window is labelled.", machine: "glaze-check" },
    ],
    rect: [63.2, PZ0, 69.8, PZ1],
    floorY: 0,
    top: 3,
    tint: 0xf1f1ee,
  },
  {
    id: "packing",
    chip: "Packing",
    title: "Packing & shipping",
    intro: "Packed for the crossing and loaded at our own docks.",
    steps: [
      { title: "Protection", text: "Corners are protected and every unit is wrapped.", machine: "pack-wrap" },
      { title: "Racking", text: "Windows are packed onto A-frame racks and crates.", machine: "pack-racks" },
      { title: "Loading", text: "Forklifts load the trucks and containers, with full export documentation.", machine: "pack-load" },
    ],
    rect: [70.4, PZ0, 83.2, PZ1],
    floorY: 0,
    top: 3.5,
    tint: 0xedf0f2,
  },
  {
    id: "offices",
    chip: "Offices",
    title: "Offices",
    intro: "The team behind every project.",
    steps: [
      { title: "Quotations", text: "We price every project and send the quote in USD.", machine: "role-0" },
      { title: "Engineering", text: "Structural checks and the right system for your wind zone.", machine: "role-1" },
      { title: "Technical design", text: "Shop drawings and details for architects.", machine: "role-2" },
      { title: "Transport & logistics", text: "Planning every container and delivery.", machine: "role-3" },
      { title: "Production management", text: "The team running the factory floor.", machine: "role-4" },
    ],
    rect: [29.34, -10.61, 54.18, -0.12],
    floorY: MEZZ_Y,
    top: 2.4,
    tint: 0xf0f2f5,
  },
];

export const OFFICES = ZONES.findIndex((z) => z.id === "offices");
