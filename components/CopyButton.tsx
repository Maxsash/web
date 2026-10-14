"use client";

import { useState, type ReactNode } from "react";
import { copyText } from "./copy-text";
import { track } from "./telemetry/actions";

type Props = {
  text: string;
  done: string;
  className?: string;
  children: ReactNode;
  contact?: boolean;
};

export default function CopyButton({ text, done, className, children, contact }: Props) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className}
        data-press="none"
        onClick={async () => {
          const success = await copyText(text);
          setCopied(success);
          if (success && contact)
            track("contact_action", { channel: "email", action: "copy", placement: "contact" });
        }}
      >
        {children}
      </button>
      <span role="status">{copied ? done : ""}</span>
    </>
  );
}
