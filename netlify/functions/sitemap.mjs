import { getStore } from "@netlify/blobs";
import { getPublished, escapeHtml } from "./_lib/articles.mjs";

function urlEntry(loc, lastmod) {
  return `  <url>
    <loc>${escapeHtml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
  </url>`;
}

export default async (req) => {
  const host = new URL(req.url).hostname;
  const isBlog = host === "blog.samyak.space";

  let entries;
  if (isBlog) {
    const store = getStore("articles");
    const articles = await getPublished(store);
    entries = [
      urlEntry("https://blog.samyak.space/"),
      ...articles.map((a) => urlEntry(`https://blog.samyak.space/articles/${a.slug}`, a.date)),
    ];
  } else {
    entries = [urlEntry("https://samyak.space/")];
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
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
