export type Destination = {
  label: string;
  href: string;
  blurb: string;
  scope: string;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  href: string;
  caseStudy: string;
};

export const site = {
  name: "Maxsash Studio",
  tagline: "software, games, and tools",
  owner: "Yash",

  description:
    "Maxsash Studio is where I keep the things I build — applications, games, " +
    "and small tools — alongside notes on how they were made.",

  url: "https://www.maxsash.com",

  repo: "maxsash/web",

  links: {
    portfolio: "https://ctrl-alt-yash.github.io/portfolio/",
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
    scope: "Experience & projects",
  },
  {
    label: "GitHub",
    href: site.links.github,
    blurb: "Code, experiments, and public repositories.",
    scope: "Code & repositories",
  },
];

export const projects: Project[] = [
  {
    slug: "household-hub",
    title: "Household Hub",
    summary:
      "Rent, tenant records, and household spending in one place. Track payments, plan rent increases, and turn handwritten expense slips into entries you review before saving.",
    year: "2026",
    href: "https://tenant-management-2my6.vercel.app/",
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/tenant-manager.html",
  },
  {
    slug: "wedding-photo-platform",
    title: "Wedding Photo Platform",
    summary:
      "A wedding told in chapters, photo reels, and albums. An offline photo pipeline removes duplicates and groups faces so guests can find their photographs. The public demo hides faces for privacy.",
    year: "2026",
    href: "https://wedding-demo-teal.vercel.app/",
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/wedding-site.html",
  },
];
