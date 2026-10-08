import styles from "./SeaStudio.module.css";

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
          maxLength={8}
          value={value}
          aria-invalid={!valid}
          aria-describedby={`${id}-seed-note`}
          onChange={(event) => onType(event.target.value)}
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
