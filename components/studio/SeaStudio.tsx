"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  createSeaEdition, DEFAULT_SEA_SEED_V2, describeSea, HOME_WATER, SEA_PRESETS, normaliseSeaSeed, renderSeaPlate,
  seedFromSettings, settingsFromSeed, type SeaSettings,
} from "@/lib/sea-edition";
import styles from "./SeaStudio.module.css";

type Control = { key: keyof SeaSettings; label: string; hint: string; low: string; high: string };

const controls: Control[] = [
  { key: "swell", label: "Swell", hint: "How high the sea stands.", low: "Glassy", high: "Storm-high" },
  { key: "heading", label: "Heading", hint: "Which way the sea runs.", low: "Left", high: "Right" },
  { key: "character", label: "Character", hint: "Long and rolling, or short and cross-running.", low: "Rolling", high: "Choppy" },
  { key: "variation", label: "Variation", hint: "Another arrangement of crests in the same kind of sea.", low: "A", high: "Z" },
];


const randomByte = () => {
  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0];
};

export default function SeaStudio({ seed, version }: { seed: string; version: "1" | "2" }) {
  const [settings, setSettings] = useState<SeaSettings>(() => settingsFromSeed(version === "2" ? seed : DEFAULT_SEA_SEED_V2));
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fieldId = useId();

  const current = seedFromSettings(settings);
  const shown = useDeferredValue(current);
  const edition = useMemo(() => createSeaEdition(shown, "2"), [shown]);
  // The same function prints the plate, so the preview is exactly what is kept.
  const plate = useMemo(() => renderSeaPlate(edition), [edition]);
  const words = describeSea(edition.settings!);
  const sailing = version === "2" && seed === current;
  const query = `seed=${current}&version=2`;

  const apply = (next: SeaSettings) => { setSettings(next); setDraft(null); setCopied(false); };
  const update = (key: keyof SeaSettings, value: number) => apply({ ...settings, [key]: value });
  const typed = draft ?? current;
  const typedValid = normaliseSeaSeed(typed) !== null;

  return (
    <section id="sea-studio" className={styles.studio} aria-labelledby="sea-studio-title">
      <div className={styles.top}><span>The sea studio</span><span>Make it · See it · Keep it</span></div>
      <div className={styles.lead}>
        <h2 id="sea-studio-title">Make a sea. <br /><em>Keep the drawing.</em></h2>
        <div>
          <p>The sea above is built from six waves and a seed, eight characters long. Those eight characters are four settings written in hexadecimal. Change a setting and the sea changes, along with the drawing of it below.</p>
          <ol className={styles.steps}>
            <li><b>Make it.</b> Move a setting, roll the dice, or start from a preset.</li>
            <li><b>See it.</b> The plate redraws as you go. It is the very drawing that gets printed.</li>
            <li><b>Keep it.</b> Print the plate, save it as a file, or sail your sea on this page.</li>
          </ol>
        </div>
      </div>

      <div className={styles.workbench}>
        <form className={styles.controls} onSubmit={event => event.preventDefault()} aria-label="Sea settings">
          <fieldset>
            <legend>Start from</legend>
            <div className={styles.chips}>
              {SEA_PRESETS.map(preset => <button type="button" key={preset.name} onClick={() => apply(preset.settings)}>{preset.name}</button>)}
              <button type="button" onClick={() => apply(HOME_WATER)}>Home water</button>
              <button type="button" className={styles.dice} onClick={() => apply({ swell: randomByte(), heading: randomByte(), character: randomByte(), variation: randomByte() })}>Roll the dice</button>
            </div>
          </fieldset>

          <fieldset>
            <legend>Shape it</legend>
            {controls.map(({ key, label, hint, low, high }) => {
              const id = `${fieldId}-${key}`;
              const reading = key === "variation" ? `No. ${settings.variation + 1} of 256` : describeSea(settings)[key];
              return <div className={styles.setting} key={key}>
                <div className={styles.settingHead}><label htmlFor={id}>{label}</label><output htmlFor={id} aria-live="off">{reading}</output></div>
                <input id={id} type="range" min={0} max={255} step={1} value={settings[key]} aria-valuetext={reading} aria-describedby={`${id}-hint`} onChange={event => update(key, Number(event.target.value))} />
                <div className={styles.ends} aria-hidden="true"><span>{low}</span><span>{high}</span></div>
                <p id={`${id}-hint`} className={styles.hint}>{hint}</p>
              </div>;
            })}
          </fieldset>

          <fieldset>
            <legend>Or type a seed</legend>
            <label htmlFor={`${fieldId}-seed`} className={styles.seedLabel}>Eight characters, 0–9 and a–f</label>
            <div className={styles.seedRow}>
              <input id={`${fieldId}-seed`} className={styles.seedInput} type="text" inputMode="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={8} value={typed} aria-invalid={!typedValid} aria-describedby={`${fieldId}-seed-note`}
                onChange={event => {
                  const value = event.target.value.toLowerCase();
                  setDraft(value);
                  const valid = normaliseSeaSeed(value);
                  if (valid) { setSettings(settingsFromSeed(valid)); setCopied(false); }
                }}
                onBlur={() => setDraft(null)} />
            </div>
            <p id={`${fieldId}-seed-note`} className={styles.hint} role={typedValid ? undefined : "alert"}>{typedValid ? "Each pair of characters is one setting, in the order above." : "Not yet a seed: it needs exactly eight characters from 0–9 and a–f."}</p>
          </fieldset>
        </form>

        <div className={styles.result}>
        <figure className={styles.plate}>
          <div className={styles.plateFrame} role="img" aria-label={`Engraved drawing of the sea with seed ${shown}: ${words.sentence}.`} dangerouslySetInnerHTML={{ __html: plate }} />
          <figcaption>
            <p className={styles.seedLine}><span>Seed</span> <code>{shown.slice(0, 2)}<i>{shown.slice(2, 4)}</i>{shown.slice(4, 6)}<i>{shown.slice(6, 8)}</i></code></p>
            <p role="status" className={styles.sentence}>{words.sentence}</p>
          </figcaption>
        </figure>

        <div className={styles.keep}>
          <h3>Keep it</h3>
          <div className={styles.actions}>
            <a className={styles.primary} href={`/plate?${query}&print=1`} target="_blank" rel="noopener noreferrer">Print this plate <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
            <a href={`/api/sea-edition/print?${query}&download=1`} download>Save as SVG</a>
            {sailing
              ? <span className={styles.sailing}>You are sailing this sea</span>
              : <Link prefetch={false} href={`/?${query}`}>Sail this sea <span aria-hidden="true">↑</span></Link>}
            <button type="button" onClick={async () => {
              try { await navigator.clipboard.writeText(`${location.origin}/?${query}`); setCopied(true); } catch { setCopied(false); }
            }}>Copy link</button>
          </div>
          <p className={styles.copied} role="status">{copied ? "Link copied. Anyone who opens it sails this sea." : ""}</p>
        </div>
        </div>
      </div>

      <details className={styles.mechanism}>
        <summary>Inside the sea</summary>
        <div>
          <div>
            <p className={styles.equation}>h = ∑ Aᵢ sin(kᵢ · x − ωᵢt + φᵢ)</p>
            <p>One height field supplies the surface, its slope, the ship’s attitude, and the engraved plate. Scrolling changes the way it is seen.</p>
            <p>The seed’s four pairs set the whole sea: <b>swell</b> scales every wave’s height, <b>heading</b> turns the sea, <b>character</b> moves energy between long and short waves and how much they cross, and <b>variation</b> picks the arrangement of crests.</p>
          </div>
          <div>
            <p>The scene is an authored mathematical study. Its lighting and wake are visual approximations; it is not a real ocean observation or a fluid simulation.</p>
            <p><a href={`/api/sea-edition?${query}`} target="_blank" rel="noopener noreferrer">Read this sea’s six waves <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a></p>
          </div>
        </div>
      </details>
    </section>
  );
}
