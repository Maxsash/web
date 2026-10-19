import type { SystemDrawing } from "@/lib/system-drawing";

type Plate = { title: string; note: string };
type Screenshot = Plate & { kind: "image"; src: string; alt: string; caption: string };
type Drawing = Plate & { kind: "drawing"; drawing: SystemDrawing; alt: string };
export type Visual = Screenshot | Drawing;

export type Project = {
  slug: string;
  title: string;
  kind: "client" | "personal";
  headline: string;
  kicker: string;
  tagline?: readonly [string, string];
  summary: string;
  description?: string;
  proof: string;
  role: string;
  period?: string;
  duration?: string;
  construction: string;
  visuals: [Visual, ...Visual[]];
  demo?: { href: string; label: string };
};

export const caseStudyPath = (slug: string) => `/work/${slug}`;
export const caseStudyTitle = ({ title, headline }: Project) =>
  `${title}: ${headline.replace(/\.$/, "")}`;
export const searchDescription = (project: Project) => project.description ?? project.summary;

export const projectShareImage = (project: Project) => {
  const screenshot = project.visuals.find((visual) => visual.kind === "image");
  if (screenshot) return { url: screenshot.src, width: 1200, height: 750, alt: screenshot.alt };
  const drawing = project.visuals.find((visual) => visual.kind === "drawing");
  return drawing
    ? {
        url: `/images/work/${project.slug}-drawing.webp`,
        width: 1200,
        height: 630,
        alt: drawing.alt,
      }
    : undefined;
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
      "The website for an Indian intellectual property law practice, a profession that may not advertise, built so search engines and AI assistants find it and its owner publishes without a developer.",
    description:
      "Website for an Indian IP law practice that may not advertise, built so search engines and AI assistants find it and its owner publishes without a developer.",
    proof: "In a single month, from search alone: five internship applications and a new client.",
    role: "Solo developer",
    period: "June – August 2026",
    construction: "Next.js · MDX · JSON-LD",
    visuals: [
      {
        kind: "drawing",
        title: "System drawing",
        note: "Live site · 2026",
        drawing: {
          bands: [
            {
              label: "Written by the owner",
              nodes: [
                { id: "markdown", label: "Markdown files", note: "from a template" },
                { id: "checks", label: "Build checks", note: "a mistake stops the deploy" },
              ],
            },
            {
              label: "Generated in advance",
              nodes: [
                {
                  id: "pages",
                  label: "Static pages",
                  note: "full text · JSON-LD · llms.txt · RSS",
                  span: 4,
                },
              ],
            },
            {
              label: "Read by",
              nodes: [
                { id: "search", label: "Search engines", note: "Google · Bing" },
                { id: "assistants", label: "AI assistants", note: "crawlers let in" },
              ],
            },
            {
              label: "From search alone",
              nodes: [
                {
                  id: "enquiries",
                  label: "Enquiries",
                  note: "a client · internship applications",
                  span: 4,
                },
              ],
            },
          ],
          links: [
            ["markdown", "checks"],
            ["checks", "pages"],
            ["pages", "search"],
            ["pages", "assistants"],
            ["search", "enquiries"],
            ["assistants", "enquiries"],
          ],
        },
        alt: "System drawing. The owner writes articles as Markdown files from a template, and build checks stop a deploy when one has a mistake. Every page is generated in advance with its full text, structured data, an llms.txt index and an RSS feed. Search engines and AI assistants read it, and enquiries come in from search alone.",
      },
      {
        kind: "image",
        src: "/images/work/velora-rights.webp",
        alt: "The Velora Rights homepage: “Protecting What You Create.”, practical legal guidance on copyright, trademarks, AI and identity rights in India.",
        caption: "The live site. Every page is static, with its full text in the HTML.",
        title: "velorarights.com",
        note: "Live site · 2026",
      },
    ],
    demo: { href: "https://velorarights.com", label: "Visit velorarights.com" },
  },
  {
    slug: "business-operations",
    title: "Business Operations Platform",
    kind: "client",
    headline: "Off paper, into one system.",
    kicker: "A client's SaaS product",
    summary:
      "Modular operations software for teams moving off paper: clients choose and pay for what they need, their data stays separate, and practical insights adapt to the modules they use.",
    description:
      "Modular operations software for teams moving off paper: clients pay for the modules they need, their data stays separate, and insights adapt to what they use.",
    proof: "Four businesses onboarded, with teams of 2 to 12.",
    role: "CTO, founding engineer",
    duration: "About six months",
    construction: "Python · React · PostgreSQL · LLMs",
    visuals: [
      {
        kind: "drawing",
        drawing: {
          bands: [
            {
              label: "Modules chosen by the business",
              nodes: [
                { id: "sales", label: "Sales", span: 1 },
                { id: "purchasing", label: "Buying", span: 1 },
                { id: "inventory", label: "Inventory", span: 1 },
                { id: "enquiries", label: "Enquiries", span: 1 },
              ],
            },
            {
              label: "Private business data",
              nodes: [
                {
                  id: "data",
                  label: "PostgreSQL",
                  note: "each business kept apart",
                  span: 4,
                },
              ],
            },
            {
              label: "Insights that adapt",
              nodes: [
                { id: "insights", label: "Insights", note: "adapt to selected modules" },
                { id: "dashboards", label: "Dashboards", note: "owner · manager · worker" },
              ],
            },
            {
              label: "Made for the people using it",
              nodes: [
                {
                  id: "interface",
                  label: "Bilingual/multilingual UI",
                  note: "icons · colour",
                  span: 4,
                },
              ],
            },
          ],
          links: [
            ["purchasing", "data"],
            ["inventory", "data"],
            ["sales", "data"],
            ["enquiries", "data"],
            ["data", "dashboards"],
            ["data", "insights"],
            ["dashboards", "interface"],
            ["insights", "interface"],
          ],
        },
        alt: "System drawing. A business chooses sales, purchasing, inventory and enquiry modules. They share one PostgreSQL data model that keeps each business apart. Insights adapt to the selected modules, dashboards support owners, managers and workers, and bilingual or multilingual interface options use icons and colour.",
        title: "System drawing",
        note: "Private: no screenshots",
      },
    ],
  },
  {
    slug: "intrusion-detection",
    title: "Real-time Intrusion Detection",
    kind: "client",
    headline: "A cable that raises the alarm.",
    kicker: "A client's security system",
    summary:
      "Fibre-optic sensing turned into live security alerts: Raspberry Pis detect anomalies on private LANs; only alert details reach the notification server, while operators see events beside switchable CCTV and webcam video.",
    description:
      "Fibre-optic sensing turned into live security alerts: Raspberry Pis detect anomalies on private LANs, and operators see events beside CCTV and webcam video.",
    proof: "Deployed at five sites over a year and a half.",
    role: "Founding engineer, lead developer",
    duration: "About eight months",
    construction: "Spring Boot · InfluxDB · PostgreSQL · AWS · Raspberry Pi · React",
    visuals: [
      {
        kind: "drawing",
        drawing: {
          bands: [
            {
              label: "Private site LAN",
              nodes: [
                { id: "sensors", label: "Fibre-optic sensors", note: "high-frequency data" },
                { id: "local", label: "Local server", note: "Raspberry Pi · anomalies" },
              ],
            },
            {
              label: "Separate services",
              nodes: [
                { id: "admin", label: "Admin server", note: "minimum alert data" },
                { id: "video", label: "Video service", note: "RTSP → browser" },
              ],
            },
            {
              label: "To people and monitoring",
              nodes: [
                { id: "alerts", label: "Owners & managers", note: "four channels" },
                { id: "monitor", label: "Monitoring screen", note: "map · cameras · webcams" },
              ],
            },
          ],
          links: [
            ["sensors", "local"],
            ["local", "admin"],
            ["admin", "alerts"],
            ["video", "monitor"],
          ],
        },
        alt: "System drawing. In the private site LAN, fibre-optic sensors feed a local Raspberry Pi server that detects anomalies. Only the alert details needed for four channels reach a separate admin server. A video service converts RTSP CCTV for the browser; the monitoring screen combines a live map, selectable cameras and webcam inputs.",
        title: "System drawing",
        note: "Private: no screenshots",
      },
    ],
  },
  {
    slug: "wedding-photo-platform",
    title: "Wedding Photo Platform",
    kind: "personal",
    headline: "A day, kept in chapters.",
    kicker: "A personal archive",
    summary:
      "A wedding told in chapters, photo reels and albums, where guests find every photograph they appear in.",
    proof: "7,504 photographs, 92 people found by face, nothing paid per image.",
    role: "Solo engineer",
    period: "June – September 2026",
    construction: "Next.js · Offline ML · Cloudflare R2",
    visuals: [
      {
        kind: "image",
        src: "/images/work/wedding-platform.webp",
        alt: "Wedding platform demo cover with a floral background and placeholder Bride and Groom names.",
        caption: "Sample names and dates. Faces hidden in the public demo.",
        title: "The wedding demo",
        note: "Public demo · 2026",
      },
    ],
    demo: { href: "https://wedding-demo-teal.vercel.app/", label: "Explore the public demo" },
  },
  {
    slug: "household-hub",
    title: "Household Hub",
    kind: "personal",
    headline: "Less to remember.",
    kicker: "Everyday operations",
    tagline: ["A little less remembering.", "A little more living."],
    summary:
      "Rent, tenants and household spending in one place, with reminders sent over WhatsApp and handwritten expense slips read into entries you review.",
    proof: "Runs a family's rent and spending; its users include a grandmother.",
    role: "Solo engineer",
    period: "May – October 2026",
    construction: "Next.js · Supabase · PostgreSQL",
    visuals: [
      {
        kind: "image",
        src: "/images/work/household-insights-light.webp",
        alt: "Household Hub public demo in light theme: expense Insights with upcoming household needs.",
        caption: "Invented household data. The private family app stays private.",
        title: "Household insights",
        note: "Public demo · 2026",
      },
    ],
    demo: { href: "https://tenant-management-2my6.vercel.app/", label: "Try the public demo" },
  },
];
