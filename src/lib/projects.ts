export type Project = {
  slug: string;
  name: string;
  location: string;
  market: string;
  year: string;
  systems: string;
  img: string;
  gallery: string[];
  summary: string;
  description: string[];
};

export const PROJECTS: Project[] = [
  {
    slug: "juneau-village",
    name: "Juneau Village",
    location: "Milwaukee, USA",
    market: "Multifamily",
    year: "2025",
    systems: "Aluminum curtain wall · windows",
    img: "/images/project-milwaukee-1.jpg",
    gallery: ["/images/project-milwaukee-1.jpg", "/images/project-milwaukee-2.jpg"],
    summary: "A residential high-rise with bronze fins and a unitised facade engineered for the US Midwest.",
    description: [
      "Juneau Village is a multi-building residential development in downtown Milwaukee, glazed end to end with VALDA aluminum systems.",
      "The package combined a unitised curtain wall with operable windows, engineered for the structural and thermal demands of the US Midwest and delivered factory direct from Europe.",
    ],
  },
  {
    slug: "gora",
    name: "GORA",
    location: "Sofia, Bulgaria",
    market: "Residential",
    year: "2023",
    systems: "Aluminum tilt & turn · minimal-frame sliding",
    img: "/images/proj-gora.jpg",
    gallery: ["/images/proj-gora.jpg"],
    summary: "A contemporary residential building where full-height glazing frames the surrounding landscape.",
    description: [
      "GORA is a residential project in Sofia built around light and the view, using VALDA proprietary aluminum tilt & turn windows and minimal-frame sliding systems.",
      "Slim sightlines and large glazed openings give every apartment an uninterrupted connection to the outside.",
    ],
  },
  {
    slug: "american-university-malta",
    name: "American University of Malta",
    location: "Cospicua, Malta",
    market: "Institutional",
    year: "2022",
    systems: "Curtain wall · windows",
    img: "/images/proj-aum.jpg",
    gallery: ["/images/proj-aum.jpg"],
    summary: "An institutional facade and window package combining curtain wall with operable windows.",
    description: [
      "For the American University of Malta in Cospicua, VALDA delivered a facade and window package that balances daylight, acoustics and the historic waterfront setting.",
      "Curtain wall and operable windows were engineered and fabricated in Europe and installed to the university's programme.",
    ],
  },
  {
    slug: "amaya-residence-1",
    name: "Amaya Residence",
    location: "Sofia, Bulgaria",
    market: "Residential",
    year: "2023",
    systems: "Aluminum windows · sliding",
    img: "/images/proj-amaya.jpg",
    gallery: ["/images/proj-amaya.jpg"],
    summary: "A private residential building with generous glazing and a restrained material palette.",
    description: [
      "Amaya Residence pairs VALDA aluminum windows and sliding systems with a calm, contemporary facade.",
      "The glazing was specified for thermal performance and slim sightlines across the building's elevations.",
    ],
  },
  {
    slug: "mona-residence",
    name: "Mona Residence",
    location: "Sofia, Bulgaria",
    market: "Multifamily",
    year: "2024",
    systems: "Aluminum windows · tilt & turn",
    img: "/images/project-mona-1.jpg",
    gallery: ["/images/project-mona-1.jpg", "/images/project-mona-2.jpg", "/images/project-mona-3.jpg"],
    summary: "A multifamily development with warm timber accents and full-height glazing across every elevation.",
    description: [
      "Mona Residence is a multifamily building glazed throughout with VALDA aluminum tilt & turn windows.",
      "Warm timber accents and large openings give the elevations depth while keeping a consistent, refined rhythm.",
    ],
  },
  {
    slug: "twins-residence",
    name: "Twins Residence",
    location: "Bulgaria",
    market: "Mixed-use",
    year: "2024",
    systems: "Windows · sliding · facade",
    img: "/images/project-twins-1.jpg",
    gallery: ["/images/project-twins-1.jpg"],
    summary: "Two residential volumes around a landscaped courtyard, glazed for light and quiet.",
    description: [
      "Twins Residence is composed of two residential volumes set around a landscaped courtyard.",
      "VALDA windows, sliding systems and facade elements were combined to maximise light while keeping the interiors quiet.",
    ],
  },
  {
    slug: "stella",
    name: "Stella",
    location: "Sofia, Bulgaria",
    market: "Residential",
    year: "2023",
    systems: "Aluminum windows · sliding",
    img: "/images/proj-stella.jpg",
    gallery: ["/images/proj-stella.jpg"],
    summary: "A residential building with a clean, contemporary glazed facade.",
    description: ["Stella is a residential project glazed with VALDA aluminum windows and sliding systems, detailed for slim sightlines and performance."],
  },
  {
    slug: "belle-epoque",
    name: "Belle Epoque",
    location: "Sofia, Bulgaria",
    market: "Residential",
    year: "2022",
    systems: "Aluminum windows · doors",
    img: "/images/proj-belle.jpg",
    gallery: ["/images/proj-belle.jpg"],
    summary: "A residential development combining classic proportions with modern glazing.",
    description: ["Belle Epoque combines refined proportions with VALDA aluminum windows and doors, engineered for comfort and longevity."],
  },
  {
    slug: "austin-residence",
    name: "Austin Residence",
    location: "Austin, USA",
    market: "Luxury residential",
    year: "2024",
    systems: "Lift & slide · fixed glazing",
    img: "/images/proj-austin.jpg",
    gallery: ["/images/proj-austin.jpg"],
    summary: "A private luxury residence with expansive glazing for the Texas climate.",
    description: ["A private residence in Austin glazed with VALDA lift & slide and fixed systems, engineered for the Texas climate and large openings."],
  },
  {
    slug: "new-york-residence",
    name: "New York Private Residence",
    location: "New York, USA",
    market: "Luxury residential",
    year: "2024",
    systems: "Tilt & turn · sliding",
    img: "/images/proj-ny.jpg",
    gallery: ["/images/proj-ny.jpg"],
    summary: "A private residence with European tilt & turn systems for an urban setting.",
    description: ["A private New York residence specified with VALDA tilt & turn windows and sliding systems for acoustic comfort and slim sightlines."],
  },
  {
    slug: "chicago-residence",
    name: "Chicago Residence",
    location: "Chicago, USA",
    market: "Luxury residential",
    year: "2023",
    systems: "Aluminum windows · doors",
    img: "/images/proj-chicago.jpg",
    gallery: ["/images/proj-chicago.jpg"],
    summary: "A private residence engineered for the lakefront climate.",
    description: ["A private Chicago residence glazed with VALDA aluminum windows and doors, engineered for the lakefront climate."],
  },
];

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}
