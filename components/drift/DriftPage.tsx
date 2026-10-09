import OceanPlate from "@/components/atlas/OceanPlate";
import { createSeaEdition } from "@/lib/sea/edition";
import DriftFrame, { type DriftFrameProps } from "./DriftFrame";
import { DRIFT_SCENES } from "./scenes";

export default function DriftPage(props: Omit<DriftFrameProps, "plate" | "torn">) {
  const scene = DRIFT_SCENES[props.scene];
  return (
    <DriftFrame
      {...props}
      torn={scene.drifter === "page"}
      plate={<OceanPlate edition={createSeaEdition(scene.seed, "2")} />}
    />
  );
}
