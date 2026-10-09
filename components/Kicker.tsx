import type { ReactNode } from "react";
import section from "./Section.module.css";

type Props = { id?: string; className?: string; children: ReactNode };

export default function Kicker({ id, className = section.kicker, children }: Props) {
  return (
    <p id={id} className={className} data-arrive>
      {children}
    </p>
  );
}
