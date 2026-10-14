import type { EventDetails, EventName } from "@/lib/telemetry/schema";

type Sink = <Name extends EventName>(event: Name, properties: EventDetails[Name]) => void;
let sink: Sink | null = null;

export function connectTelemetry(next: Sink) {
  sink = next;
  return () => {
    if (sink === next) sink = null;
  };
}

export function track<Name extends EventName>(event: Name, properties: EventDetails[Name]) {
  sink?.(event, properties);
}
