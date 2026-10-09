export type Project = {
  slug: string;
  title: string;
  headline: { lead: string; emphasis: string };
  kicker: string;
  tagline?: readonly string[];
  summary: string;
  year: string;
  form: string;
  construction: string;
  image: { src: string; alt: string; caption: string; sizes: string };
  plate?: { title: string; note: string };
  href: string;
  demoLabel: string;
  caseStudy: string;
};

export const projects: Project[] = [
  {
    slug: "velora-rights",
    title: "Velora Rights",
    headline: { lead: "Built to be", emphasis: "found." },
    kicker: "A client's law practice",
    tagline: ["Found through search.", "Edited without a developer."],
    summary:
      "The website for an Indian intellectual property law practice, built to be found by search engines and AI assistants. Since launch, organic search alone has brought in client enquiries and internship applications. The owner publishes new articles as Markdown, without a developer.",
    year: "2026",
    form: "Client website",
    construction: "Next.js · MDX · JSON-LD",
    image: {
      src: "/images/work/velora-rights.webp",
      alt: "The Velora Rights homepage: “Protecting What You Create.”, practical legal guidance on copyright, trademarks, AI and identity rights in India.",
      caption: "The live site. Every page is static, with its full text in the HTML.",
      sizes: "(max-width: 768px) 90vw, 52vw",
    },
    plate: { title: "velorarights.com", note: "Live site · 2026" },
    href: "https://velorarights.com",
    demoLabel: "Visit velorarights.com",
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/velora-rights.html",
  },
  {
    slug: "household-hub",
    title: "Household Hub",
    headline: { lead: "Household", emphasis: "Hub." },
    kicker: "Everyday operations",
    tagline: ["A little less remembering.", "A little more living."],
    summary:
      "Rent, tenant records, and household spending in one place. Track payments, plan rent increases, and turn handwritten expense slips into entries you review before saving.",
    year: "2026",
    form: "Household web app",
    construction: "Next.js · Supabase · PostgreSQL",
    image: {
      src: "/images/work/household-insights-light.webp",
      alt: "Household Hub public demo in light theme: expense Insights with upcoming household needs.",
      caption: "Invented household data. The private family app stays private.",
      sizes: "(max-width: 768px) 90vw, 42vw",
    },
    plate: { title: "Household insights", note: "Public demo · 2026" },
    href: "https://tenant-management-2my6.vercel.app/",
    demoLabel: "Try the public demo",
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/tenant-manager.html",
  },
  {
    slug: "wedding-photo-platform",
    title: "Wedding Photo Platform",
    headline: { lead: "A day, kept", emphasis: "in chapters." },
    kicker: "A personal archive",
    summary:
      "A wedding told in chapters, photo reels, and albums. An offline photo pipeline removes duplicates and groups faces so guests can find their photographs. The public demo hides faces for privacy.",
    year: "2026",
    form: "Wedding photo platform",
    construction: "Next.js · Offline ML · Cloudflare R2",
    image: {
      src: "/images/work/wedding-platform.webp",
      alt: "Wedding platform demo cover with a floral background and placeholder Bride and Groom names.",
      caption: "Sample names and dates. Faces hidden in the public demo.",
      sizes: "(max-width: 768px) 90vw, 42vw",
    },
    href: "https://wedding-demo-teal.vercel.app/",
    demoLabel: "Explore the public demo",
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/wedding-site.html",
  },
];
