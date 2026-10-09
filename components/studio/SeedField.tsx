import { respond } from "@/components/feedback/respond";
import { normaliseSeaSeed } from "@/lib/sea/seed";
import styles from "./SeaStudio.module.css";

const SEED_LENGTH = 8;

const typed = (value: string) =>
  normaliseSeaSeed(value) ? "success" : value.length === SEED_LENGTH ? "refusal" : "key";

type Props = {
  id: string;
  value: string;
  valid: boolean;
  onType: (value: string) => void;
  onBlur: () => void;
};

export default function SeedField({ id, value, valid, onType, onBlur }: Props) {
  return (
    <>
      <label htmlFor={`${id}-seed`} className={styles.seedLabel}>
        Eight characters, 0–9 and a–f
      </label>
      <div className={styles.seedRow}>
        <input
          id={`${id}-seed`}
          className={styles.seedInput}
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={SEED_LENGTH}
          value={value}
          aria-invalid={!valid}
          aria-describedby={`${id}-seed-note`}
          onChange={(event) => {
            respond(typed(event.target.value));
            onType(event.target.value);
          }}
          onBlur={onBlur}
        />
      </div>
      <p id={`${id}-seed-note`} className={styles.hint} role={valid ? undefined : "alert"}>
        {valid
          ? "Each pair of characters is one setting, in the order above."
          : "Not yet a seed: it needs exactly eight characters from 0–9 and a–f."}
      </p>
    </>
  );
}
