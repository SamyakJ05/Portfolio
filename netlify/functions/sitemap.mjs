import { getStore } from "@netlify/blobs";
import { getPublished, escapeHtml } from "./_lib/articles.mjs";

function urlEntry(loc, { lastmod, changefreq, priority } = {}) {
  return `  <url>
    <loc>${escapeHtml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : ""}${priority ? `\n    <priority>${priority}</priority>` : ""}
  </url>`;
}

export default async (req) => {
  const host = new URL(req.url).hostname;
  const isBlog = host === "blog.samyak.space";
  const today = new Date().toISOString().slice(0, 10);

  let entries, comment;
  if (isBlog) {
    const store = getStore("articles");
    const articles = await getPublished(store);
    const latest = articles[0]?.date;
    comment = `<!-- Sitemap for blog.samyak.space. Server-generated on each request from published posts in Netlify Blobs, so it always reflects the current post list. -->`;
    entries = [
      urlEntry("https://blog.samyak.space/", { lastmod: latest, changefreq: "daily", priority: "1.0" }),
      ...articles.map((a) =>
        urlEntry(`https://blog.samyak.space/articles/${a.slug}`, {
          lastmod: a.date,
          changefreq: "monthly",
          priority: "0.8",
        })
      ),
    ];
  } else {
    comment = `<!-- Sitemap for samyak.space. The portfolio is a single-page site; this lists its one canonical URL. -->`;
    entries = [urlEntry("https://samyak.space/", { lastmod: today, changefreq: "monthly", priority: "1.0" })];
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
${comment}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};

export const config = { path: "/sitemap.xml" };
