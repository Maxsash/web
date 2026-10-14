import PageLink from "@/components/PageLink";
import { copyText } from "@/components/copy-text";
import styles from "./SeaStudio.module.css";
import { track } from "../telemetry/actions";

type Props = {
  query: string;
  copied: boolean;
  onCopied: (copied: boolean) => void;
};

export default function KeepActions({ query, copied, onCopied }: Props) {
  return (
    <div className={styles.keep}>
      <h3>Keep it</h3>
      <div className={styles.actions}>
        <a
          className={styles.primary}
          data-press="print"
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
        <PageLink prefetch={false} href={`/?${query}`} data-press="sail">
          Sail this sea <span aria-hidden="true">→</span>
        </PageLink>
        <button
          type="button"
          data-press="none"
          className={styles.copy}
          onClick={async () => {
            const success = await copyText(`${location.origin}/?${query}`, "share");
            onCopied(success);
            if (success) track("studio_action", { action: "copy", setting: "none" });
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
