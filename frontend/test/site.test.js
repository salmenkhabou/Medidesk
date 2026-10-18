import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  pages,
  resolvePage,
  buildPublicConfig,
  isIndexable,
  canView,
} from "../src/site.js";
import {
  headFor,
  robotsFile,
  sitemapFile,
  renderDocument,
} from "../build/site-plugin.js";
const config = buildPublicConfig({
  SITE_URL: "https://example.test",
  PRIVACY_OPERATOR: "Example operator",
  PRIVACY_EMAIL: "privacy@example.test",
  PRIVACY_POLICY_REVIEWED: "true",
});

test("every route has unique, non-personal metadata and an explicit URL; unknown URLs map to 404", () => {
  assert.equal(
    new Set(Object.values(pages).map((p) => p.path)).size,
    Object.keys(pages).length,
  );
  assert.equal(
    new Set(Object.values(pages).map((p) => p.title)).size,
    Object.keys(pages).length,
  );
  for (const [key, page] of Object.entries(pages)) {
    assert.equal(resolvePage(page.path), key);
    assert.equal(resolvePage(page.path === "/" ? "/" : page.path + "/"), key);
    const head = headFor(key, config);
    assert.ok(head.includes('name="description"'));
    assert.ok(head.includes('property="og:image:alt"'));
    assert.ok(head.includes('content="https://example.test/og-image.png"'));
    assert.equal(head.includes("index, follow"), isIndexable(key, config));
  }
  assert.equal(resolvePage("/unknown/private@example.test"), "notFound");
  assert.equal(resolvePage("/index.html"), "directory");
  assert.equal(resolvePage("/confidentialite.html"), "privacy");
  assert.equal(resolvePage("/unknown.html"), "notFound");
});
test("crawler output contains only configured, indexable public URLs and never private records", () => {
  const sitemap = sitemapFile(config);
  for (const [key, page] of Object.entries(pages))
    assert.equal(
      sitemap.includes(`<loc>https://example.test${page.path}</loc>`),
      isIndexable(key, config),
    );
  assert.ok(robotsFile(config).includes("Disallow: /api/"));
  assert.ok(robotsFile(config).includes("Disallow: /dossier-medical"));
  assert.ok(
    robotsFile(config).includes("Sitemap: https://example.test/sitemap.xml"),
  );
  assert.equal(robotsFile(buildPublicConfig()), "User-agent: *\nDisallow: /\n");
  assert.equal(
    (sitemapFile(buildPublicConfig()).match(/<url>/g) || []).length,
    0,
  );
  assert.equal(
    isIndexable(
      "privacy",
      buildPublicConfig({ SITE_URL: "https://example.test" }),
    ),
    false,
  );
  for (const SITE_URL of [
    "http://example.test",
    "https://example.test/path",
    "https://user:pass@example.test",
    "https://example.test/?email=a",
  ])
    assert.throws(() => buildPublicConfig({ SITE_URL }));
});
test("generated documents expose metadata and privacy information without JavaScript", () => {
  const source = readFileSync(
    new URL("../index.html", import.meta.url),
    "utf8",
  );
  const html = renderDocument(source, "privacy", config);
  assert.ok(html.includes("Example operator"));
  assert.ok(html.includes("privacy@example.test"));
  assert.ok(html.includes("Mesure d’audience"));
  assert.ok(html.includes('rel="canonical"'));
  assert.equal((html.match(/<title>/g) || []).length, 1);
  const draft = renderDocument(source, "privacy", buildPublicConfig());
  assert.ok(draft.includes("Document de travail"));
  const privatePage = renderDocument(source, "records", config);
  assert.ok(privatePage.includes("noindex, nofollow"));
  assert.ok(privatePage.includes('<div id="root"></div>'));
  const escaped = renderDocument(source, "privacy", {
    ...config,
    operator: "<script>unsafe</script>",
  });
  assert.ok(escaped.includes("&lt;script&gt;unsafe&lt;/script&gt;"));
  assert.ok(!escaped.includes("<script>unsafe"));
});
test("image assets have real dimensions and all advertised favicon formats exist", () => {
  const read = (name) =>
    readFileSync(new URL(`../public/${name}`, import.meta.url));
  const og = read("og-image.png");
  assert.equal(og.readUInt32BE(16), 1200);
  assert.equal(og.readUInt32BE(20), 630);
  for (const [name, size] of [
    ["favicon-16x16.png", 16],
    ["favicon-32x32.png", 32],
    ["apple-touch-icon.png", 180],
    ["android-chrome-192x192.png", 192],
    ["android-chrome-512x512.png", 512],
  ]) {
    const png = read(name);
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
  const ico = read("favicon.ico");
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 2);
  const manifest = JSON.parse(read("site.webmanifest"));
  assert.equal(manifest.icons.length, 2);
  for (const icon of manifest.icons)
    assert.ok(read(icon.src.slice(1)).length > 0);
});
test("private routes preserve role boundaries independently of public navigation", () => {
  assert.equal(canView("privacy", null), true);
  assert.equal(canView("records", null), false);
  assert.equal(canView("records", { role: "secretariat" }), false);
  assert.equal(canView("records", { role: "patient" }), true);
  assert.equal(canView("analytics", { role: "patient" }), false);
  assert.equal(canView("analytics", { role: "superadmin" }), true);
});
