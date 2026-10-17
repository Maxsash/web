import { defaultLabels, visitLabels, type VisitLabels } from "@/lib/telemetry/visit-labels";

const CHANGE = "studio-visit-context";
let labels: VisitLabels = defaultLabels;
export const labelSnapshot = () => labels;
export const serverLabels = () => defaultLabels;
export function subscribeLabels(listener: () => void) {
  window.addEventListener(CHANGE, listener);
  return () => window.removeEventListener(CHANGE, listener);
}
export function setVisitLabels(next: VisitLabels) {
  if (next.visit_role === labels.visit_role && next.declared_intent === labels.declared_intent)
    return;
  labels = next;
  window.dispatchEvent(new Event(CHANGE));
}
export function readVisitLabels() {
  setVisitLabels(visitLabels(location.search, labels));
}
