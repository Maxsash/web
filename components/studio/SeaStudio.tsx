"use client";

import { useId } from "react";
import { HOME_WATER, SEA_PRESETS } from "@/lib/sea/presets";
import KeepActions from "./KeepActions";
import SeedField from "./SeedField";
import SettingSlider, { CONTROLS } from "./SettingSlider";
import { randomSettings, useSeaSettings } from "./useSeaSettings";
import styles from "./SeaStudio.module.css";

export default function SeaStudio({ seed, version }: { seed: string; version: "1" | "2" }) {
  const fieldId = useId();
  const sea = useSeaSettings(seed, version);

  return (
    <section id="sea-studio" className={styles.studio} aria-labelledby="sea-studio-title">
      <div className={styles.top}>
        <span>The sea studio</span>
        <span>Make it · See it · Keep it</span>
      </div>
      <div className={styles.lead}>
        <h2 id="sea-studio-title">
          Make a sea. <br />
          <em>Keep the drawing.</em>
        </h2>
        <p>
          The sea above is built from six waves and a seed, eight characters long. Those eight
          characters are four settings written in hexadecimal. Change a setting and the sea changes,
          along with the drawing of it below: the very drawing that gets printed.
        </p>
      </div>

      <div className={styles.workbench}>
        <form
          className={styles.controls}
          onSubmit={(event) => event.preventDefault()}
          aria-label="Sea settings"
        >
          <fieldset>
            <legend>Start from</legend>
            <div className={styles.chips}>
              {SEA_PRESETS.map((preset) => (
                <button type="button" key={preset.name} onClick={() => sea.apply(preset.settings)}>
                  {preset.name}
                </button>
              ))}
              <button type="button" onClick={() => sea.apply(HOME_WATER)}>
                Home water
              </button>
              <button
                type="button"
                className={styles.dice}
                onClick={() => sea.apply(randomSettings())}
              >
                Roll the dice
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend>Shape it</legend>
            {CONTROLS.map((control) => (
              <SettingSlider
                key={control.key}
                control={control}
                id={`${fieldId}-${control.key}`}
                settings={sea.settings}
                onChange={sea.update}
              />
            ))}
          </fieldset>

          <fieldset>
            <legend>Or type a seed</legend>
            <SeedField
              id={fieldId}
              value={sea.typed}
              valid={sea.typedValid}
              onType={sea.type}
              onBlur={sea.endTyping}
            />
          </fieldset>
        </form>

        <div className={styles.result}>
          <figure className={styles.plate}>
            <div
              className={styles.plateFrame}
              role="img"
              aria-label={`Engraved drawing of the sea with seed ${sea.shown}: ${sea.words.sentence}.`}
              dangerouslySetInnerHTML={{ __html: sea.plate }}
            />
            <figcaption>
              <p className={styles.seedLine}>
                <span>Seed</span>{" "}
                <code>
                  {sea.shown.slice(0, 2)}
                  <i>{sea.shown.slice(2, 4)}</i>
                  {sea.shown.slice(4, 6)}
                  <i>{sea.shown.slice(6, 8)}</i>
                </code>
              </p>
              <p role="status" className={styles.sentence}>
                {sea.words.sentence}
              </p>
            </figcaption>
          </figure>

          <KeepActions
            query={sea.query}
            sailing={sea.sailing}
            copied={sea.copied}
            onCopied={sea.setCopied}
          />
        </div>
      </div>

      <details className={styles.mechanism}>
        <summary>Inside the sea</summary>
        <div>
          <div>
            <p className={styles.equation}>h = ∑ Aᵢ sin(kᵢ · x − ωᵢt + φᵢ)</p>
            <p>
              One height field supplies the surface, its slope, the ship’s attitude, and the
              engraved plate. Scrolling changes the way it is seen.
            </p>
            <p>
              The seed’s four pairs set the whole sea: <b>swell</b> scales every wave’s height,{" "}
              <b>heading</b> turns the sea, <b>character</b> moves energy between long and short
              waves and how much they cross, and <b>variation</b> picks the arrangement of crests.
            </p>
          </div>
          <div>
            <p>
              The scene is an authored mathematical study. Its lighting and wake are visual
              approximations; it is not a real ocean observation or a fluid simulation.
            </p>
            <p>
              <a href={`/api/sea-edition?${sea.query}`} target="_blank" rel="noopener noreferrer">
                Read this sea’s six waves <span aria-hidden="true">↗</span>
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}
