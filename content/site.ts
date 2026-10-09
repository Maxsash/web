type Destination = {
  label: string;
  href: string;
  blurb: string;
  scope: string;
};

export const site = {
  name: "Maxsash Studio",
  tagline: "web products, built end to end",
  owner: "Yash Shrivastava",
  role: "Software engineer",

  description:
    "Maxsash Studio is Yash Shrivastava's one-person studio: web products built end to end, " +
    "from the first sketch to a deployed app. Open to freelance work.",

  url: "https://www.maxsash.com",

  repo: "maxsash/web",

  links: {
    portfolio: "https://ctrl-alt-yash.github.io/portfolio/",
    github: "https://github.com/ctrl-alt-yash",
    repo: "https://github.com/maxsash/web",
    email: "mailto:yash@maxsash.com",
  },

  nav: [
    { label: "Services", href: "#services" },
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Notebook", href: "/blog" },
    { label: "Contact", href: "#contact" },
  ],

  afterHero: { id: "services", label: "services" },
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
