const SITE_INFO = {
  "blog.samyak.space": {
    host: "blog.samyak.space",
    description: "Samyak Jain's technical blog: cloud engineering, AI development, and build logs from production systems.",
  },
  "samyak.space": {
    host: "samyak.space",
    description: "Samyak Jain's portfolio: Software Engineer at UBS, Amazon AIdeaS 2026 Innovation Category Winner.",
  },
};

export default async (req) => {
  const host = new URL(req.url).hostname;
  const site = SITE_INFO[host] ?? SITE_INFO["samyak.space"];

  const body = `# robots.txt for ${site.host}
# ${site.description}
#
# All well-behaved crawlers are welcome. /admin.html is a private,
# authenticated publishing tool and isn't public content, so it's
# excluded from crawling and indexing.

User-agent: *
Allow: /
Disallow: /admin.html

Sitemap: https://${site.host}/sitemap.xml
`;

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

export const config = { path: "/robots.txt" };
