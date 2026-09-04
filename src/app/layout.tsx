import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["300", "400", "500", "600"] });
const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://valdagroup.com"),
  title: {
    default: "VALDA — European windows, doors & facades for the USA",
    template: "%s — VALDA",
  },
  description:
    "A family-owned European manufacturer of high-end aluminium and PVC windows, doors, sliding and facade systems. Engineered in Europe, delivered worldwide, and certified for the US market.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "VALDA",
    url: "https://valdagroup.com",
    title: "VALDA — European windows, doors & facades, engineered in Europe",
    description: "A family-owned European manufacturer of aluminium and PVC windows, doors and facade systems. Engineered in Europe, delivered worldwide.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-pure text-ink">
        <SmoothScroll>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
