// Server-only: reads the filesystem. Never import from a client component.
import fs from "node:fs";
import path from "node:path";
import type { ProductSystem } from "@/lib/products";
import { systemPack, type PackItem } from "@/lib/downloads";

/** The documents in a system's pack that are actually on file in /public, with their size (server only). */
export function packOnFile(s: ProductSystem): (PackItem & { size: string })[] {
  return systemPack(s).flatMap((d) => {
    try {
      const st = fs.statSync(path.join(process.cwd(), "public", d.href));
      if (!st.isFile()) return [];
      const mb = st.size / 1_048_576;
      return [{ ...d, size: mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(st.size / 1024))} KB` }];
    } catch {
      return [];
    }
  });
}
