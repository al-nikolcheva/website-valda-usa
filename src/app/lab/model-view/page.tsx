import type { Metadata } from "next";
import ViewerClient from "./viewer-client";

// Internal: raw view of the supplied Dolni Bogorov factory model. Not linked, not indexed.
export const metadata: Metadata = { title: "Lab: Factory model", robots: { index: false, follow: false } };

export default function ModelViewPage() {
  return (
    <div>
      <div className="h-[76px] bg-char" />
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-10">
        <p className="text-[14px] text-mute">Your model, as supplied · drag to rotate, scroll to zoom</p>
        <h1 className="sw-h mt-3 text-[clamp(1.8rem,3.4vw,2.6rem)] text-char">VALDA factory, Dolni Bogorov (Sofia)</h1>
        <div className="mt-8">
          <ViewerClient />
        </div>
      </div>
    </div>
  );
}

