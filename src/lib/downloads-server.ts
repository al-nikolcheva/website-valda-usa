// Server-only: reads the filesystem. Never import from a client component.
import fs from "node:fs";
import path from "node:path";
import type { ProductSystem } from "@/lib/products";
import { systemPack, type PackItem } from "@/lib/downloads";

/** The documents in a system's pack that are actually on file in /public (server only). */
export function packOnFile(s: ProductSystem): PackItem[] {
  return systemPack(s).filter((d) => {
    try {
      return fs.statSync(path.join(process.cwd(), "public", d.href)).isFile();
    } catch {
      return false;
    }
  });
}
