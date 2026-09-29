import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { JsonLd } from "@/components/json-ld";
import { DEFAULT_OG, SITE_URL, INDEXABLE } from "@/lib/seo";

const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const DEFAULT_TITLE = "European Windows, Doors & Facades for the USA | VALDA";
const DEFAULT_DESCRIPTION =
  "Family-owned European maker of aluminum and PVC windows, doors and facades. Built in our own factories, certified for the USA. Get a quote.";

// Defaults only. Every page sets its own canonical and og:url through pageMeta(),
// so nothing here may point a page at the homepage.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...(INDEXABLE ? {} : { robots: { index: false, follow: false } }),
  title: {
    // Meta title kept under 60 chars, keyword-led, brand at the end.
    default: DEFAULT_TITLE,
    template: "%s | VALDA",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "VALDA",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG, alt: "Juneau Village, Milwaukee, glazed with VALDA aluminum systems" }],
  },
  twitter: { card: "summary_large_image" },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "VALDA",
  url: SITE_URL,
  logo: `${SITE_URL}/valda-logo.png`,
  foundingDate: "1998",
  email: "info@valdagroup.com",
  telephone: "+1-689-280-2337",
  address: { "@type": "PostalAddress", addressCountry: "BG" },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "VALDA",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${interTight.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-pure text-ink">
        <JsonLd data={[organizationLd, websiteLd]} />
        <SmoothScroll>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
