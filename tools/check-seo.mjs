/** Verify crawler-visible SEO against a running local production server. */
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";

const base = new URL(process.argv[2] ?? "http://127.0.0.1:3010");
assert.ok(["localhost", "127.0.0.1"].includes(base.hostname), "Use a local production server");
const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.maxsash.com").origin;
const paths = [
  "/",
  "/?seed=27c4b901",
  "/blog",
  "/blog/three-waves-one-sea",
  "/blog/an-integral-under-sail",
];
const records = [];
const attribute = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
for (const agent of ["WhatsApp", "facebookexternalhit", "Twitterbot", "Googlebot"]) {
  for (const path of paths) {
    const response = await fetch(new URL(path, base), { headers: { "User-Agent": agent } });
    assert.equal(response.status, 200);
    const html = await response.text();
    const source = agent === "Googlebot" ? html : html.split("</head>")[0];
    const tags = [...source.matchAll(/<meta\b[^>]*>/g)].map((match) => match[0]);
    const meta = (key) =>
      attribute(
        tags.find((tag) => attribute(tag, "property") === key || attribute(tag, "name") === key) ??
          "",
        "content",
      );
    const canonicalPath = path.split("?")[0];
    const canonical = [...source.matchAll(/<link\b[^>]*>/g)]
      .map((match) => match[0])
      .find((tag) => attribute(tag, "rel") === "canonical");
    assert.equal(new URL(attribute(canonical ?? "", "href")).href, `${origin}${canonicalPath}`);
    assert.equal(new URL(meta("og:url")).href, `${origin}${canonicalPath}`);
    assert.ok(meta("og:title"));
    assert.ok(meta("og:description"));
    assert.equal(meta("og:image"), `${origin}/images/living-atlas-day-v1.jpg`);
    assert.equal(meta("og:image:width"), "1200");
    assert.equal(meta("og:image:height"), "630");
    assert.ok(meta("og:image:alt"));
    assert.equal(meta("twitter:image"), `${origin}/images/living-atlas-day-v1.jpg`);
    assert.equal(meta("twitter:card"), "summary_large_image");
    assert.equal(meta("twitter:title"), meta("og:title"));
    assert.equal(meta("og:type"), path.startsWith("/blog/") ? "article" : "website");
    assert.ok(meta("robots").includes(path.startsWith("/blog") ? "noindex" : "index"));
    if (path.startsWith("/blog/"))
      assert.notEqual(meta("og:title"), "Maxsash Studio — Sea. Ship. Math.");
    if (!path.startsWith("/blog")) {
      const json = JSON.parse(
        html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
      );
      assert.equal(
        json["@graph"].find((item) => item["@type"] === "Person").name,
        "Yash Shrivastava",
      );
      assert.equal(
        json["@graph"].find((item) => item["@type"] === "ProfilePage").hasPart.length,
        5,
      );
    }
    records.push({ agent, path, title: meta("og:title"), passed: true });
  }
}
const robots = await (await fetch(new URL("/robots.txt", base))).text();
assert.ok(robots.includes("Allow: /"));
assert.ok(robots.includes("Disallow: /api/"));
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
const sitemap = await (await fetch(new URL("/sitemap.xml", base))).text();
assert.equal([...sitemap.matchAll(/<loc>/g)].length, 1);
assert.ok(sitemap.includes(`<loc>${origin}/</loc>`));
const image = await fetch(new URL("/images/living-atlas-day-v1.jpg", base));
assert.equal(image.status, 200);
assert.equal(image.headers.get("content-type"), "image/jpeg");
assert.equal((await fetch(new URL("/blog/not-a-post", base))).status, 404);
const postsDir = "content/posts";
const drafts = readdirSync(postsDir).filter(
  (file) =>
    file.endsWith(".md") &&
    !/^status: published$/m.test(readFileSync(`${postsDir}/${file}`, "utf8")),
);
for (const [method, path] of [
  ["GET", "/write"],
  ["PUT", "/api/dev/posts"],
  ["POST", "/api/dev/posts"],
]) {
  const response = await fetch(new URL(path, base), {
    method,
    headers: { "Content-Type": "application/json", Origin: base.origin },
    body: method === "GET" ? undefined : "{}",
  });
  assert.equal(response.status, 404, `${method} ${path} must not exist in production`);
}
const blogIndex = await (await fetch(new URL("/blog", base))).text();
for (const file of drafts) {
  const slug = file.replace(/^\d+-/, "").replace(/\.md$/, "");
  assert.equal((await fetch(new URL(`/blog/${slug}`, base))).status, 404, `${slug} must not ship`);
  assert.ok(!blogIndex.includes(`/blog/${slug}`), `${slug} must not be linked`);
}
mkdirSync("tools/.out/seo", { recursive: true });
writeFileSync(
  "tools/.out/seo/report.json",
  JSON.stringify({ records, robots, sitemap, imageStatus: image.status }, null, 2),
);
console.log(
  `Passed ${records.length} crawler/page cases, discovery files, image response, unknown-article 404 and ${drafts.length} unpublished drafts kept out.`,
);
