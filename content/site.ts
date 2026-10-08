import type { IconName } from "@/components/Icon";

/* Public studio content. Project facts are checked against the supplied demos,
 * portfolio case studies and local project documentation. */

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
  caseStudy?: string;
  status: "sailing" | "in the yard" | "moored";
};

export const site = {
  name: "Maxsash Studio",
  tagline: "software, games, and tools",
  owner: "Yash",

  description:
    "Maxsash Studio is where I keep the things I build — applications, games, " +
    "and small tools — alongside notes on how they were made.",

  /** The blurb under the wordmark in the hero. */
  intro:
    "I build software the way a boat gets built: measured twice, fair curves, " +
    "nothing bolted on that does not carry load. This is the harbour for it all.",

  url: "https://www.maxsash.com",

  /** This site's own public repository, whose commit log the shoreline shows. */
  repo: "maxsash/web",

  /* The portfolio carries professional background and project case studies. */
  links: {
    portfolio: "https://ctrl-alt-yash.github.io/portfolio/",
    blog: "/blog",
    github: "https://github.com/ctrl-alt-yash",
    repo: "https://github.com/maxsash/web",
    email: "mailto:yash@maxsash.com",
  },

  nav: [
    { label: "Work", href: "#work" },
    { label: "Sea studio", href: "#sea-studio" },
    { label: "Notebook", href: "/blog" },
    { label: "Elsewhere", href: "#elsewhere" },
  ],
} as const;

export const destinations: Destination[] = [
  {
    label: "Portfolio",
    href: site.links.portfolio,
    blurb: "Experience, skills, and the stories behind the projects.",
    icon: "resume",
    external: true,
  },
  {
    label: "GitHub",
    href: site.links.github,
    blurb: "Code, experiments, and public repositories.",
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

export const projects: Project[] = [
  {
    slug: "household-hub",
    title: "Household Hub",
    summary:
      "Rent, tenant records, and household spending in one place. Track payments, plan rent increases, and turn handwritten expense slips into entries you review before saving.",
    tags: ["Next.js", "Supabase", "slip scanning"],
    year: "2026",
    href: "https://tenant-management-2my6.vercel.app/",
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/tenant-manager.html",
    status: "sailing",
  },
  {
    slug: "wedding-photo-platform",
    title: "Wedding Photo Platform",
    summary:
      "A wedding told in chapters, photo reels, and albums. An offline photo pipeline removes duplicates and groups faces so guests can find their photographs. The public demo hides faces for privacy.",
    tags: ["Next.js", "offline ML", "Cloudflare R2"],
    year: "2026",
    href: "https://wedding-demo-teal.vercel.app/",
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/wedding-site.html",
    status: "sailing",
  },
];
