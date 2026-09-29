import type { Metadata } from "next";
import { FactoryExplorer } from "@/components/factory-board/factory";

// Internal preview of the interactive factory. Not linked, not indexed.
export const metadata: Metadata = { title: "Lab: Factory board", robots: { index: false, follow: false } };

export default function FactoryLab() {
  return (
    <div>
      <div className="h-[76px] bg-char" />
      <FactoryExplorer />
    </div>
  );
}

