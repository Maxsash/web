type Destination = {
  label: string;
  href: string;
  blurb: string;
  scope: string;
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
