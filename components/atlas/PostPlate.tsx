import type { SeaEdition } from "@/lib/sea/types";
import FlagPlate from "./FlagPlate";
import OceanPlate from "./OceanPlate";

export default function PostPlate({ slug, edition }: { slug: string; edition: SeaEdition }) {
  return slug === "the-webgl-flag-that-half-works" ? (
    <FlagPlate edition={edition} />
  ) : (
    <OceanPlate edition={edition} />
  );
}
