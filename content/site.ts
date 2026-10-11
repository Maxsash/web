const title = "Founding engineer";
const email = "yash@maxsash.com";
const whatsapp = "maxsash";
const offer = "websites and web apps";
const promise = "built end to end";

export const site = {
  name: "Maxsash Studio",
  offer,
  promise,
  tagline: `${offer}, ${promise}`,
  owner: "Yash Shrivastava",
  title,
  role: `${title}, backend and real-time systems`,
  portrait: "/images/yash-shrivastava.webp",
  home: "Tikamgarh · 24.74° N, 78.83° E",
  email,
  whatsapp: `@${whatsapp}`,
  founded: "2026-06",
  shareImage: {
    url: "/images/studio-card-v1.jpg",
    width: 1200,
    height: 630,
    alt: "Maxsash Studio. Sea. Ship. Math. Websites and web apps, built end to end, beside a gaff cutter on the Living Atlas sea.",
  },
  colors: { paper: "#eef0ea", night: "#0b1c26" },
  logo: "/icon-512.png",

  description:
    `Maxsash Studio is Yash Shrivastava's one-person studio: ${offer} ${promise}, ` +
    "from the first plan to the launch, with a focus on backend and real-time systems. Open to freelance work.",

  url: "https://www.maxsash.com",

  repo: "maxsash/web",

  links: {
    portfolio: "https://ctrl-alt-yash.github.io/portfolio/",
    github: "https://github.com/ctrl-alt-yash",
    linkedin: "https://www.linkedin.com/in/maxsash",
    studioLinkedin: "https://www.linkedin.com/company/maxsash/",
    instagram: "https://www.instagram.com/maxsashstudio/",
    whatsapp: `https://wa.me/${whatsapp}`,
    repo: "https://github.com/maxsash/web",
    email: `mailto:${email}`,
  },

  nav: [
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Notebook", href: "/blog" },
    { label: "Contact", href: "#contact" },
  ],

  afterHero: { id: "work", label: "work" },
} as const;

export const profiles = [
  { label: "Portfolio", href: site.links.portfolio },
  { label: "LinkedIn", href: site.links.linkedin },
  { label: "GitHub", href: site.links.github },
] as const;

export const studioChannels = [
  { label: "WhatsApp", href: site.links.whatsapp },
  { label: "Instagram", href: site.links.instagram },
  { label: "LinkedIn", href: site.links.studioLinkedin },
] as const;
