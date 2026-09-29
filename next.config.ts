import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Lets a phone on the same Wi-Fi load the dev server (hot reload + dev assets).
  allowedDevOrigins: ["192.168.1.113"],
  async redirects() {
    return [
      { source: "/our-brand", destination: "/about", permanent: true },
      { source: "/our-brand/history", destination: "/about", permanent: true },
      { source: "/our-brand/services", destination: "/about", permanent: true },
      { source: "/our-brand/credentials", destination: "/certifications", permanent: true },
      { source: "/production", destination: "/about", permanent: true },
      { source: "/how-we-work/consultation", destination: "/how-we-work", permanent: true },
      { source: "/how-we-work/design", destination: "/how-we-work", permanent: true },
      { source: "/how-we-work/manufacturing", destination: "/how-we-work", permanent: true },
      { source: "/how-we-work/logistics", destination: "/how-we-work", permanent: true },
      // Product slugs changed to match the 2026 data package.
      { source: "/products/system/cs-77", destination: "/products/system/conceptsystem-77", permanent: true },
      { source: "/products/system/cp-155", destination: "/products/system/conceptpatio-155", permanent: true },
      { source: "/products/system/76md", destination: "/products/system/series-76-md", permanent: true },
      { source: "/products/system/pd88", destination: "/products/system/premidoor-88", permanent: true },
      { source: "/products/system/88md", destination: "/products/system/series-88", permanent: true },
      // CS 68 is the AAMA-tested block of CS 77 — merged into one page.
      { source: "/products/system/conceptsystem-68", destination: "/products/system/conceptsystem-77", permanent: true },
      // Insight slugs moved to US spelling ("aluminum").
      { source: "/insights/how-aluminium-window-profiles-are-made", destination: "/insights/how-aluminum-window-profiles-are-made", permanent: true },
      { source: "/insights/aluminium-vs-pvc-windows-hurricane", destination: "/insights/aluminum-vs-pvc-windows-hurricane", permanent: true },
      // The Florida approvals registry now lives on the main certifications page.
      { source: "/certifications/florida-approvals", destination: "/certifications", permanent: true },
    ];
  },
};

export default nextConfig;
