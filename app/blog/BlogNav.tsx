"use client";

import NotebookLink from "@/components/NotebookLink";
import { usePathname } from "next/navigation";

const items = [
  { label: "Work", href: "/#work" },
  { label: "Sea studio", href: "/#sea-studio" },
  { label: "Notebook", href: "/blog" },
  { label: "Elsewhere", href: "/#elsewhere" },
];

export default function BlogNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Studio">
      {items.map(({ label, href }) => (
        <NotebookLink
          key={href}
          href={href}
          aria-current={
            href === "/blog" && pathname.startsWith("/blog")
              ? pathname === "/blog"
                ? "page"
                : "true"
              : undefined
          }
        >
          {label}
        </NotebookLink>
      ))}
    </nav>
  );
}
