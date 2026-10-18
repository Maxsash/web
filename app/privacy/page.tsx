import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import ReplayPreferences from "@/components/telemetry/ReplayPreferences";
import VisitLabels from "@/components/telemetry/VisitLabels";
import AnalyticsPreferences from "@/components/telemetry/AnalyticsPreferences";
import { site } from "@/content/site";
import styles from "./Privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy & recordings",
  description: "What Maxsash Studio measures, what stays private, and your analytics choice.",
  robots: { index: false, follow: true },
};

export default function Privacy() {
  return (
    <PageShell skip="Skip to privacy">
      <article className={styles.copy} data-telemetry-ignore>
        <p>Maxsash Studio · Updated 17 October 2026</p>
        <h1>Privacy & recordings</h1>
        <p>
          I want to understand which parts of this website people find useful, and where the
          experience gets in their way. Analytics uses no saved visitor identity. You can pause it
          for your current visit.
        </p>
        <h2>Your visit</h2>
        <AnalyticsPreferences />
        <h2>Your region and recording choice</h2>
        <ReplayPreferences />
        <h2>Your visit context</h2>
        <VisitLabels />
        <p>
          Visit links can declare an owner or tester visit and an interest in work, reading or the
          sea. Only these fixed labels are recorded. They are not verified identities, and a link
          never grants permission to record.
        </p>
        <h2>What analytics records</h2>
        <p>
          If enabled and allowed, analytics records the pages and homepage sections you visit,
          project and notebook links you open, contact-link actions, sea-studio actions, and a few
          technical issues. It also records a broad browser family, viewport size category and
          pointer type. Fixed source, medium, campaign, placement and search-term labels from entry
          links help show where visits come from. Unapproved labels and advertising click IDs are
          discarded. It never records the text you type, clipboard contents, sea seeds or contact
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
          lookup and person-profile creation. There are no advertising trackers or
          company-identification services.
        </p>
        <p>
          Events are used to understand aggregate journeys and improve the website. Access is
          restricted to the studio’s analytics account. This project uses PostHog’s EU Cloud. Event
          history follows PostHog’s plan-based retention policy: one year on the free plan and seven
          years on paid plans. These reporting windows do not promise automatic deletion. See{" "}
          <a href="https://posthog.com/docs/data/events-retention">PostHog’s retention policy</a>{" "}
          for details.
        </p>
        <h2>Session recordings</h2>
        <p>
          To improve navigation and understand visitor interests, this site records up to 10% of
          eligible visits from India automatically under a reviewed rule. Other regions and unknown
          locations use voluntary testing. The region check uses the host’s approximate IP-derived
          country; correct it above if it is inaccurate. The region is not sent to analytics.
        </p>
        <p>
          PostHog receives public page content, clicks and scrolling. Inputs and contact links are
          masked; canvas animations, console logs and network bodies are excluded. Page URL queries
          and fragments are removed. Recordings use temporary visit identifiers and are retained for
          up to 30 days. Access is restricted to the studio’s analytics account.
        </p>
        <p>
          The recorder connects to PostHog’s EU service, whose network infrastructure receives the
          connection’s IP address. IP recording, location lookup and person-profile creation are
          disabled in capture configuration. There is no advertising or cross-site tracking.
        </p>
        <p>
          A visible Stop control ends recording and saves your refusal of automatic recording. Your
          automatic-recording choice and region correction are saved in this browser, without a
          visitor identifier, and apply across reloads and tabs. Clearing browser storage removes
          those choices. If preferences cannot be saved, automatic recording stays off. Global
          Privacy Control and Do Not Track block replay, including voluntary tests.
        </p>
        <p>
          “Help test this site” explains recording before you choose Start. That permission covers
          this visit, ends on reload and does not change your saved automatic-recording choice.
          Pausing analytics also stops replay. Stopping prevents new uploads; it does not retract
          recordings already received. Contact the studio below with any privacy or deletion
          request.
        </p>
        <h2>What stays in your browser</h2>
        <p>
          The visit identifier and analytics pause choice stay in memory for the current page.
          Recording refusal and region correction are saved separately as described above. Pausing
          stops new events and drops unsent events. It cannot retract events already received.
          Reloading forgets the identifier and pause choice; analytics starts again if it is
          configured.
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
