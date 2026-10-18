import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  pages,
  resolvePage,
  shareImageAlt,
  buildPublicConfig,
  isIndexable,
} from "../src/site.js";
import { privacySections } from "../src/privacy.js";
export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
export function headFor(key, config, origin = "") {
  const page = pages[key] || pages.notFound;
  const base = config.siteUrl || origin;
  const tags = [
    ["name", "description", page.description],
    [
      "name",
      "robots",
      isIndexable(key, config) ? "index, follow" : "noindex, nofollow",
    ],
    ["property", "og:type", "website"],
    ["property", "og:locale", "fr_TN"],
    ["property", "og:site_name", "MediDesk"],
    ["property", "og:title", `${page.title} | MediDesk`],
    ["property", "og:description", page.description],
    ["property", "og:image", `${base}/og-image.png`],
    ["property", "og:image:type", "image/png"],
    ["property", "og:image:width", "1200"],
    ["property", "og:image:height", "630"],
    ["property", "og:image:alt", shareImageAlt],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", `${page.title} | MediDesk`],
    ["name", "twitter:description", page.description],
    ["name", "twitter:image", `${base}/og-image.png`],
    ["name", "twitter:image:alt", shareImageAlt],
  ];
  if (base && key !== "notFound")
    tags.push(["property", "og:url", `${base}${page.path}`]);
  return `<title>${escapeHtml(page.title)} | MediDesk</title>\n${tags.map(([kind, name, value]) => `<meta ${kind}="${name}" content="${escapeHtml(value)}" />`).join("\n")}${config.siteUrl && key !== "notFound" ? `\n<link rel="canonical" href="${escapeHtml(config.siteUrl + page.path)}" />` : ""}`;
}
export function robotsFile(config) {
  if (!config.siteUrl) return "User-agent: *\nDisallow: /\n";
  return `User-agent: *\nAllow: /\nDisallow: /api/\n${Object.entries(pages)
    .filter(([key]) => !isIndexable(key, config))
    .map(([, p]) => `Disallow: ${p.path}`)
    .join("\n")}\nSitemap: ${config.siteUrl}/sitemap.xml\n`;
}
export function sitemapFile(config) {
  const urls = Object.keys(pages)
    .filter((key) => isIndexable(key, config))
    .map(
      (key) =>
        `<url><loc>${escapeHtml(config.siteUrl + pages[key].path)}</loc></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
function staticContent(key, config) {
  const page = pages[key];
  if (!page.public) return "";
  const policy =
    key === "privacy"
      ? `${!config.policyReviewed ? "<p>Document de travail : informations d’exploitation à compléter et à valider avant publication.</p>" : ""}${privacySections(
          config,
        )
          .map(
            (s) =>
              `<section><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.text)}</p></section>`,
          )
          .join("")}`
      : "";
  return `<main class="static-page"><a href="/">MediDesk</a><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p>${policy}<p><a href="/inscription">Créer mon compte patient</a> · <a href="/rejoindre">Rejoindre le réseau</a> · <a href="/confidentialite">Confidentialité</a></p><noscript>Activez JavaScript pour utiliser les formulaires et votre espace personnel.</noscript></main>`;
}
export function renderDocument(html, key, config, origin = "") {
  return html
    .replace(
      /<!-- PAGE_META_START -->[\s\S]*?<!-- PAGE_META_END -->/,
      `<!-- PAGE_META_START -->\n${headFor(key, config, origin)}\n<!-- PAGE_META_END -->`,
    )
    .replace(
      '<div id="root"></div>',
      `<div id="root">${staticContent(key, config)}</div>`,
    );
}
export function sitePlugin(env) {
  const config = buildPublicConfig(env);
  let root;
  return {
    name: "medidesk-public-pages",
    configResolved(c) {
      root = c.root;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = new URL(req.url, "http://localhost").pathname;
        if (path === "/robots.txt" || path === "/sitemap.xml") {
          res.setHeader(
            "Content-Type",
            path.endsWith(".xml")
              ? "application/xml; charset=utf-8"
              : "text/plain; charset=utf-8",
          );
          res.end(
            path.endsWith(".xml") ? sitemapFile(config) : robotsFile(config),
          );
          return;
        }
        if (
          req.method !== "GET" ||
          path.startsWith("/api") ||
          path.startsWith("/@") ||
          path.startsWith("/src") ||
          path.startsWith("/node_modules") ||
          (/\.[a-z0-9]+$/i.test(path) && !path.endsWith(".html"))
        )
          return next();
        if (resolvePage(path) === "notFound") {
          try {
            const html = await server.transformIndexHtml(
              req.url,
              readFileSync(resolve(root, "index.html"), "utf8"),
            );
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
          } catch (error) {
            next(error);
          }
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!["GET", "HEAD"].includes(req.method)) return next();
        const path = new URL(req.url, "http://localhost").pathname;
        if (
          path.startsWith("/api/") ||
          path.startsWith("/assets/") ||
          (/\.[a-z0-9]+$/i.test(path) && !path.endsWith(".html"))
        )
          return next();
        const key = resolvePage(path);
        const name =
          key === "directory"
            ? "index.html"
            : key === "notFound"
              ? "404.html"
              : `${pages[key].path.slice(1)}.html`;
        try {
          const html = readFileSync(
            resolve(root, server.config.build.outDir, name),
          );
          res.statusCode = key === "notFound" ? 404 : 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(req.method === "HEAD" ? "" : html);
        } catch {
          next();
        }
      });
    },
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        return renderDocument(
          html,
          resolvePage(
            new URL(
              context.originalUrl || context.path || "/",
              "http://localhost",
            ).pathname,
          ),
          config,
        );
      },
    },
    generateBundle: {
      order: "post",
      handler(options, bundle) {
        const index = bundle["index.html"];
        if (!index) return;
        // Transform the built entry for each explicit route so link scrapers need no JavaScript.
        const template = index.source.replace(
          /<div id="root">[\s\S]*?<\/div>/,
          '<div id="root"></div>',
        );
        for (const [key, page] of Object.entries(pages)) {
          if (key === "directory") continue;
          const html = renderDocument(template, key, config);
          this.emitFile({
            type: "asset",
            fileName:
              key === "notFound" ? "404.html" : `${page.path.slice(1)}.html`,
            source: html,
          });
        }
        this.emitFile({
          type: "asset",
          fileName: "robots.txt",
          source: robotsFile(config),
        });
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: sitemapFile(config),
        });
      },
    },
  };
}
