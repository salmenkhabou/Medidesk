import { useEffect } from "react";
import { pages, shareImageAlt, isIndexable } from "../site";
export const siteConfig = __MEDIDESK_SITE__;
export function usePageMetadata(view) {
  useEffect(() => {
    const page = pages[view] || pages.notFound;
    document.title = `${page.title} | MediDesk`;
    function meta(kind, name, content) {
      let element = document.head.querySelector(`meta[${kind}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(kind, name);
        document.head.append(element);
      }
      element.content = content;
    }
    const base = siteConfig.siteUrl || location.origin;
    meta("name", "description", page.description);
    meta(
      "name",
      "robots",
      isIndexable(view, siteConfig) ? "index, follow" : "noindex, nofollow",
    );
    for (const [key, value] of Object.entries({
      title: document.title,
      description: page.description,
      image: `${base}/og-image.png`,
      "image:alt": shareImageAlt,
    })) {
      meta("property", `og:${key}`, value);
      meta("name", `twitter:${key}`, value);
    }
    const url = document.head.querySelector('meta[property="og:url"]');
    if (view === "notFound") url?.remove();
    else meta("property", "og:url", base + page.path);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (siteConfig.siteUrl && view !== "notFound") {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.append(canonical);
      }
      canonical.href = siteConfig.siteUrl + page.path;
    } else canonical?.remove();
  }, [view]);
}
