import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container } from "@/components/primitives";
import { ProjectBuilder } from "@/components/build/project-builder";

export const metadata: Metadata = pageMeta({
  title: "Build Your Project",
  description:
    "Pick your location on the map, see the wind code and the certified VALDA systems for it, upload your plans or count your openings, then design every window and door in 3D and send it to our US team.",
  path: "/build",
});

export default function BuildPage() {
  return (
    <main className="min-h-screen bg-white pb-24 pt-28 md:pb-32 md:pt-32">
      <Container>
        <div className="mb-10 max-w-3xl">
          <p className="text-[14px] leading-[22px] text-mute">Build your project</p>
          <h1 className="sw-h mt-4 text-[clamp(2.2rem,4.2vw,3.4rem)] text-char">Design your windows in 3D.</h1>
          <p className="mt-4 max-w-xl text-[16px] leading-6 text-slate">
            Start with where you are building. We match the systems certified for it, then you style every window and door on your own model and send it straight to us.
          </p>
        </div>
        <ProjectBuilder />
      </Container>
    </main>
  );
}
