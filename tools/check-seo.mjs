/** Verify crawler-visible SEO against a running local production server. */
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";

import { projects, caseStudyPath } from "../content/projects.ts";
import { parsePostText, slugFromFile } from "../lib/post-file.ts";

const posts = readdirSync("content/posts")
  .filter((file) => file.endsWith(".md"))
  .map((file) => ({
    slug: slugFromFile(file),
    ...parsePostText(readFileSync(`content/posts/${file}`, "utf8")),
  }));
const published = posts.filter((post) => post.fields.status === "published");
const draftPosts = posts.filter((post) => post.fields.status !== "published");
const publishedPaths = published.map((post) => `/blog/${post.slug}`);
const indexedPaths = ["/", ...projects.map(({ slug }) => caseStudyPath(slug)), ...publishedPaths];

const base = new URL(process.argv[2] ?? "http://127.0.0.1:3010");
assert.ok(["localhost", "127.0.0.1"].includes(base.hostname), "Use a local production server");
const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.maxsash.com").origin;
const paths = [
  "/",
  "/?seed=27c4b901",
  "/blog",
  "/blog/three-waves-one-sea",
  "/blog/an-integral-under-sail",
  ...indexedPaths.filter((path) => path !== "/"),
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
    const article = path.startsWith("/blog/") || path.startsWith("/work/");
    assert.equal(meta("og:type"), article ? "article" : "website");
    const shouldIndex = indexedPaths.includes(canonicalPath);
    const directives = meta("robots")
      .split(",")
      .map((value) => value.trim());
    assert.ok(directives.includes(shouldIndex ? "index" : "noindex"));
    assert.ok(!directives.includes(shouldIndex ? "noindex" : "index"));
    assert.ok(directives.includes("follow"));
    if (article) assert.notEqual(meta("og:title"), "Maxsash Studio — Sea. Ship. Math.");
    if (path.startsWith("/work/")) {
      const json = JSON.parse(
        html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
      );
      assert.equal(json["@type"], "Article");
      assert.equal(json.url, `${origin}${canonicalPath}`);
    } else if (!path.startsWith("/blog")) {
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
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(sitemapUrls.sort(), indexedPaths.map((path) => `${origin}${path}`).sort());
const image = await fetch(new URL("/images/living-atlas-day-v1.jpg", base));
assert.equal(image.status, 200);
assert.equal(image.headers.get("content-type"), "image/jpeg");
assert.equal((await fetch(new URL("/blog/not-a-post", base))).status, 404);
assert.equal((await fetch(new URL("/work/not-a-project", base))).status, 404);
const workIndex = await fetch(new URL("/work", base), { redirect: "manual" });
assert.equal(new URL(workIndex.headers.get("location"), base).href, new URL("/#work", base).href);
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
for (const path of publishedPaths) {
  const html = await (await fetch(new URL(path, base))).text();
  assert.ok(!html.includes("Notes for the editor"), `${path} must not contain editorial notes`);
}
const blogIndex = await (await fetch(new URL("/blog", base))).text();
for (const { slug } of draftPosts) {
  assert.equal((await fetch(new URL(`/blog/${slug}`, base))).status, 404, `${slug} must not ship`);
  assert.ok(!blogIndex.includes(`/blog/${slug}`), `${slug} must not be linked`);
}
mkdirSync("tools/.out/seo", { recursive: true });
writeFileSync(
  "tools/.out/seo/report.json",
  JSON.stringify({ records, robots, sitemap, imageStatus: image.status }, null, 2),
);
console.log(
  `Passed ${records.length} crawler/page cases, discovery files, image response, unknown-article 404 and ${draftPosts.length} unpublished drafts kept out.`,
);
