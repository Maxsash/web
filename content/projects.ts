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
  plateTitle?: string;
  href: string;
  demoLabel: string;
  caseStudy: string;
};

export const projects: Project[] = [
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
      sizes: "(max-width: 768px) 90vw, 52vw",
    },
    plateTitle: "Household insights",
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
