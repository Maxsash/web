import { describeSea } from "@/lib/sea/describe";
import type { SeaSettings } from "@/lib/sea/types";
import styles from "./SeaStudio.module.css";

type Control = { key: keyof SeaSettings; label: string; hint: string; low: string; high: string };

export const CONTROLS: Control[] = [
  {
    key: "swell",
    label: "Swell",
    hint: "How high the sea stands.",
    low: "Glassy",
    high: "Storm-high",
  },
  { key: "heading", label: "Heading", hint: "Which way the sea runs.", low: "Left", high: "Right" },
  {
    key: "character",
    label: "Character",
    hint: "Long and rolling, or short and cross-running.",
    low: "Rolling",
    high: "Choppy",
  },
  {
    key: "variation",
    label: "Variation",
    hint: "Another arrangement of crests in the same kind of sea.",
    low: "A",
    high: "Z",
  },
];

type Props = {
  control: Control;
  id: string;
  settings: SeaSettings;
  onChange: (key: keyof SeaSettings, value: number) => void;
};

export default function SettingSlider({ control, id, settings, onChange }: Props) {
  const { key, label, hint, low, high } = control;
  const reading =
    key === "variation" ? `No. ${settings.variation + 1} of 256` : describeSea(settings)[key];
  return (
    <div className={styles.setting}>
      <div className={styles.settingHead}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} aria-live="off">
          {reading}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={255}
        step={1}
        value={settings[key]}
        aria-valuetext={reading}
        aria-describedby={`${id}-hint`}
        onChange={(event) => onChange(key, Number(event.target.value))}
      />
      <div className={styles.ends} aria-hidden="true">
        <span>{low}</span>
        <span>{high}</span>
      </div>
      <p id={`${id}-hint`} className={styles.hint}>
        {hint}
      </p>
    </div>
  );
}
