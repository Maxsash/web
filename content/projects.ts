import type { SystemDrawing } from "@/lib/system-drawing";

type Screenshot = { kind: "image"; src: string; alt: string; caption: string; sizes: string };
type Drawing = { kind: "drawing"; drawing: SystemDrawing; alt: string };

export type Project = {
  slug: string;
  title: string;
  kind: "client" | "personal";
  headline: string;
  kicker: string;
  tagline?: readonly [string, string];
  summary: string;
  role: string;
  construction: string;
  visual: Screenshot | Drawing;
  plate?: { title: string; note: string };
  demo?: { href: string; label: string };
  caseStudy: string;
};

export const projects: Project[] = [
  {
    slug: "velora-rights",
    title: "Velora Rights",
    kind: "client",
    headline: "Built to be found.",
    kicker: "A client's law practice",
    tagline: ["Found through search.", "Edited without a developer."],
    summary:
      "The website for an Indian intellectual property law practice, built to be found by search engines and AI assistants. Since launch, organic search alone has brought in client enquiries and internship applications. The owner publishes new articles as Markdown, without a developer.",
    role: "Solo developer",
    construction: "Next.js · MDX · JSON-LD",
    visual: {
      kind: "image",
      src: "/images/work/velora-rights.webp",
      alt: "The Velora Rights homepage: “Protecting What You Create.”, practical legal guidance on copyright, trademarks, AI and identity rights in India.",
      caption: "The live site. Every page is static, with its full text in the HTML.",
      sizes: "(max-width: 768px) 90vw, 52vw",
    },
    plate: { title: "velorarights.com", note: "Live site · 2026" },
    demo: { href: "https://velorarights.com", label: "Visit velorarights.com" },
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/velora-rights.html",
  },
  {
    slug: "intrusion-detection",
    title: "Real-time Intrusion Detection",
    kind: "client",
    headline: "A cable that raises the alarm.",
    kicker: "A client's security system",
    summary:
      "Fibre-optic sensing hardware, turned into live security alerts for critical infrastructure: anomalies caught on site, people alerted on WhatsApp, Telegram and email, every event on a live map beside the CCTV. I led the architecture and the team, through to on-site deployment.",
    role: "Founding engineer, lead developer",
    construction: "Spring Boot · InfluxDB · PostgreSQL · AWS · Raspberry Pi · React",
    visual: {
      kind: "drawing",
      drawing: {
        bands: [
          {
            label: "On site",
            nodes: [
              { id: "sensors", label: "Fibre-optic sensors", note: "high-frequency data" },
              { id: "edge", label: "Edge node", note: "Raspberry Pi · anomalies" },
            ],
          },
          {
            label: "Cloud · AWS",
            nodes: [
              { id: "storage", label: "Storage", note: "InfluxDB · PostgreSQL" },
              { id: "backend", label: "Backend", note: "Spring Boot · events" },
            ],
          },
          {
            label: "To people",
            nodes: [
              { id: "alerts", label: "Alerts", note: "WhatsApp · Telegram · email" },
              { id: "map", label: "Live map", note: "React · CCTV video" },
            ],
          },
        ],
        links: [
          ["sensors", "edge"],
          ["edge", "backend"],
          ["backend", "storage"],
          ["backend", "alerts"],
          ["backend", "map"],
        ],
      },
      alt: "System drawing. On site, fibre-optic sensors feed an edge node that finds anomalies. In the cloud, on AWS, a Spring Boot backend keeps sensor readings in InfluxDB and events in PostgreSQL, sends alerts to people and drives a live map with CCTV video.",
    },
    plate: { title: "System drawing", note: "Private: no screenshots" },
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/intrusion-detection.html",
  },
  {
    slug: "business-operations",
    title: "Business Operations Platform",
    kind: "client",
    headline: "Off paper, into one system.",
    kicker: "A client's SaaS product",
    summary:
      "Takes traditional businesses off paper and spreadsheets: modules each business switches on, one data model, dashboards for every role, and AI that sorts email enquiries and drafts the replies so leads are not missed. I was the CTO and led the team.",
    role: "CTO, founding engineer",
    construction: "Python · React · PostgreSQL · LLMs",
    visual: {
      kind: "drawing",
      drawing: {
        bands: [
          {
            label: "Enquiries",
            nodes: [
              { id: "email", label: "Email enquiries", note: "inbound leads" },
              { id: "triage", label: "AI triage", note: "classify · draft replies" },
            ],
          },
          {
            label: "Modules, switched on per business",
            nodes: [
              { id: "purchasing", label: "Purchasing", span: 1 },
              { id: "inventory", label: "Inventory", span: 1 },
              { id: "analytics", label: "Analytics", span: 1 },
              { id: "sales", label: "Sales", span: 1 },
            ],
          },
          {
            label: "One data model",
            nodes: [{ id: "data", label: "PostgreSQL", note: "each business kept apart", span: 4 }],
          },
          {
            label: "For each role",
            nodes: [
              { id: "dashboards", label: "Dashboards", note: "owner · manager · worker" },
              { id: "forecasts", label: "Forecasts", note: "segments · ROI" },
            ],
          },
        ],
        links: [
          ["email", "triage"],
          ["triage", "sales"],
          ["purchasing", "data"],
          ["inventory", "data"],
          ["analytics", "data"],
          ["sales", "data"],
          ["data", "dashboards"],
          ["data", "forecasts"],
        ],
      },
      alt: "System drawing. Email enquiries pass through AI triage into sales. Purchasing, inventory, analytics and sales modules, switched on per business, share one PostgreSQL data model that keeps each business apart. Dashboards for each role and forecasts read from it.",
    },
    plate: { title: "System drawing", note: "Private: no screenshots" },
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/modular-saas.html",
  },
  {
    slug: "household-hub",
    title: "Household Hub",
    kind: "personal",
    headline: "Household Hub.",
    kicker: "Everyday operations",
    tagline: ["A little less remembering.", "A little more living."],
    summary:
      "Rent, tenant records, and household spending in one place. Track payments, plan rent increases, and turn handwritten expense slips into entries you review before saving.",
    role: "Solo engineer",
    construction: "Next.js · Supabase · PostgreSQL",
    visual: {
      kind: "image",
      src: "/images/work/household-insights-light.webp",
      alt: "Household Hub public demo in light theme: expense Insights with upcoming household needs.",
      caption: "Invented household data. The private family app stays private.",
      sizes: "(max-width: 768px) 90vw, 42vw",
    },
    plate: { title: "Household insights", note: "Public demo · 2026" },
    demo: { href: "https://tenant-management-2my6.vercel.app/", label: "Try the public demo" },
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/tenant-manager.html",
  },
  {
    slug: "wedding-photo-platform",
    title: "Wedding Photo Platform",
    kind: "personal",
    headline: "A day, kept in chapters.",
    kicker: "A personal archive",
    summary:
      "A wedding told in chapters, photo reels, and albums. An offline photo pipeline removes duplicates and groups faces so guests can find their photographs. The public demo hides faces for privacy.",
    role: "Solo engineer",
    construction: "Next.js · Offline ML · Cloudflare R2",
    visual: {
      kind: "image",
      src: "/images/work/wedding-platform.webp",
      alt: "Wedding platform demo cover with a floral background and placeholder Bride and Groom names.",
      caption: "Sample names and dates. Faces hidden in the public demo.",
      sizes: "(max-width: 768px) 90vw, 42vw",
    },
    plate: { title: "The wedding demo", note: "Public demo · 2026" },
    demo: { href: "https://wedding-demo-teal.vercel.app/", label: "Explore the public demo" },
    caseStudy: "https://ctrl-alt-yash.github.io/portfolio/case-study/wedding-site.html",
  },
];
