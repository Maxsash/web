import { acquisition, type Acquisition } from "@/lib/telemetry/acquisition";

let entry: Acquisition | undefined;
export function visitAcquisition() {
  return (entry ??= acquisition(document.referrer, location.origin, location.search));
}
