"use client";

import { useState, type ReactNode } from "react";
import { copyText } from "./copy-text";

type Props = { text: string; done: string; className?: string; children: ReactNode };

export default function CopyButton({ text, done, className, children }: Props) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={async () => setCopied(await copyText(text))}
      >
        {children}
      </button>
      <span role="status">{copied ? done : ""}</span>
    </>
  );
}
