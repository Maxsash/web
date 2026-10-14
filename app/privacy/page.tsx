import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import AnalyticsPreferences from "@/components/telemetry/AnalyticsPreferences";
import { site } from "@/content/site";
import styles from "./Privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy & analytics",
  description: "What Maxsash Studio measures, what stays private, and your analytics choice.",
  robots: { index: false, follow: true },
};

export default function Privacy() {
  return (
    <PageShell skip="Skip to privacy">
      <article className={styles.copy} data-telemetry-ignore>
        <p>Maxsash Studio · Updated 15 October 2026</p>
        <h1>Privacy & analytics</h1>
        <p>
          I want to understand which parts of this website people find useful, and where the
          experience gets in their way. Analytics uses no saved visitor identity. You can pause it
          for your current visit.
        </p>
        <h2>Your visit</h2>
        <AnalyticsPreferences />
        <h2>What analytics records</h2>
        <p>
          If enabled and allowed, analytics records the pages and homepage sections you visit,
          project and notebook links you open, contact-link actions, sea-studio actions, and a few
          technical issues. It also records a broad browser family, viewport size category and
          pointer type. It never records the text you type, clipboard contents, sea seeds or contact
          details.
        </p>
        <p>
          Each open page gets a temporary random visit identifier held only in memory. It can
          connect ordinary navigation within that page, but reloading, opening a new tab or closing
          the page starts a new visit. It is never written to cookies, local storage or session
          storage. A long-open page also starts a new visit after 30 minutes without a recorded
          event or after 24 hours.
        </p>
        <h2>Where it goes</h2>
        <p>
          The website validates these events before forwarding them to PostHog Cloud. It does not
          forward your IP address or full browser identification string, and disables location
          lookup and person-profile creation. There are no session recordings, advertising trackers
          or company-identification services in this integration.
        </p>
        <p>
          Events are used to understand aggregate journeys and improve the website. Access is
          restricted to the studio’s analytics account. This project uses PostHog’s EU Cloud. Event
          history follows PostHog’s plan-based retention policy: one year on the free plan and seven
          years on paid plans. These reporting windows do not promise automatic deletion. See{" "}
          <a href="https://posthog.com/docs/data/events-retention">PostHog’s retention policy</a>{" "}
          for details.
        </p>
        <h2>What stays in your browser</h2>
        <p>
          The visit identifier and analytics pause choice stay in memory for the current page.
          Pausing stops new events and drops unsent events. It cannot retract events already
          received. Reloading forgets the identifier and pause choice; analytics starts again if it
          is configured.
        </p>
        <p>
          The site separately remembers your day/night and sound preferences locally. These settings
          are not visitor identifiers and are not sent through analytics.
        </p>
        <h2>Hosting and contact links</h2>
        <p>
          Vercel hosts this website and handles network requests, which can include operational logs
          such as IP addresses. This is separate from the optional visitor analytics. Email,
          WhatsApp and other external links open services with their own privacy practices; a link
          click does not tell me whether you sent a message.
        </p>
        <h2>Questions</h2>
        <p>
          Write to <a href={site.links.email}>{site.email}</a> about this website’s privacy or
          analytics. You can pause analytics here at any time.
        </p>
      </article>
    </PageShell>
  );
}
