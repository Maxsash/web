import Link from "next/link";
import styles from "./SeaStudio.module.css";

type Props = {
  query: string;
  sailing: boolean;
  copied: boolean;
  onCopied: (copied: boolean) => void;
};

export default function KeepActions({ query, sailing, copied, onCopied }: Props) {
  return (
    <div className={styles.keep}>
      <h3>Keep it</h3>
      <div className={styles.actions}>
        <a
          className={styles.primary}
          href={`/plate?${query}&print=1`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Print this plate <span aria-hidden="true">↗</span>
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
        <a href={`/api/sea-edition/print?${query}&download=1`} download>
          Save as SVG
        </a>
        {sailing ? (
          <span className={styles.sailing}>You are sailing this sea</span>
        ) : (
          <Link prefetch={false} href={`/?${query}`}>
            Sail this sea <span aria-hidden="true">↑</span>
          </Link>
        )}
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(`${location.origin}/?${query}`);
              onCopied(true);
            } catch {
              onCopied(false);
            }
          }}
        >
          Copy link
        </button>
      </div>
      <p className={styles.copied} role="status">
        {copied ? "Link copied. Anyone who opens it sails this sea." : ""}
      </p>
    </div>
  );
}
