// Verified VALDA company facts (source: VALDA Catalogue US 2026 + confirmed by Aleksandra).
// Use these for the About page. Do not invent other numbers or dates.

export const COMPANY = {
  founded: 1998,
  factories: [
    { name: "Sofia", note: "Our first factory, opened in 2004." },
    { name: "Veliko Tarnovo", note: "Opened in 2008 in Bulgaria's old capital, beneath the Tsarevets fortress." },
  ],
  numbers: [
    { value: 26, suffix: "+", label: "years since 1998" },
    { value: 2, suffix: "", label: "factories in Bulgaria" },
    { value: 300, suffix: "+", label: "production specialists" },
    { value: 100, suffix: "%", label: "family-owned" },
  ],
  story: {
    lead: "In 1998, two founders started VALDA in a small garage in Bulgaria, with one machine and every window made by hand.",
    body: [
      "That garage became a factory, then two. Today we make aluminum and PVC windows, doors, sliding systems and facades in Sofia and Veliko Tarnovo, with our own glazing and our own coating line.",
      "We are still 100% family-owned, with no outside investors, and many of our team have been with us for more than twenty years. We make every window as if our name is on it, because it is.",
    ],
  },
  timeline: [
    { year: "1998", title: "A garage and one machine", body: "Two founders start VALDA in a small garage in Bulgaria, making every window by hand." },
    { year: "2004", title: "The first factory", body: "The garage becomes a real factory in Sofia, with a production line and a growing team." },
    { year: "2008", title: "Veliko Tarnovo", body: "A second factory opens in Veliko Tarnovo, Bulgaria's old capital." },
    { year: "2016", title: "Into the USA", body: "VALDA enters the US market, adapting its European systems to American codes." },
    { year: "2018", title: "Milwaukee", body: "Large US project work begins, including multifamily in Milwaukee." },
    { year: "2020", title: "Hurricane certified", body: "Systems tested and approved for the High Velocity Hurricane Zone." },
    { year: "2024", title: "More Florida approvals", body: "Expanded Florida Building Code approvals across more systems." },
  ],
  // What we make ourselves, in order.
  inHouse: [
    { title: "PVC", body: "PVC windows and doors, fabricated in our factories." },
    { title: "Aluminum", body: "Aluminum windows, doors, sliding systems and facades." },
    { title: "Glazing", body: "Our own glass units, from double to impact-rated." },
    { title: "Coating", body: "Our own coating line, in any RAL colour." },
    { title: "Packing & shipping", body: "Packed for the crossing and shipped factory direct." },
  ],
  machinery: ["LISEC", "FOREL", "EMMEGI", "ROTOX", "SCHIRMER"],
  values: [
    { title: "Craftsmanship", body: "Every window made with care, by people who have done it for decades." },
    { title: "Continuity", body: "The same family, the same team, the same standards since 1998." },
    { title: "Accountability", body: "One company from the first drawing to the final delivery." },
    { title: "Integrity", body: "Clear quotes, honest timelines, no hidden distributor markup." },
    { title: "Sustainability", body: "Solar-powered factories, efficient machinery, products designed to last." },
  ],
  certifications: [
    { name: "Florida Product Approved", img: "/images/cert/cert-florida.png" },
    { name: "NAMI", img: "/images/cert/cert-nami.png" },
    { name: "AAMA / WDMA / CSA", img: "/images/cert/cert-aama.png" },
    { name: "ISO 9001", img: "/images/cert/cert-iso.png" },
  ],
  images: {
    fortress: "/images/veliko-tarnovo.webp", // Tsarevets fortress, Veliko Tarnovo (portrait photo; the user wants this on About). NB: veliko-tarnovo.jpg is a house, not the fortress
    facility: "/images/valda-facility.webp", // aerial of the factory
    floor: "/images/manufacturing.webp", // factory floor, people at work
    tarnovo: "/images/tarnovo.webp",
    film: "/media/hero-loop.mp4", // 5 MB loop (full film /media/valda-film.mp4 is 92 MB)
    poster: "/images/valda-poster.jpg",
  },
} as const;
