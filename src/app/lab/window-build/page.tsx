import type { Metadata } from "next";
import { WindowBuild } from "@/components/window-build/window-build";

// Internal preview: a step-by-step 3D build of one window. Not linked, not indexed.
export const metadata: Metadata = { title: "Lab: Window build", robots: { index: false, follow: false } };

export default function WindowBuildLab() {
  return (
    <div>
      <div className="h-[76px] bg-char" />
      <WindowBuild />
    </div>
  );
}
