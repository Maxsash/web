import type { IconName } from "@/components/Icon";

/* ---------------------------------------------------------------------------
 * Everything the site says about itself lives here.
 *
 * The projects and writing entries below are placeholders with the right shape,
 * so the layout can be seen.  Replace them; nothing else reads from them.
 * ------------------------------------------------------------------------- */

export type Destination = {
  label: string;
  href: string;
  blurb: string;
  icon: IconName;
  /** Leaves the site: gets rel/target and the outbound arrow. */
  external?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  /** Short, lowercase; rendered as monospace chips. */
  tags: string[];
  year: string;
  href?: string;
  repo?: string;
  status: "sailing" | "in the yard" | "moored";
};

export type Note = {
  title: string;
  href: string;
  date: string;
  summary: string;
};

export const site = {
  name: "Maxsash Labs",
  tagline: "software, games, and tools",
  owner: "Yash",

  description:
    "Maxsash Labs is where I keep the things I build — applications, games, " +
    "and small tools — alongside notes on how they were made.",

  /** The blurb under the wordmark in the hero. */
  intro:
    "I build software the way a boat gets built: measured twice, fair curves, " +
    "nothing bolted on that does not carry load. This is the harbour for it all.",

  url: "https://www.maxsash.com",

  /* TODO: point these at the real destinations. */
  links: {
    personal: "https://www.maxsash.com",
    resume: "/resume.pdf",
    blog: "/blog",
    github: "https://github.com/maxsash",
    email: "mailto:hello@maxsash.com",
  },

  nav: [
    { label: "Work", href: "#work" },
    { label: "Writing", href: "#writing" },
    { label: "Elsewhere", href: "#elsewhere" },
  ],
} as const;

export const destinations: Destination[] = [
  {
    label: "Personal site",
    href: site.links.personal,
    blurb: "Who I am away from the workbench.",
    icon: "globe",
    external: true,
  },
  {
    label: "Résumé",
    href: site.links.resume,
    blurb: "Where I have worked and what I shipped.",
    icon: "resume",
  },
  {
    label: "Writing",
    href: site.links.blog,
    blurb: "Notes on building things, in longer form.",
    icon: "writing",
  },
  {
    label: "GitHub",
    href: site.links.github,
    blurb: "Source for most of what is listed here.",
    icon: "github",
    external: true,
  },
  {
    label: "Email",
    href: site.links.email,
    blurb: "The reliable way to reach me.",
    icon: "mail",
  },
];

/* TODO: replace with real projects. */
export const projects: Project[] = [
  {
    slug: "first-project",
    title: "First project",
    summary:
      "A one or two sentence description of what it does and who it is for. " +
      "Keep it concrete — what problem it solves reads better than what it is built with.",
    tags: ["typescript", "web"],
    year: "2026",
    href: "#",
    repo: "#",
    status: "sailing",
  },
  {
    slug: "second-project",
    title: "Second project",
    summary:
      "Another placeholder. Entries without a href render as plain cards, so " +
      "unreleased work still has a home on the page.",
    tags: ["game", "godot"],
    year: "2025",
    status: "in the yard",
  },
  {
    slug: "third-project",
    title: "Third project",
    summary:
      "Tags are free-form. Two or three carry best; more and the chips start " +
      "competing with the title for attention.",
    tags: ["automation", "cli"],
    year: "2025",
    repo: "#",
    status: "moored",
  },
];

/* TODO: replace with real posts, or wire this to the blog. */
export const notes: Note[] = [
  {
    title: "A first note",
    href: "#",
    date: "2026-08-14",
    summary: "What this one is about, in a line.",
  },
  {
    title: "A second note",
    href: "#",
    date: "2026-06-02",
    summary: "Short enough that the list stays scannable.",
  },
];
