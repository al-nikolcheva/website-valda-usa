"use client";

import { useEffect, useRef } from "react";
import { BuildStage } from "./stage";

/** The three.js stage for the window build. Client only; loaded lazily by WindowBuild. */
export default function BuildCanvas({ step, replayKey }: { step: number; replayKey: number }) {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<BuildStage | null>(null);

  useEffect(() => {
    if (!host.current) return;
    const s = new BuildStage(host.current);
    stage.current = s;
    return () => {
      s.dispose();
      stage.current = null;
    };
  }, []);

  useEffect(() => {
    stage.current?.go(step);
  }, [step]);

  useEffect(() => {
    if (replayKey) stage.current?.replay();
  }, [replayKey]);

  return <div ref={host} aria-hidden className="absolute inset-0" />;
}
