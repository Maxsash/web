export const visitRoles = ["visitor", "owner", "tester"] as const;
export const visitIntents = ["unknown", "work", "read", "play"] as const;
export type VisitLabels = {
  visit_role: (typeof visitRoles)[number];
  declared_intent: (typeof visitIntents)[number];
};
export const defaultLabels: VisitLabels = { visit_role: "visitor", declared_intent: "unknown" };

export function visitLabels(search: string, previous = defaultLabels): VisitLabels {
  const params = new URLSearchParams(search);
  const role = params.getAll("studio_visit");
  const intent = params.getAll("studio_intent");
  return {
    visit_role:
      role.length === 0
        ? previous.visit_role
        : role.length === 1 && visitRoles.includes(role[0] as VisitLabels["visit_role"])
          ? (role[0] as VisitLabels["visit_role"])
          : "visitor",
    declared_intent:
      intent.length === 0
        ? previous.declared_intent
        : intent.length === 1 && visitIntents.includes(intent[0] as VisitLabels["declared_intent"])
          ? (intent[0] as VisitLabels["declared_intent"])
          : "unknown",
  };
}
