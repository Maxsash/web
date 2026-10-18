const campaigns = ["none", "editorial", "portfolio", "social", "outreach"] as const;
export const acquisitionValues = {
  source: [
    "direct",
    "google",
    "bing",
    "linkedin",
    "instagram",
    "whatsapp",
    "portfolio",
    "external",
    "unknown",
  ],
  campaign: campaigns,
  utm_source: [
    "none",
    "google",
    "bing",
    "linkedin",
    "instagram",
    "whatsapp",
    "portfolio",
    "newsletter",
    "email",
  ],
  utm_medium: [
    "none",
    "social",
    "organic_social",
    "paid_social",
    "messaging",
    "email",
    "referral",
    "organic",
    "cpc",
    "paid",
  ],
  utm_campaign: campaigns,
  utm_content: [
    "none",
    "link_in_bio",
    "bio",
    "profile",
    "featured",
    "post",
    "story",
    "reel",
    "status",
    "message",
    "direct_message",
    "email_signature",
    "newsletter",
    "website",
    "contact_info",
  ],
  utm_term: ["none", "brand", "web_design", "web_development", "software_development"],
} as const;
export type Acquisition = {
  [Key in keyof typeof acquisitionValues]: (typeof acquisitionValues)[Key][number];
};

export function acquisition(referrer: string, origin: string, search: string): Acquisition {
  let source: Acquisition["source"] = "direct";
  if (referrer) {
    try {
      const url = new URL(referrer);
      const domain = url.hostname.toLowerCase();
      if (url.origin === origin) source = "unknown";
      else if (/(^|\.)google\.(com|[a-z]{2}|com\.[a-z]{2}|co\.[a-z]{2})$/.test(domain))
        source = "google";
      else if (/(^|\.)bing\.com$/.test(domain)) source = "bing";
      else if (/(^|\.)linkedin\.com$/.test(domain) || domain === "lnkd.in") source = "linkedin";
      else if (/(^|\.)instagram\.com$/.test(domain)) source = "instagram";
      else if (/(^|\.)(whatsapp\.com|wa\.me)$/.test(domain)) source = "whatsapp";
      else if (domain === "maxsash.com" || domain === "www.maxsash.com") source = "portfolio";
      else source = "external";
    } catch {
      source = "unknown";
    }
  }
  const params = new URLSearchParams(search);
  function tag<Key extends keyof typeof acquisitionValues>(key: Key): Acquisition[Key] {
    const values = params.getAll(key);
    const value = values.length === 1 ? values[0].trim().toLowerCase() : "none";
    return (acquisitionValues[key] as readonly string[]).includes(value)
      ? (value as Acquisition[Key])
      : ("none" as Acquisition[Key]);
  }
  const utm_source = tag("utm_source");
  const utm_campaign = tag("utm_campaign");
  if (utm_source !== "none")
    source = utm_source === "email" || utm_source === "newsletter" ? "external" : utm_source;
  return {
    source,
    campaign: utm_campaign,
    utm_source,
    utm_medium: tag("utm_medium"),
    utm_campaign,
    utm_content: tag("utm_content"),
    utm_term: tag("utm_term"),
  };
}
