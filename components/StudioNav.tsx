"use client";

import NotebookLink from "@/components/NotebookLink";
import { site } from "@/content/site";
import { usePathname } from "next/navigation";

const pagesOf: Record<string, string> = { "#work": "/work", "/blog": "/blog" };

const items = site.nav.map(({ label, href }) => ({
  label,
  href: href.startsWith("#") ? `/${href}` : href,
  pages: pagesOf[href],
}));

export default function StudioNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Studio">
      {items.map(({ label, href, pages }) => (
        <NotebookLink
          key={href}
          href={href}
          aria-current={
            pages && pathname.startsWith(pages) ? (pathname === href ? "page" : "true") : undefined
          }
        >
          {label}
        </NotebookLink>
      ))}
    </nav>
  );
}
