import { dashboards } from "./telemetry/reports.mjs";

if (!process.argv.includes("--apply")) {
  console.log(JSON.stringify(dashboards, null, 2));
} else {
  const host = process.env.POSTHOG_APP_HOST ?? "https://eu.posthog.com";
  const project = process.env.POSTHOG_PROJECT_ID;
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  if (
    !["https://eu.posthog.com", "https://us.posthog.com"].includes(host) ||
    !/^\d+$/.test(project ?? "") ||
    !key
  )
    throw new Error(
      "Set POSTHOG_APP_HOST, POSTHOG_PROJECT_ID and a local POSTHOG_PERSONAL_API_KEY with dashboard/insight read and write scopes. Do not put it in the repository.",
    );
  const base = `${host}/api/projects/${project}`;
  const request = async (path, data) => {
    const response = await fetch(`${base}${path}`, {
      method: data ? "POST" : "GET",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      ...(data ? { body: JSON.stringify(data) } : {}),
      signal: AbortSignal.timeout(30000),
      redirect: "error",
    });
    if (!response.ok)
      throw new Error(
        `PostHog ${data ? "write" : "read"} failed (${response.status}); inspect project permissions. No API key or response body logged.`,
      );
    return response.json();
  };
  const list = async (path) => {
    const items = [];
    let page = `${path}?limit=100`;
    while (page) {
      const response = await request(page);
      items.push(...response.results);
      if (response.next) {
        const next = new URL(response.next, host);
        if (next.origin !== host || !next.pathname.startsWith(`/api/projects/${project}/`))
          throw new Error("Unexpected pagination host");
        page = next.pathname.slice(`/api/projects/${project}`.length) + next.search;
      } else page = null;
    }
    return items;
  };
  const existing = await list("/dashboards/");
  const insights = await list("/insights/");
  for (const definition of dashboards) {
    const name = `Maxsash · ${definition.name}`;
    const matches = existing.filter((item) => !item.deleted && item.name === name);
    if (matches.length > 1)
      throw new Error(`Duplicate dashboard: ${name}; resolve manually before rerunning`);
    const dashboard =
      matches[0] ??
      (await request("/dashboards/", { name, description: definition.description, pinned: true }));
    for (const { name: title, ...body } of definition.insights) {
      const already = insights.some(
        (item) => !item.deleted && item.name === title && item.dashboards?.includes(dashboard.id),
      );
      if (!already)
        await request("/insights/", { ...body, name: title, dashboards: [dashboard.id] });
    }
    console.log(`${definition.name}: ${host}/project/${project}/dashboard/${dashboard.id}`);
  }
}
