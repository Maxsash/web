export type AutomaticReplayRule = { country: string; reviewUntil: string; sampleRate: number };
export type ReplayPolicy = {
  enabled: boolean;
  mode: "voluntary" | "automatic";
  sampleRate: number;
  validUntil: string | null;
};

export const indiaReplayReviewUntil = "2027-04-30T00:00:00Z";
export const automaticReplayRules: readonly AutomaticReplayRule[] = [
  { country: "IN", reviewUntil: indiaReplayReviewUntil, sampleRate: 0.1 },
];

export function replayPolicy(
  country: string | null,
  rules = automaticReplayRules,
  now = Date.now(),
): ReplayPolicy {
  const rule =
    country && /^[A-Z]{2}$/.test(country)
      ? rules.find((item) => item.country === country)
      : undefined;
  const expiry = rule ? Date.parse(rule.reviewUntil) : NaN;
  const automatic =
    !!rule &&
    Number.isFinite(expiry) &&
    now < expiry &&
    rule.sampleRate > 0 &&
    rule.sampleRate <= 1;
  return {
    enabled: true,
    mode: automatic ? "automatic" : "voluntary",
    sampleRate: automatic ? rule.sampleRate : 0,
    validUntil: automatic ? rule.reviewUntil : null,
  };
}

export function privacySignal(headers: Headers) {
  return headers.get("sec-gpc") === "1" || headers.get("dnt") === "1";
}

export function recordingAllowed(
  policy: ReplayPolicy | null,
  mode: "voluntary" | "automatic",
  now = Date.now(),
) {
  if (!policy?.enabled) return false;
  return (
    mode === "voluntary" ||
    (policy.mode === "automatic" &&
      !!policy.validUntil &&
      now < Date.parse(policy.validUntil) &&
      policy.sampleRate > 0 &&
      policy.sampleRate <= 1)
  );
}
