const property = (key, value) => ({
  key,
  value: typeof value === "number" ? value : [value],
  operator: "exact",
  type: "event",
});
const series = (event, properties = [], math = "unique_session") => ({
  kind: "EventsNode",
  event,
  properties,
  math,
});
const base = { dateRange: { date_from: "-28d" }, properties: [property("schema_version", 1)] };
const insight = (name, description, source) => ({
  name,
  description,
  query: { kind: "InsightVizNode", source: { ...base, ...source } },
});
const trends = (name, event, breakdown, properties = []) =>
  insight(
    name,
    "Observed in-memory visits, not people. Review counts with privacy/collection coverage.",
    {
      kind: "TrendsQuery",
      interval: "day",
      series: [series(event, properties)],
      trendsFilter: { display: breakdown ? "ActionsBarValue" : "ActionsLineGraph" },
      ...(breakdown
        ? { breakdownFilter: { breakdowns: [{ property: breakdown, type: "event" }] } }
        : {}),
    },
  );
const funnel = (name, steps) =>
  insight(
    name,
    "Ordered steps within one recorded visit, at most 24 hours. Contact actions are not confirmed enquiries.",
    {
      kind: "FunnelsQuery",
      series: steps.map(([event, properties]) => ({ kind: "EventsNode", event, properties })),
      funnelsFilter: {
        funnelOrderType: "ordered",
        funnelVizType: "steps",
        funnelWindowInterval: 24,
        funnelWindowIntervalUnit: "hour",
        funnelAggregateByHogQL: "properties.$session_id",
      },
    },
  );
const pathLabel =
  "multiIf(event = 'page_view', concat('Page ', properties.route), event = 'section_view', concat('Section ', properties.section), event = 'content_open', concat('Open ', properties.content, '/', properties.slug), event = 'contact_action', concat('Contact ', properties.channel, ' ', properties.action), event = 'studio_action', concat('Studio ', properties.action), event)";
const paths = (name, extra = {}) =>
  insight(
    name,
    "Observed transitions, not complete human histories. Up to 12 steps; reloads, pausing and blockers limit coverage.",
    {
      kind: "PathsQuery",
      pathsFilter: {
        includeEventTypes: ["hogql"],
        pathsHogQLExpression: pathLabel,
        stepLimit: 12,
        ...extra,
      },
    },
  );
const sql = (name, query) => ({
  name,
  description: "First recorded route per memory-only visit, not necessarily the true landing page.",
  query: {
    kind: "DataVisualizationNode",
    display: "ActionsTable",
    source: { kind: "HogQLQuery", query },
  },
});
const audience = {
  key: "visit_role",
  value: ["owner", "tester"],
  operator: "is_not",
  type: "event",
};
const acquisitionChart = (name, event, breakdown) => {
  const chart = trends(name, event, breakdown);
  chart.query.source.properties = [...chart.query.source.properties, audience];
  chart.description =
    "Entry attribution for observed visits; excludes self-declared owner/tester visits. New UTM fields arrive with 1.4.0; untagged visits use referrer/direct. No people or confirmed enquiries.";
  return chart;
};
const section = (name) => [property("section", name)];
const content = (name) => [property("content", name)];

export const dashboards = [
  {
    name: "Acquisition",
    description:
      "Privacy-bounded entry attribution carried through each page lifetime. Owner/tester visits excluded. UTM fields arrive with 1.4.0; historical missing values are not backfilled. Contact activations are not confirmed enquiries.",
    insights: [
      acquisitionChart("Audience acquisition source", "page_view", "source"),
      acquisitionChart("Tagged acquisition source", "page_view", "utm_source"),
      acquisitionChart("Acquisition medium", "page_view", "utm_medium"),
      acquisitionChart("Acquisition campaign", "page_view", "utm_campaign"),
      acquisitionChart("Acquisition placement", "page_view", "utm_content"),
      acquisitionChart("Acquisition term", "page_view", "utm_term"),
      acquisitionChart("Contact visits by acquisition source", "contact_action", "source"),
    ],
  },
  {
    name: "Visit context and testing",
    description:
      "Self-declared visit labels and interests, not verified identities. Filter owner and tester visits out of audience analysis; missing labels on older releases mean unknown context.",
    insights: [
      trends("Visit labels", "page_view", "visit_role"),
      trends("Declared visitor interests", "page_view", "declared_intent", [
        property("visit_role", "visitor"),
      ]),
      trends("Testing and recording choices", "replay_choice", "action"),
    ],
  },
  {
    name: "Website overview",
    description:
      "Observed in-memory visits. No person profiles or inferred customer identities. Owner/tester labels are self-declared. Counts are not total site traffic.",
    insights: [
      trends("Observed visits", "page_view"),
      acquisitionChart("Acquisition source", "page_view", "source"),
      trends("Homepage section reach", "section_view", "section"),
      trends("Contact actions by channel", "contact_action", "channel"),
      sql(
        "First observed route",
        "SELECT entry_route, count() AS visits FROM (SELECT properties.$session_id AS visit, argMin(properties.route, timestamp) AS entry_route FROM events WHERE event = 'page_view' AND properties.schema_version = 1 AND timestamp >= now() - INTERVAL 28 DAY GROUP BY visit) GROUP BY entry_route ORDER BY visits DESC",
      ),
    ],
  },
  {
    name: "Visitor journeys",
    description:
      "Discover paths before designing funnels. Do not confuse transitions with unique visits.",
    insights: [
      paths("Observed page and action journeys"),
      paths("After the homepage", { startPoint: "Page /" }),
      paths("Before email contact", { endPoint: "Contact email open" }),
    ],
  },
  {
    name: "Contact journey",
    description:
      "Understand progression to contact intent. Visits cannot be stitched across devices or later sessions.",
    insights: [
      funnel("Work exposure → case study → contact", [
        ["section_view", section("work")],
        ["page_view", [property("route_group", "work")]],
        ["contact_action", []],
      ]),
      funnel("Notebook article → work → contact", [
        ["content_engaged", content("notebook")],
        ["page_view", [property("route_group", "work")]],
        ["contact_action", []],
      ]),
      trends("Homepage contact actions", "contact_action", "placement", [
        property("route_group", "home"),
      ]),
    ],
  },
  {
    name: "Content and engagement",
    description:
      "Exposure matters: the existing order changes what people get a chance to see. Reading thresholds are proxies.",
    insights: [
      funnel("Work exposure → case-study link", [
        ["section_view", section("work")],
        ["content_open", content("work")],
      ]),
      funnel("Notebook exposure → article link", [
        ["section_view", section("notebook")],
        ["content_open", content("notebook")],
      ]),
      trends("Content opened by slug", "content_open", "slug"),
      trends("Content engagement by slug", "content_engaged", "slug"),
      trends("Sea studio actions", "studio_action", "action"),
    ],
  },
  {
    name: "Experience health",
    description:
      "Compare friction before interpreting visitor intent. Use Vercel logs and Speed Insights for server/performance detail.",
    insights: [
      trends("Navigation result", "navigation_result", "outcome"),
      trends("Navigation duration", "navigation_result", "duration"),
      trends("Technical issues", "experience_issue", "issue"),
      trends("Issues by browser", "experience_issue", "browser"),
      trends("Issues by viewport", "experience_issue", "viewport"),
    ],
  },
];
