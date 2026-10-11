/** Verify crawler-visible SEO against a running local production server. */
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";

import { projects, caseStudyPath, projectShareImage } from "../content/projects.ts";
import { site } from "../content/site.ts";
import { notebook } from "../content/notebook.ts";
import { noteShareImage } from "../lib/note-share.ts";
import { parsePostText, slugFromFile } from "../lib/post-file.ts";

const WHATSAPP_PREVIEW_BYTES = 600_000;

const posts = readdirSync("content/posts")
  .filter((file) => file.endsWith(".md"))
  .map((file) => ({
    slug: slugFromFile(file),
    ...parsePostText(readFileSync(`content/posts/${file}`, "utf8")),
  }));
const published = posts.filter((post) => post.fields.status === "published");
const draftPosts = posts.filter((post) => post.fields.status !== "published");
const publishedPaths = published.map((post) => `/blog/${post.slug}`);
const essayPaths = notebook.map(({ slug }) => `/blog/${slug}`);
const blogArticles = new Map([
  ...notebook.map((post) => [post.slug, post]),
  ...published.map((post) => [post.slug, { slug: post.slug, ...post.fields }]),
]);
const indexedPaths = [
  "/",
  "/blog",
  ...essayPaths,
  ...projects.map(({ slug }) => caseStudyPath(slug)),
  ...publishedPaths,
];

const base = new URL(process.argv[2] ?? "http://127.0.0.1:3010");
assert.ok(["localhost", "127.0.0.1"].includes(base.hostname), "Use a local production server");
const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.maxsash.com").origin;
const paths = ["/", "/?seed=27c4b901", ...indexedPaths.filter((path) => path !== "/")];
const records = [];
const crawlerAgents = [
  "WhatsApp",
  "facebookexternalhit",
  "Twitterbot",
  "Googlebot",
  "bingbot",
  "OAI-SearchBot",
];
const attribute = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const structuredData = (html) => {
  const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  assert.ok(match, "Expected JSON-LD");
  return JSON.parse(match[1]);
};
const serverRenderedMain = (html) => {
  const match = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/);
  assert.ok(match, "Expected a server-rendered main element");
  assert.match(match[1], /<h1\b/);
  return match[1]
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};
for (const agent of crawlerAgents) {
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
    const project = projects.find(({ slug }) => caseStudyPath(slug) === canonicalPath);
    const noteSlug = canonicalPath.startsWith("/blog/") ? canonicalPath.slice(6) : undefined;
    const shareImage = project
      ? projectShareImage(project)
      : noteSlug && noteShareImage(noteSlug, "");
    const imagePath = shareImage?.url ?? site.shareImage.url;
    assert.equal(meta("og:image"), `${origin}${imagePath}`);
    assert.equal(meta("og:image:width"), "1200");
    assert.equal(meta("og:image:height"), String(shareImage?.height ?? 630));
    assert.ok(meta("og:image:alt"));
    assert.equal(meta("twitter:image"), `${origin}${imagePath}`);
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
    if (article)
      assert.match(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "", / \| Maxsash Studio$/);
    if (agent === "bingbot" || agent === "OAI-SearchBot") {
      assert.ok(
        serverRenderedMain(html).length > 200,
        `${agent} must receive substantial server-rendered content`,
      );
    }
    if (canonicalPath.startsWith("/blog")) {
      assert.ok(!html.includes("Sample essay"));
      assert.ok(!meta("og:description").includes("Sample studies"));
      if (canonicalPath !== "/blog") {
        const article = blogArticles.get(canonicalPath.slice("/blog/".length));
        assert.ok(article, `${canonicalPath} must have source content`);
        const json = structuredData(html);
        assert.equal(json["@context"], "https://schema.org");
        assert.equal(json["@type"], "BlogPosting");
        assert.equal(json.headline, article.title);
        assert.equal(json.description, article.summary);
        assert.equal(json.datePublished, article.date);
        assert.equal(json.articleSection, article.topic);
        assert.equal(json.url, `${origin}${canonicalPath}`);
        assert.equal(json.inLanguage, "en");
        assert.equal(json.author["@id"], `${origin}/#yash`);
        assert.equal(json.author.name, "Yash Shrivastava");
        assert.equal(json.isPartOf["@id"], `${origin}/#website`);
      }
    }
    if (path.startsWith("/work/")) {
      if (project.duration) {
        assert.ok(html.includes("Build time"));
        assert.ok(html.includes(project.duration));
      }
      assert.ok(!meta("og:title").includes("Household Hub: Household Hub"));
      const json = structuredData(html);
      assert.equal(json["@type"], "Article");
      assert.equal(json.url, `${origin}${canonicalPath}`);
    } else if (!path.startsWith("/blog")) {
      const json = structuredData(html);
      assert.equal(
        json["@graph"].find((item) => item["@type"] === "Person").name,
        "Yash Shrivastava",
      );
      assert.equal(
        json["@graph"].find((item) => item["@type"] === "ProfilePage").hasPart.length,
        5,
      );
      const studio = json["@graph"].find((item) => item["@type"] === "Organization");
      assert.equal(studio.name, site.name);
      assert.equal(studio.logo, `${origin}${site.logo}`);
      assert.equal(studio.founder["@id"], `${origin}/#yash`);
      assert.deepEqual(studio.sameAs, [site.links.studioLinkedin, site.links.instagram]);
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
const image = await fetch(new URL(site.shareImage.url, base));
assert.equal(image.status, 200);
assert.equal(image.headers.get("content-type"), "image/jpeg");
assert.ok((await image.arrayBuffer()).byteLength < WHATSAPP_PREVIEW_BYTES);
const manifest = await (await fetch(new URL("/manifest.webmanifest", base))).json();
assert.equal(manifest.name, site.name);
for (const { src } of manifest.icons) {
  const icon = await fetch(new URL(src, base));
  assert.equal(icon.status, 200);
  assert.equal(icon.headers.get("content-type"), "image/png");
}
for (const shareImage of [
  ...projects.map(projectShareImage),
  ...[...blogArticles.keys()].map((slug) => noteShareImage(slug, "")),
]) {
  if (!shareImage) continue;
  const response = await fetch(new URL(shareImage.url, base));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/webp");
}
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
