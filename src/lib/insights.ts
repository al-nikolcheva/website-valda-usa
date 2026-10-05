// Blog / Insights content. VALDA is a European manufacturer that exports
// worldwide; the blog leads with engineering, manufacturing and the export
// identity, with US / Florida topics as one part of a broader whole. Bodies are
// structured blocks (no MDX dep); faqs power FAQPage rich-result schema. Keep
// body copy free of em-dashes.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export interface Post {
  slug: string;
  title: string;
  description: string; // meta description
  category: string;
  date: string; // ISO
  dateLabel: string;
  readMins: number;
  cover: string;
  keywords: string[];
  excerpt: string;
  body: Block[];
  faqs?: { q: string; a: string }[];
  related?: string[];
}

export const POSTS: Post[] = [
  {
    slug: "thermal-break-explained",
    title: "The Thermal Break, Explained",
    description:
      "What a thermal break is, why every aluminum window needs one, how polyamide strips stop heat and condensation, and what to ask before you specify.",
    category: "Engineering",
    date: "2026-10-26",
    dateLabel: "Oct 2026",
    readMins: 6,
    cover: "/images/profile-cs77.jpg",
    keywords: ["thermal break", "thermally broken aluminum windows", "what is a thermal break", "aluminum window condensation", "polyamide thermal break", "energy efficient aluminum windows"],
    excerpt: "Aluminum is one of the best conductors of heat there is. The thermal break is the small piece of engineering that lets it insulate anyway.",
    body: [
      { type: "p", text: "Aluminum is strong, slim and almost endlessly durable. It is also one of the best conductors of heat in construction. Left as one solid piece, an aluminum frame would carry the outside temperature straight into the room. The thermal break is the part of the profile that stops that, and it is the reason a modern aluminum window can be both slim and warm." },
      { type: "h2", text: "What is a thermal break?" },
      { type: "p", text: "A thermal break is an insulating barrier built into the frame. Instead of one continuous aluminum section, the profile is made of two: an outer shell that faces the weather and an inner shell that faces the room. The two are joined by a material that conducts very little heat, so there is no solid metal path from outside to inside." },
      { type: "quote", text: "A thermally broken aluminum window is really two frames, held together by something that refuses to carry heat." },
      { type: "h2", text: "Why aluminum needs one" },
      { type: "p", text: "Aluminum conducts heat hundreds of times faster than the polyamide used to break it. Without a break, the inner face of the frame drops close to the outdoor temperature on a cold night. That costs energy, makes the room feel colder near the glass, and pulls moisture out of the air as condensation on the frame." },
      { type: "ul", items: [
        "Energy: less heat lost in winter and less heat gained in summer.",
        "Comfort: the inner frame stays close to room temperature.",
        "Condensation: a warmer inner surface means less water on the frame and sill.",
        "Longevity: less moisture means less risk of damage to finishes and surrounding materials.",
      ] },
      { type: "h2", text: "How it is made" },
      { type: "p", text: "In European aluminum systems the break is usually a pair of glass-fibre reinforced polyamide strips. The inner and outer profiles are extruded and finished separately, then the strips are rolled into channels on each profile and the metal is crimped tight around them. The result is a single, structural frame with an insulating core." },
      { type: "p", text: "Some high-performance systems go further, adding insulating foam or extra chambers inside the break to cut heat transfer again. A deeper break generally means better thermal performance, which is why system depth is one of the first things to look at on a spec sheet." },
      { type: "h3", text: "Polyamide strips vs pour and debridge" },
      { type: "p", text: "In North America you will also see a pour and debridge method, where liquid polyurethane is poured into a channel in a single extrusion and the metal bridge beneath it is then cut away. Both create a thermal break. Polyamide strips allow wider breaks and let the inner and outer profiles carry different colors, which is useful when the interior and exterior finishes need to differ." },
      { type: "h2", text: "What the thermal break does to the numbers" },
      { type: "p", text: "The effect of the break shows up in the whole-window U-factor, the measure of how much heat a window lets through. On the Reynaers systems we fabricate, manufacturer data puts ConceptSystem 77 at a U-factor of 0.24 with double glazing and 0.18 with triple, and MasterLine 10 at 0.14 with triple glazing. Those figures depend on a well-designed break as much as on the glass." },
      { type: "h2", text: "What to ask before you specify" },
      { type: "ul", items: [
        "Is the frame thermally broken, and how deep is the break?",
        "What is the whole-window U-factor, frame and glass together, not the glass alone?",
        "Can the inside and outside be finished in different colors?",
        "How does the system perform for condensation in your climate?",
      ] },
      { type: "p", text: "Every aluminum window and door system VALDA supplies is thermally broken. If you are comparing options for a project, send us the openings and the climate, and we will recommend the system and glazing that fit." },
    ],
    faqs: [
      { q: "What is a thermal break in an aluminum window?", a: "It is an insulating barrier, usually glass-fibre reinforced polyamide strips, that joins the inner and outer aluminum profiles. It removes the solid metal path for heat, so the frame insulates instead of conducting the outside temperature indoors." },
      { q: "Do thermally broken windows stop condensation?", a: "They greatly reduce it. Because the inner frame stays much closer to room temperature, moisture in the air is far less likely to condense on it. Indoor humidity and the glazing also play a part." },
      { q: "Are all aluminum windows thermally broken?", a: "No. Non-thermally broken aluminum is still sold for some uses, but for homes and occupied buildings a thermal break is essential. Every aluminum system VALDA supplies is thermally broken." },
      { q: "Is a deeper thermal break better?", a: "Generally yes. A wider break, or one with added insulating foam, lowers heat transfer through the frame and improves the whole-window U-factor." },
    ],
    related: ["what-u-factor-tells-you", "how-aluminum-window-profiles-are-made"],
  },

  {
    slug: "what-u-factor-tells-you",
    title: "What U-Factor Really Tells You About a Window",
    description:
      "U-factor explained: what the number means, why lower is better, whole-window vs glass-only figures, how to convert European Uw values, and how to compare quotes.",
    category: "Engineering",
    date: "2026-10-12",
    dateLabel: "Oct 2026",
    readMins: 6,
    cover: "/images/home-modern-pool.webp",
    keywords: ["window U-factor", "what is U-factor", "U-factor vs R-value", "energy efficient windows", "Uw value conversion", "triple glazing U-factor", "how to compare windows"],
    excerpt: "One number tells you how much heat a window lets through. Here is how to read it, and the one question to ask every supplier.",
    body: [
      { type: "p", text: "Of all the figures on a window spec sheet, U-factor is the one that tells you most about energy performance. It measures how much heat passes through the window, and it is the fairest way to compare two windows side by side, as long as you know what you are looking at." },
      { type: "h2", text: "What U-factor measures" },
      { type: "p", text: "U-factor is the rate of heat transfer through a window. In the US it is expressed in Btu per hour, per square foot, per degree Fahrenheit of temperature difference between inside and outside. In practice you only need one rule: the lower the number, the better the window insulates." },
      { type: "quote", text: "Lower is better. A window with a U-factor of 0.18 lets through a quarter less heat than one at 0.24." },
      { type: "h2", text: "Whole window, not just the glass" },
      { type: "p", text: "This is where most comparisons go wrong. A center-of-glass figure describes only the middle of the glass, which is always the best-performing part. The whole-window U-factor includes the frame, the edge of the glass and the spacer, so it is the number that reflects how the window actually performs on the wall. When you compare quotes, always ask for the whole-window figure." },
      { type: "h2", text: "What changes the number" },
      { type: "ul", items: [
        "The frame: material, depth and, for aluminum, the thermal break.",
        "The glazing: double or triple, and the width of the gaps between panes.",
        "Coatings: low-emissivity coatings reflect heat back towards its source.",
        "Gas fill: argon or krypton between the panes insulates better than air.",
        "The spacer: warm-edge spacers reduce heat loss around the edge of the glass.",
      ] },
      { type: "h2", text: "Double vs triple glazing, in real numbers" },
      { type: "p", text: "Manufacturer data for the Reynaers aluminum systems we fabricate shows what glazing does. ConceptSystem 77 moves from a U-factor of 0.24 with double glazing to 0.18 with triple. MasterLine 8 goes from 0.23 to 0.16. MasterLine 10, a high-insulation system, reaches 0.14 with triple glazing, and ConceptWall 50 curtain wall does the same. Large sliding systems sit higher, because big moving panels are harder to seal: ConceptPatio 155 runs from 0.34 to 0.28." },
      { type: "h2", text: "U-factor vs R-value" },
      { type: "p", text: "R-value measures resistance to heat flow, so higher is better. U-factor is roughly its inverse, so lower is better. Walls and insulation are usually quoted in R-values and windows in U-factors, which is why the two can look like they point in opposite directions." },
      { type: "h2", text: "Reading a European quote" },
      { type: "p", text: "European manufacturers often quote Uw, the whole-window value, in watts per square meter per kelvin. To convert to the US figure, divide by 5.678. A Uw of 1.0 is a U-factor of about 0.18, and a Uw of 0.8 is about 0.14. It is the same measurement in different units." },
      { type: "h2", text: "How to use it on a project" },
      { type: "ul", items: [
        "Ask every supplier for the whole-window U-factor, frame and glass together.",
        "Compare like with like: same opening type, same glazing.",
        "Check the requirement for your climate zone. Colder zones set lower maximums.",
        "Weigh U-factor alongside the rest: design pressure, impact rating, acoustics and sightlines.",
      ] },
      { type: "p", text: "For our Reynaers systems the U-factor is published on each product page. For VALDA and Kömmerling systems, thermal data is provided per project on request. Send us your openings and climate, and we will put the right figures in front of you." },
    ],
    faqs: [
      { q: "What is a good U-factor for a window?", a: "Lower is better. Around 0.30 is typical of a decent double-glazed window, and high-performance triple-glazed aluminum systems reach 0.14 to 0.18. The right target depends on your climate zone and local energy code." },
      { q: "What is the difference between U-factor and R-value?", a: "U-factor measures how much heat passes through, so lower is better. R-value measures resistance to heat flow, so higher is better. They are roughly inverses of each other." },
      { q: "How do I convert a European Uw value to a US U-factor?", a: "Divide the Uw value in W/m²K by 5.678. For example, a Uw of 1.0 equals a U-factor of about 0.18 Btu/hr·ft²·°F." },
      { q: "Does triple glazing always lower the U-factor?", a: "Yes, on the same frame triple glazing lowers the U-factor. On ConceptSystem 77, for example, it moves from 0.24 with double glazing to 0.18 with triple." },
    ],
    related: ["thermal-break-explained", "how-aluminum-window-profiles-are-made"],
  },

  {
    slug: "how-aluminum-window-profiles-are-made",
    title: "How Aluminum Window Profiles Are Made",
    description:
      "Inside aluminum window manufacturing: the extrusion press, the alloy and temper, the thermal break, and the powder-coat or anodised finish that follows.",
    category: "Manufacturing",
    date: "2026-08-26",
    dateLabel: "Aug 2026",
    readMins: 6,
    cover: "/images/manufacturing.webp",
    keywords: ["how aluminum windows are made", "aluminum extrusion", "window profile manufacturing", "thermal break", "powder coating windows"],
    excerpt: "A window frame starts life as a solid cylinder of aluminum. Here is how it becomes a slim, thermally-broken profile.",
    body: [
      { type: "p", text: "An aluminum window profile begins as a plain cylinder of alloy called a billet. Everything that makes the finished frame strong, slim and energy efficient happens in the steps between that raw metal and the unit on your wall. Here is the journey." },
      { type: "h2", text: "1. The billet and the alloy" },
      { type: "p", text: "Window profiles are extruded from a 6000-series aluminum alloy, chosen because it balances strength, corrosion resistance and how cleanly it flows through a die. The billet is heated to around 500 degrees Celsius, hot enough to become soft and formable without melting." },
      { type: "h2", text: "2. The extrusion press" },
      { type: "p", text: "A hydraulic ram then forces the softened billet through a hardened steel die, the way toothpaste is squeezed from a tube. The shape cut into the die becomes the cross-section of the profile, every chamber, groove and gasket channel. This is where a slim sightline is won or lost, because the whole geometry is defined here." },
      { type: "h2", text: "3. Cooling and tempering" },
      { type: "p", text: "As the profile emerges it is quenched, then stretched straight and cut to length. It is still relatively soft, so it is aged in an oven to reach its final temper, typically T5 or T6. Only after ageing does the aluminum reach full strength." },
      { type: "h2", text: "4. The thermal break" },
      { type: "p", text: "A bare metal frame would conduct heat and cold straight through the wall. To stop that, two separate profiles, an inner and an outer, are joined by polyamide strips that are rolled into channels and crimped tight. This thermal break interrupts the path of heat, which is what lets a slim aluminum window still insulate well." },
      { type: "quote", text: "The thermal break is the reason a modern aluminum window can be both slim and warm. Without it, the metal would carry the outside temperature straight indoors." },
      { type: "h2", text: "5. The finish" },
      { type: "p", text: "Finally the profile is finished. Powder coating applies a durable colored layer, baked on for a hard, weather-resistant surface available in effectively any RAL. Anodising instead grows a protective oxide layer for a natural metallic look. Both protect the frame for decades, including in coastal air." },
      { type: "p", text: "From there the profiles are machined, the corners assembled, and the glazing fitted. VALDA runs this process across our European factories, which is why the systems arrive with the precision and finish of European engineering." },
    ],
    faqs: [
      { q: "What aluminum alloy are windows made from?", a: "Most window profiles use a 6000-series alloy, which extrudes cleanly and offers a good balance of strength and corrosion resistance. It is then heat-treated to a T5 or T6 temper for full strength." },
      { q: "What is a thermal break in a window?", a: "It is an insulating barrier, usually polyamide strips, that joins the inner and outer aluminum profiles. It interrupts the flow of heat and cold through the metal, so a slim aluminum frame can still insulate well." },
      { q: "Is powder coating or anodising better?", a: "Both are durable, long-lasting finishes. Powder coating offers almost any color and a matte or satin look; anodising gives a natural metallic finish and a very hard surface. The right choice depends on the look you want." },
    ],
    related: ["how-pvc-window-profiles-are-made", "engineered-in-europe-delivered-worldwide"],
  },

  {
    slug: "engineered-in-europe-delivered-worldwide",
    title: "Engineered in Europe, Delivered Worldwide",
    description:
      "How VALDA's two Bulgarian factories, European engineering and a factory-direct model deliver windows and doors to projects around the world.",
    category: "Company",
    date: "2026-08-25",
    dateLabel: "Aug 2026",
    readMins: 5,
    cover: "/images/deliver-loading.webp",
    keywords: ["European window manufacturer", "window exporter", "factory direct windows", "Bulgarian window factory", "import European windows"],
    excerpt: "VALDA is not a local dealer with a warehouse. It is a European manufacturer that makes its own systems and ships them worldwide.",
    body: [
      { type: "p", text: "It is worth being clear about what VALDA is. Not a distributor, not a rebrander, but a manufacturer. The company designs and produces its own window, door and facade systems in Europe, and exports them to projects around the world. That single fact shapes everything about the quality and the price." },
      { type: "h2", text: "Family-owned since 1998" },
      { type: "p", text: "VALDA started in 1998, hand-making windows in a small garage in Bulgaria. It is still one hundred percent family-owned, with no outside investors. Nearly three decades later it runs two factories, in Sofia and Veliko Tarnovo, with more than three hundred production specialists." },
      { type: "h2", text: "European engineering as standard" },
      { type: "p", text: "Manufacturing in Europe means building to European standards from the start: precise extrusion, fusion-welded corners, thermally-broken frames and rigorous factory quality control. That engineering baseline travels with every unit, wherever it ships." },
      { type: "h2", text: "A factory-direct export model" },
      { type: "p", text: "Because VALDA both makes and exports the product, there are fewer layers between the factory line and the finished opening. The company handles engineering, production and delivery, which keeps quality consistent and removes the markups that stack up in a long supply chain." },
      { type: "quote", text: "Engineered in Europe, delivered worldwide. The same systems that meet European standards are shipped and supported wherever the project is." },
      { type: "h2", text: "Built to travel" },
      { type: "p", text: "Exporting windows is its own discipline. Systems are engineered to survive long transit, packed and protected for sea and road freight, and documented for the destination market. A window that leaves a European line has to arrive on another continent ready to install." },
      { type: "p", text: "For the United States that means European systems, certified for the US market and delivered factory-direct. The engineering is European; the reach is global." },
    ],
    faqs: [
      { q: "Where are VALDA windows made?", a: "In Europe, at three family-owned factories in Bulgaria, two in Sofia and one in Veliko Tarnovo, staffed by more than three hundred production specialists." },
      { q: "What does factory-direct mean for buyers?", a: "VALDA manufactures and exports its own systems, so there are fewer intermediaries between the production line and the finished opening. That keeps quality consistent and reduces the markups of a long supply chain." },
      { q: "Does VALDA only sell to Europe?", a: "No. VALDA exports worldwide. The same European-engineered systems are shipped and supported internationally, including across the United States." },
    ],
    related: ["how-aluminum-window-profiles-are-made", "windows-for-the-whole-united-states"],
  },

  {
    slug: "how-pvc-window-profiles-are-made",
    title: "How PVC Window Profiles Are Made",
    description:
      "Inside PVC window manufacturing: the compound, extrusion, multi-chamber profile, steel reinforcement and fusion-welded corners that make it strong.",
    category: "Manufacturing",
    date: "2026-08-24",
    dateLabel: "Aug 2026",
    readMins: 6,
    cover: "/images/valda-facility.webp",
    keywords: ["how PVC windows are made", "uPVC extrusion", "multi-chamber profile", "steel reinforcement PVC", "welded window corners"],
    excerpt: "PVC windows are often dismissed as the budget option. The way they are actually made explains why a good one performs so well.",
    body: [
      { type: "p", text: "PVC, more precisely uPVC, is one of the most widely used window materials in the world, and for good reason. It insulates naturally, resists corrosion and needs almost no maintenance. How it is manufactured explains where that performance comes from." },
      { type: "h2", text: "1. The compound" },
      { type: "p", text: "It starts as a dry compound: PVC powder blended with stabilisers, impact modifiers and UV protectors. That recipe matters, because it determines how the frame handles sun, cold and time. Good compounds hold their color and resist becoming brittle." },
      { type: "h2", text: "2. Twin-screw extrusion" },
      { type: "p", text: "The compound is fed into a twin-screw extruder, which heats and mixes it into a molten stream and pushes it through a die shaped like the profile cross-section. As it leaves the die it passes through calibration and cooling, which lock in the exact dimensions and a smooth surface." },
      { type: "h2", text: "3. The multi-chamber profile" },
      { type: "p", text: "Look at a cut PVC profile and you will see a honeycomb of hollow chambers. Those air chambers are deliberate. Each one is a pocket of trapped air that slows the transfer of heat, which is why multi-chamber PVC frames insulate so well without any added thermal break." },
      { type: "h2", text: "4. Steel reinforcement" },
      { type: "p", text: "PVC on its own would flex. So galvanised steel is inserted into the main chamber of the profile to give it rigidity, especially on larger units and doors. The steel does the structural work; the PVC does the insulating and weathering." },
      { type: "quote", text: "A quality PVC window is really a composite: insulating multi-chamber plastic on the outside, structural steel on the inside." },
      { type: "h2", text: "5. Fusion-welded corners" },
      { type: "p", text: "The profiles are cut to length and the corners are fusion welded. The ends are heated until molten and pressed together, fusing into a single continuous frame rather than pieces bolted together. That welded corner is what makes a PVC window airtight and strong at its most vulnerable point." },
      { type: "p", text: "The result is a frame that is warm, quiet, corrosion-proof and durable. VALDA produces PVC systems in Europe to exactly this standard, which is why they perform far above the budget-window reputation." },
    ],
    faqs: [
      { q: "Why do PVC windows have multiple chambers?", a: "Each hollow chamber traps a pocket of air, and trapped air is a good insulator. More chambers generally mean better thermal performance, which is why quality PVC frames insulate well without an added thermal break." },
      { q: "Do PVC windows have steel inside?", a: "Yes. Galvanised steel is inserted into the main chamber of the profile to give the frame rigidity, particularly on larger windows and doors. The steel provides structure while the PVC insulates and weathers." },
      { q: "Are welded corners better than mechanical joints?", a: "Fusion-welded corners fuse the profile into one continuous frame, which is stronger and more airtight than corners that are screwed or bracketed together." },
    ],
    related: ["how-aluminum-window-profiles-are-made", "aluminum-vs-pvc-windows-hurricane"],
  },

  {
    slug: "beyond-hurricanes-heat-cold-noise",
    title: "Windows for Heat, Cold and Noise, Not Just Storms",
    description:
      "Impact resistance is only one property. How thermal insulation, solar control and acoustic glass make a window perform in any US climate.",
    category: "Performance",
    date: "2026-08-23",
    dateLabel: "Aug 2026",
    readMins: 6,
    cover: "/images/home-cream-brick.webp",
    keywords: ["energy efficient windows", "window U-value", "soundproof windows", "solar control glazing", "thermal insulation windows"],
    excerpt: "Storm resistance gets the headlines, but for most homes the windows work hardest against heat, cold and noise every single day.",
    body: [
      { type: "p", text: "Hurricane resistance matters on the coast, but it is only one of the jobs a window does. For most of the country and most of the year, a window is fighting heat, cold, glare and noise. Those are the properties that decide comfort and energy bills, and they are all engineered." },
      { type: "h2", text: "Thermal insulation" },
      { type: "p", text: "How well a window keeps heat in or out is measured by its U-value: the lower the number, the better the insulation. It comes from three things working together: a thermally-broken or multi-chamber frame, a warm-edge spacer around the glass, and the glazing itself. Double glazing is the baseline; triple glazing pushes the U-value lower again for cold climates." },
      { type: "h2", text: "Solar control" },
      { type: "p", text: "In a hot climate the enemy is the sun, not the cold. A low-emissivity coating on the glass reflects a large share of solar heat back outside while still letting light through. In Texas, Arizona or California that keeps rooms cooler and cuts the load on air conditioning, without making the glass look dark." },
      { type: "h2", text: "Acoustic comfort" },
      { type: "p", text: "Noise is a comfort issue people underrate until they fix it. Laminated glass, and panes of different thicknesses paired together, disrupt sound waves and lower how much traffic, aircraft or city noise gets through. The same laminated glass that resists impact also makes a room noticeably quieter." },
      { type: "h2", text: "Air and water tightness" },
      { type: "p", text: "None of the above works if air and water leak around the sash. Quality systems use multiple gasket lines and precise tolerances so the window seals tightly, which is what keeps drafts out and holds the insulation and acoustic performance you paid for." },
      { type: "quote", text: "A window is a climate instrument. The same frame can be tuned for a desert, a cold city or a quiet bedroom by changing the glazing and seals." },
      { type: "p", text: "This is where European systems earn their reputation. VALDA windows can be configured for thermal performance, solar control or acoustic comfort depending on where they are going, so the system fits the climate rather than the other way around." },
    ],
    faqs: [
      { q: "What is a good U-value for a window?", a: "Lower is better. A well-insulated modern window falls well below the baseline of older double glazing, and triple glazing lowers it further for cold climates. The right target depends on the climate and the code where the window is installed." },
      { q: "Can windows reduce outside noise?", a: "Yes. Laminated glass and panes of differing thickness disrupt sound waves, so a well-specified window can noticeably reduce traffic, aircraft and city noise." },
      { q: "How do windows keep a house cool in hot climates?", a: "A low-emissivity coating reflects much of the sun's heat back outside while still letting light through, which reduces cooling loads in hot regions without darkening the glass." },
    ],
    related: ["windows-for-the-whole-united-states", "aluminum-vs-pvc-windows-hurricane"],
  },

  {
    slug: "windows-for-the-whole-united-states",
    title: "Windows for the Whole USA, Not Just the Coast",
    description:
      "Every US climate asks something different from a window. How European systems handle heat, cold, humidity and wind, from coast to coast.",
    category: "Market",
    date: "2026-08-22",
    dateLabel: "Aug 2026",
    readMins: 5,
    cover: "/images/home-us-porch.webp",
    keywords: ["European windows USA", "windows for hot climate", "windows for cold climate", "high performance windows America", "import windows US"],
    excerpt: "Florida gets the attention because of hurricanes, but a window in Chicago or Phoenix has an entirely different job to do.",
    body: [
      { type: "p", text: "It is easy to think of high-performance windows in the US as a Florida story, because impact glazing and the hurricane code are so visible there. But VALDA supplies projects across the country, and most of the US asks something completely different from its windows." },
      { type: "h2", text: "The Sun Belt: heat and glare" },
      { type: "p", text: "In Texas, Arizona, southern California and the rest of the Sun Belt, the challenge is solar heat. Here windows are specified for solar-control glazing and low heat gain, so interiors stay cool and cooling bills stay down through long, hot summers." },
      { type: "h2", text: "The North: cold and efficiency" },
      { type: "p", text: "In Chicago, New York, New Jersey and the northern states, the priority flips to keeping heat in. That means low U-values, thermally-broken or multi-chamber frames, and often triple glazing, so rooms stay warm and energy use stays low through hard winters." },
      { type: "h2", text: "The cities: noise and security" },
      { type: "p", text: "In dense urban projects, acoustic comfort and security move up the list. Laminated, thermally-broken systems cut street noise and resist forced entry, which matters as much as weather in an apartment over a busy avenue." },
      { type: "h2", text: "The coast: impact and wind" },
      { type: "p", text: "And yes, on the hurricane coast, impact resistance and high design pressures are essential. That is one important configuration of the same systems, not the whole product." },
      { type: "quote", text: "The same European systems configure to a desert, a cold city, a busy street or a hurricane coast. The engineering is constant; the specification meets the place." },
      { type: "p", text: "VALDA is active in markets across the US, including Florida, California, Texas, Illinois, New York and New Jersey. Wherever the project is, the system is tuned to the climate and certified for the market." },
    ],
    faqs: [
      { q: "Does VALDA only sell windows in Florida?", a: "No. VALDA supplies projects across the United States, including California, Texas, Illinois, New York and New Jersey, not only the hurricane coast. Each system is configured for the local climate and certified for the market." },
      { q: "What windows are best for hot climates like Texas or Arizona?", a: "Windows with solar-control, low-emissivity glazing and low heat gain, which reflect much of the sun's heat and keep interiors cooler with less air conditioning." },
      { q: "What makes a window good for cold northern winters?", a: "A low U-value, achieved with a thermally-broken or multi-chamber frame, warm-edge spacers and often triple glazing, to keep heat inside and reduce energy use." },
    ],
    related: ["beyond-hurricanes-heat-cold-noise", "engineered-in-europe-delivered-worldwide"],
  },

  {
    slug: "european-quality-ce-marking-and-iso",
    title: "CE Marking, EN Standards and ISO, Explained",
    description:
      "European windows are backed by CE marking, the EN 14351 standard and ISO management systems. What each one actually certifies, in plain terms.",
    category: "Certification",
    date: "2026-08-21",
    dateLabel: "Aug 2026",
    readMins: 5,
    cover: "/images/valda-poster.jpg",
    keywords: ["CE marking windows", "EN 14351", "ISO 9001 manufacturer", "European window standards", "window quality certification"],
    excerpt: "Local approvals like a Florida number tell you a product passed one market's test. European certification speaks to how the whole factory is run.",
    body: [
      { type: "p", text: "Country-specific approvals matter, but they only tell part of the story. A market-specific number says a product passed one region's tests. European certification goes further, covering the product, the declared performance and the way the factory itself is run." },
      { type: "h2", text: "CE marking and EN 14351" },
      { type: "p", text: "In Europe, windows and external doors are covered by the harmonised standard EN 14351-1. To carry a CE mark, a manufacturer has to test and declare the product's performance across a defined set of properties, including thermal transmittance, acoustic performance, air permeability, water tightness and resistance to wind load. It is a single, comparable declaration of how the product actually performs." },
      { type: "h2", text: "ISO management systems" },
      { type: "p", text: "ISO standards certify the organisation, not just a product. The common ones speak to different aspects of how a factory operates:" },
      { type: "ul", items: [
        "ISO 9001 covers quality management, the processes that keep production consistent.",
        "ISO 14001 covers environmental management, how the factory manages its impact.",
        "ISO 45001 covers occupational health and safety.",
      ] },
      { type: "p", text: "Together they say something a single product test cannot: that the whole operation behind the product is systematic, audited and repeatable." },
      { type: "quote", text: "A product approval certifies a window. A quality system certifies the factory that makes every window after it." },
      { type: "h2", text: "Why it matters for exported windows" },
      { type: "p", text: "When a product is engineered in Europe and shipped around the world, this layered certification is what underpins consistency. European standards set the baseline, and market-specific approvals then confirm the product for each destination. For a US project, that means European-grade quality behind the systems, with the local certification matched to the market on top." },
      { type: "p", text: "If you would like the specific certifications and declarations for a system, our team can send them for your project." },
    ],
    faqs: [
      { q: "What is CE marking on a window?", a: "It is a European conformity mark showing the manufacturer has tested and declared the window's performance under the harmonised standard EN 14351-1, across properties like thermal, acoustic, air, water and wind resistance." },
      { q: "What does ISO 9001 certify?", a: "ISO 9001 certifies a quality management system, meaning the processes a manufacturer uses to keep production consistent and controlled. It certifies the organisation and its processes rather than a single product." },
      { q: "Is European certification enough for the US market?", a: "European standards set a strong quality baseline, but each market also has its own approvals. A product is typically backed by European certification and then confirmed with the specific approvals required for the destination market." },
    ],
    related: ["engineered-in-europe-delivered-worldwide", "how-aluminum-window-profiles-are-made"],
  },

  {
    slug: "aluminum-vs-pvc-windows-hurricane",
    title: "Aluminum vs. PVC Windows: How to Choose",
    description:
      "Aluminum and PVC both make excellent windows. The right choice comes down to sightlines, budget, insulation and climate. A clear side-by-side.",
    category: "Guides",
    date: "2026-08-05",
    dateLabel: "Aug 2026",
    readMins: 6,
    cover: "/images/facade-brick.webp",
    keywords: ["aluminum vs PVC windows", "aluminum vs vinyl windows", "best window material", "window frame comparison", "impact window material"],
    excerpt: "Both materials perform. The decision is really about look, budget and the environment right outside your wall.",
    body: [
      { type: "p", text: "One of the first choices on any window project is the frame material. The good news is that both aluminum and PVC can be engineered to a high performance class and, where needed, fully impact rated. The decision is not really about capability, it is about sightlines, budget, insulation and how harsh the environment is right outside." },
      { type: "h2", text: "Where aluminum wins" },
      { type: "ul", items: [
        "Strength. Aluminum carries higher structural loads, which suits tall openings, large glass and exposed sites.",
        "Slim sightlines. Thinner frames mean more glass and a cleaner, more modern look.",
        "Big spans. Sliding and facade systems that open a whole wall are almost always aluminum.",
        "Longevity and finish. Powder-coated aluminum holds its color for decades and comes in effectively any RAL.",
      ] },
      { type: "h2", text: "Where PVC wins" },
      { type: "ul", items: [
        "Value. PVC systems usually deliver the same performance class at a lower cost.",
        "Insulation. Multi-chamber PVC is a natural insulator, which helps energy bills.",
        "Corrosion resistance. PVC does not corrode, so it shrugs off salt-laden air with almost no maintenance.",
        "Low upkeep. A wipe-down is generally all it needs.",
      ] },
      { type: "h2", text: "The environment question" },
      { type: "p", text: "Very close to the water, both materials work but age differently. Quality powder-coated aluminum resists corrosion well and is the standard for high-rise and architectural coastal work. PVC never corrodes at all, which makes it a low-maintenance favorite right on the shoreline. Either is a sound choice when the system is engineered and finished for the exposure." },
      { type: "h2", text: "So which should you choose?" },
      { type: "p", text: "Lead with your priority. If you want the slimmest frames, the largest glass or a facade-scale opening, choose aluminum. If value and insulation top your list, or the home sits in harsh air, PVC is hard to beat. Both can be specified to the same performance class." },
      { type: "p", text: "VALDA builds both, from slim aluminum systems to high-performance PVC, all engineered in Europe. Not sure which fits your project? Our finder narrows it down in a minute, or we can talk it through." },
    ],
    faqs: [
      { q: "Are PVC windows as strong as aluminum?", a: "PVC windows are reinforced with galvanised steel and can meet high performance classes, including impact ratings. Aluminum carries higher structural loads, which matters most on very large or tall openings." },
      { q: "Which lasts longer near the coast, aluminum or PVC?", a: "Both last for decades when engineered for the exposure. Powder-coated aluminum resists corrosion and is the norm for coastal high-rise work; PVC does not corrode at all and needs almost no maintenance." },
      { q: "Is aluminum or PVC more energy efficient?", a: "Multi-chamber PVC is a better natural insulator, but modern thermally-broken aluminum closes much of the gap. Glazing choice usually affects energy performance more than the frame material." },
    ],
    related: ["how-aluminum-window-profiles-are-made", "how-pvc-window-profiles-are-made"],
  },

  {
    slug: "are-impact-windows-required-in-florida",
    title: "Are Impact Windows Required in Florida? (2026)",
    description:
      "Where Florida law requires impact windows, how the HVHZ and Wind-Borne Debris Region differ, and what the 2026 code change means for you.",
    category: "US Market",
    date: "2026-07-28",
    dateLabel: "Jul 2026",
    readMins: 6,
    cover: "/images/arch-1.jpg",
    keywords: ["impact windows Florida", "are impact windows required in Florida", "HVHZ", "wind-borne debris region", "hurricane windows"],
    excerpt: "The short answer is yes in most of the state, but the rule that applies to your address depends on two overlapping zones.",
    body: [
      { type: "p", text: "If you are building or renovating anywhere near the Florida coast, one question decides a large part of your window budget: do you legally need impact-rated glass? The short answer is that most of populated Florida requires impact protection, but the exact rule depends on which of two zones your address falls in." },
      { type: "h2", text: "Two zones decide the rule" },
      { type: "p", text: "Florida splits into the High-Velocity Hurricane Zone (HVHZ) and the broader Wind-Borne Debris Region (WBDR). They are not the same thing, and the difference changes what documentation your windows need to pass permitting." },
      { type: "h3", text: "The High-Velocity Hurricane Zone" },
      { type: "p", text: "The HVHZ covers exactly two counties: Miami-Dade and Broward. It carries the strictest wind-and-impact rules in the country. Design wind speeds run around 175 mph in Miami-Dade and 170 mph in Broward. Products used here must be tested and approved specifically for HVHZ conditions." },
      { type: "h3", text: "The Wind-Borne Debris Region" },
      { type: "p", text: "Outside the HVHZ, most coastal and near-coastal Florida sits inside the Wind-Borne Debris Region. Here, openings must either use impact-rated products or be protected by an approved shutter system. The line is drawn by proximity to the coast and local design wind speed, which is why two homes a few miles apart can face different rules." },
      { type: "h2", text: "What counts as compliant" },
      { type: "p", text: "A compliant impact window is tested to the North American impact standards, principally ASTM E1996 for missile impact and ASTM E1886 for the cyclic wind pressure that follows. In the HVHZ, the equivalent Miami-Dade protocols apply. The product then carries either a statewide Florida Product Approval or a Miami-Dade Notice of Acceptance." },
      { type: "quote", text: "A window approved statewide is not automatically cleared for the HVHZ. The reverse is true: HVHZ approval satisfies the rest of the state." },
      { type: "h2", text: "The 2026 code change to plan for" },
      { type: "p", text: "The next edition of the Florida Building Code tightens requirements at the end of 2026. Permits pulled before the changeover generally lock into the current edition, while later permits face stricter envelopes, including higher design pressures within a few miles of tidal water. If your project is close to the deadline, the permit date matters." },
      { type: "p", text: "Every VALDA system sold into the US is certified for these conditions, with the approvals matched to each opening. If you are unsure which rule applies, tell us the address and the opening schedule and we will confirm what you need." },
    ],
    faqs: [
      { q: "Are impact windows required everywhere in Florida?", a: "No. They are required across the Wind-Borne Debris Region and the High-Velocity Hurricane Zone, which together cover most populated coastal Florida. Inland areas with lower design wind speeds may not require them, and the Wind-Borne Debris Region allows approved shutters as an alternative." },
      { q: "Do I need HVHZ approval in Broward County?", a: "Yes. Broward is inside the High-Velocity Hurricane Zone, so a general statewide approval is not enough. The product must carry approval specifically for HVHZ conditions." },
      { q: "Can I use hurricane shutters instead of impact windows?", a: "In the Wind-Borne Debris Region, approved shutters are an accepted way to protect openings. Impact windows provide the same protection permanently, without deployment before a storm." },
    ],
    related: ["hvhz-vs-florida-product-approval", "windows-for-the-whole-united-states"],
  },

  {
    slug: "hvhz-vs-florida-product-approval",
    title: "HVHZ vs. Florida Product Approval, Explained",
    description:
      "Florida Product Approval, Miami-Dade NOA and HVHZ approval are not the same. What each means and how to read an FL approval for your permit.",
    category: "US Market",
    date: "2026-07-20",
    dateLabel: "Jul 2026",
    readMins: 5,
    cover: "/images/arch-3.jpg",
    keywords: ["Florida Product Approval", "Miami-Dade NOA", "HVHZ approval", "FL number", "how to read an FL approval"],
    excerpt: "Three terms get used as if they mean the same thing. They do not, and mixing them up is how a project stalls at the permit desk.",
    body: [
      { type: "p", text: "Specifiers and homeowners run into three terms early: Florida Product Approval, Miami-Dade Notice of Acceptance, and HVHZ approval. They sound interchangeable. They are not, and the difference is exactly what a plans examiner checks." },
      { type: "h2", text: "Florida Product Approval (the FL number)" },
      { type: "p", text: "A Florida Product Approval is a statewide approval issued under the Florida Building Code. Each carries an FL number and lists the tested configurations, sizes and design pressures the product is approved for. It is valid across the state, and where the individual approval carries it, into the hurricane zone as well." },
      { type: "h2", text: "Miami-Dade Notice of Acceptance (NOA)" },
      { type: "p", text: "A Miami-Dade NOA is issued by Miami-Dade County and is accepted throughout the High-Velocity Hurricane Zone. A product with a current NOA is accepted in the Wind-Borne Debris Region as well." },
      { type: "h2", text: "HVHZ approval" },
      { type: "p", text: "HVHZ approval is the highest bar. It means the product passed the Miami-Dade test protocols for large-missile impact and cyclic wind pressure. This is the one that clears Miami-Dade and Broward." },
      { type: "quote", text: "It is a one-way street: an HVHZ-approved product satisfies the rest of the state, but a statewide-only approval does not clear the HVHZ." },
      { type: "h2", text: "How to read an FL approval" },
      { type: "p", text: "When you open a Florida Product Approval, a handful of fields decide whether it fits your opening:" },
      { type: "ul", items: [
        "The FL number and revision, which identify the approval and its current version.",
        "The approval method and whether it covers the HVHZ.",
        "The tested configuration, for example fixed, casement or single-hung.",
        "The design pressure, given as positive and negative values in pounds per square foot.",
        "The maximum tested size, which caps how large the opening can be.",
      ] },
      { type: "p", text: "If your opening is larger than the tested size, or needs a higher design pressure than the approval lists, that approval does not apply to it, even if the product family is right." },
      { type: "p", text: "Every VALDA system carries the approvals a US project needs, matched to each opening. Send us the opening schedule and we confirm the right approval for each unit." },
    ],
    faqs: [
      { q: "Is a Florida Product Approval enough for the hurricane zone?", a: "Not on its own. A statewide Florida Product Approval only clears the High-Velocity Hurricane Zone if that specific approval was tested and issued for HVHZ conditions. Otherwise you need HVHZ approval or a Miami-Dade NOA." },
      { q: "What is the difference between an FL number and a Miami-Dade NOA?", a: "An FL number is a statewide Florida Product Approval. A Miami-Dade NOA is a county approval accepted throughout the hurricane zone. A product can hold one, the other, or both." },
      { q: "What do the numbers on an FL approval mean?", a: "The key fields are the tested configuration, the design pressure in pounds per square foot, and the maximum tested size. Together they define which openings the approval actually covers." },
    ],
    related: ["are-impact-windows-required-in-florida", "hvhz-large-missile-impact-testing"],
  },

  {
    slug: "impact-windows-vs-hurricane-shutters",
    title: "Impact Windows vs. Hurricane Shutters",
    description:
      "Impact windows and hurricane shutters both meet code, but differ on long-term cost, convenience, insurance and resale. A practical comparison.",
    category: "US Market",
    date: "2026-07-12",
    dateLabel: "Jul 2026",
    readMins: 5,
    cover: "/images/home-coast-sunset.webp",
    keywords: ["impact windows vs shutters", "hurricane shutters vs impact windows", "cost of impact windows", "hurricane protection", "insurance discount impact windows"],
    excerpt: "Both protect your openings and both pass code. The difference is how they feel to live with, and what they cost over the years.",
    body: [
      { type: "p", text: "In the Wind-Borne Debris Region you can protect openings two ways: permanent impact-rated windows, or approved shutters over standard windows. Both satisfy the code. The real difference is how each one lives day to day and what it costs over time." },
      { type: "h2", text: "How each one protects" },
      { type: "p", text: "Impact windows use laminated glass with a tough interlayer, so even when the outer pane breaks the opening stays sealed against wind and debris. Shutters protect a standard window by covering it, which means they only work once deployed." },
      { type: "h2", text: "Always on vs. deploy before the storm" },
      { type: "p", text: "This is the practical divide. Impact glass is always working. There is nothing to close and no scramble when a storm forms fast. Shutters have to be shut every time, which is manageable for a primary home and harder for a second home or a rental." },
      { type: "h2", text: "The co-benefits that tip the decision" },
      { type: "ul", items: [
        "Insurance. Impact-rated openings often qualify for wind-mitigation premium reductions.",
        "Noise. Laminated glass noticeably cuts outside noise year round.",
        "UV. The interlayer blocks most ultraviolet, protecting floors and furnishings.",
        "Security. Laminated glass resists forced entry, not just wind.",
        "Resale. Permanent impact protection is a selling point and shows up in appraisals.",
      ] },
      { type: "h2", text: "Who each one suits" },
      { type: "p", text: "Shutters make sense on a tight budget or where you want to keep existing windows. Impact windows make sense when you want protection that works without you, plus the quieter, more secure, more efficient home that comes with it." },
      { type: "p", text: "VALDA impact systems are certified for the US market in both aluminum and PVC. Tell us about your home and we will help you weigh it up." },
    ],
    faqs: [
      { q: "Are impact windows better than hurricane shutters?", a: "Both meet code. Impact windows protect permanently with no deployment and add noise reduction, UV protection, security and possible insurance savings. Shutters cost less up front but must be closed before every storm." },
      { q: "Do impact windows lower home insurance?", a: "Often, yes. Impact-rated openings can qualify for wind-mitigation credits that reduce premiums. The exact saving depends on your insurer and the rest of the home." },
      { q: "Do impact windows really reduce noise?", a: "Yes. The laminated interlayer that stops debris also dampens sound, so impact windows noticeably cut outside noise all year, not just during storms." },
    ],
    related: ["are-impact-windows-required-in-florida", "beyond-hurricanes-heat-cold-noise"],
  },

  {
    slug: "hvhz-large-missile-impact-testing",
    title: "How HVHZ Large-Missile Impact Testing Works",
    description:
      "Inside the Miami-Dade TAS 201, 202 and 203 tests: the 9 lb missile, 9,000 pressure cycles and what a pass really proves about a window.",
    category: "Technical",
    date: "2026-07-05",
    dateLabel: "Jul 2026",
    readMins: 5,
    cover: "/images/hero.jpg",
    keywords: ["large missile impact test", "TAS 201", "TAS 202", "TAS 203", "hurricane window testing", "cyclic pressure test"],
    excerpt: "A hurricane-zone approval is not a marketing claim. It is the record of a window surviving a two-by-four fired at it, then thousands of pressure cycles.",
    body: [
      { type: "p", text: "When a window is approved for the High-Velocity Hurricane Zone, it has passed one of the toughest test batteries in the building world. The Miami-Dade protocols, TAS 201, 202 and 203, simulate what a hurricane actually does to an opening: airborne debris, then hours of violent pressure swings." },
      { type: "h2", text: "TAS 201: large-missile impact" },
      { type: "p", text: "The headline test. A nine-pound piece of lumber, essentially a two-by-four, is fired from a cannon at the glass at around 50 feet per second. It has to strike the panel and a corner. The interlayer may crack, but the opening must not be breached. This is the moment that separates impact glass from ordinary glazing." },
      { type: "h2", text: "Small-missile impact" },
      { type: "p", text: "For openings higher up on a building, a burst of small steel balls stands in for roof gravel and smaller debris carried at higher speed. The requirement is the same: no penetration." },
      { type: "h2", text: "TAS 202: uniform static pressure" },
      { type: "p", text: "The window is loaded with steady positive and negative pressure to confirm its structural design pressure, the number you later see on the Florida Product Approval. This proves the frame, glass and anchors hold under the peak load." },
      { type: "h2", text: "TAS 203: cyclic wind pressure" },
      { type: "p", text: "This is the endurance test. After being struck, the already-damaged window is put through thousands of pressure cycles, positive and negative, mimicking the hours a storm spends pushing and pulling on a wall. The opening still has to keep the weather out." },
      { type: "quote", text: "Passing means a window that has been hit by a flying two-by-four still holds through thousands of pressure cycles without letting the storm in." },
      { type: "p", text: "Every HVHZ line on a Florida Product Approval traces back to this sequence, run on a specific configuration at a specific size and pressure. VALDA systems are tested to these protocols and approved for the US market, configuration by configuration." },
    ],
    faqs: [
      { q: "What is the large-missile impact test?", a: "It is the TAS 201 protocol, in which a roughly nine-pound two-by-four is fired at the window at about 50 feet per second. The window must not be breached, which is what qualifies it as impact rated for the hurricane zone." },
      { q: "What do TAS 201, 202 and 203 mean?", a: "They are the Miami-Dade test protocols for the hurricane zone: TAS 201 is large-missile impact, TAS 202 is uniform static pressure, and TAS 203 is cyclic wind pressure. A hurricane-zone window must pass all three." },
      { q: "Does the glass break during the impact test?", a: "The outer glass can crack. What matters is that the laminated interlayer keeps the opening sealed so wind and debris cannot get through, then survives the cyclic pressure that follows." },
    ],
    related: ["hvhz-vs-florida-product-approval", "beyond-hurricanes-heat-cold-noise"],
  },
];

// Posts go live at 9:00 AM ET on their date, so articles can be written ahead
// and appear on schedule. Pages that list posts revalidate hourly to pick them up.
export const isPublished = (p: Post, now = Date.now()): boolean => Date.parse(`${p.date}T09:00:00-04:00`) <= now;
export const publishedPosts = (): Post[] =>
  POSTS.filter((p) => isPublished(p)).sort((a, b) => b.date.localeCompare(a.date));

export const getPost = (slug: string): Post | undefined => publishedPosts().find((p) => p.slug === slug);
export const allPostSlugs = (): string[] => publishedPosts().map((p) => p.slug);
export const CATEGORIES = (): string[] => [...new Set(publishedPosts().map((p) => p.category))];
