import type { Metadata } from "next";
import { FactoryExplorer } from "@/components/factory/factory";

// Internal preview of the interactive factory. Not linked, not indexed.
export const metadata: Metadata = { title: "Lab: Factory", robots: { index: false, follow: false } };

export default function FactoryLab() {
  return (
    <div>
      <div className="h-[76px] bg-char" />
      <FactoryExplorer />
    </div>
  );
}

