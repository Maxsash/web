import { useDeferredValue, useMemo, useState } from "react";
import { describeSea } from "@/lib/sea/describe";
import { createSeaEdition } from "@/lib/sea/edition";
import { renderSeaPlate } from "@/lib/sea/plate";
import {
  DEFAULT_SEA_SEED_V2,
  normaliseSeaSeed,
  seedFromSettings,
  settingsFromSeed,
} from "@/lib/sea/seed";
import type { SeaSettings } from "@/lib/sea/types";

const randomByte = () => {
  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0];
};

export const randomSettings = (): SeaSettings => ({
  swell: randomByte(),
  heading: randomByte(),
  character: randomByte(),
  variation: randomByte(),
});

export function useSeaSettings(seed: string, version: "1" | "2") {
  const [settings, setSettings] = useState<SeaSettings>(() =>
    settingsFromSeed(version === "2" ? seed : DEFAULT_SEA_SEED_V2),
  );
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const current = seedFromSettings(settings);
  const shown = useDeferredValue(current);
  const edition = useMemo(() => createSeaEdition(shown, "2"), [shown]);
  const plate = useMemo(() => renderSeaPlate(edition), [edition]);
  const typed = draft ?? current;

  const apply = (next: SeaSettings) => {
    setSettings(next);
    setDraft(null);
    setCopied(false);
  };

  return {
    settings,
    current,
    shown,
    plate,
    words: describeSea(edition.settings!),
    sailing: version === "2" && seed === current,
    query: `seed=${current}&version=2`,
    apply,
    update: (key: keyof SeaSettings, value: number) => apply({ ...settings, [key]: value }),
    typed,
    typedValid: normaliseSeaSeed(typed) !== null,
    type(value: string) {
      const lowered = value.toLowerCase();
      setDraft(lowered);
      const valid = normaliseSeaSeed(lowered);
      if (valid) {
        setSettings(settingsFromSeed(valid));
        setCopied(false);
      }
    },
    endTyping: () => setDraft(null),
    copied,
    setCopied,
  };
}
