type Destination = {
  label: string;
  href: string;
  blurb: string;
  scope: string;
};

const title = "Founding engineer";

export const site = {
  name: "Maxsash Studio",
  tagline: "web products, built end to end",
  owner: "Yash Shrivastava",
  title,
  role: `${title}, backend and real-time systems`,
  portrait: "/images/yash-shrivastava.webp",
  home: "Tikamgarh · 24.74° N, 78.83° E",

  description:
    "Maxsash Studio is Yash Shrivastava's one-person studio: web products built end to end, " +
    "from the first sketch to a deployed app. Open to freelance work.",

  url: "https://www.maxsash.com",

  repo: "maxsash/web",

  links: {
    portfolio: "https://ctrl-alt-yash.github.io/portfolio/",
    github: "https://github.com/ctrl-alt-yash",
    linkedin: "https://www.linkedin.com/in/maxsash",
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
    label: "LinkedIn",
    href: site.links.linkedin,
    blurb: "The professional profile: roles, experience, and updates.",
    scope: "Professional profile",
  },
  {
    label: "GitHub",
    href: site.links.github,
    blurb: "Code, experiments, and public repositories.",
    scope: "Code & repositories",
  },
];
