"use client";

import dynamic from "next/dynamic";

const ModelViewer = dynamic(() => import("./viewer"), { ssr: false });

export default function ViewerClient() {
  return <ModelViewer />;
}
