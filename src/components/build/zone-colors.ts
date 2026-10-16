import type { ZoneKey } from "@/lib/build-project";

/** Map tint per zone, shared by the 3D map and its legend. */
export const ZONE_COLOR: Record<ZoneKey, string> = {
  hvhz: "#1f4e8c",
  impact: "#3a6dba",
  coastal: "#9db8de",
  cold: "#d5dbe3",
  standard: "#e6e6e7",
};
