"use client";

import NotebookLink from "@/components/NotebookLink";
import { site } from "@/content/site";
import { usePathname } from "next/navigation";

const items = site.nav.map(({ label, href }) => ({
  label,
  href: href.startsWith("#") ? `/${href}` : href,
}));

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
