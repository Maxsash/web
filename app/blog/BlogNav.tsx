"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Work", href: "/#work" },
  { label: "Sea studio", href: "/#sea-studio" },
  { label: "Notebook", href: "/blog" },
  { label: "Elsewhere", href: "/#elsewhere" },
];

/** The same four places as the studio's own navigation, with the current one marked. */
export default function BlogNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Studio">
      {items.map(({ label, href }) => (
        <Link
          prefetch={false}
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
        </Link>
      ))}
    </nav>
  );
}
