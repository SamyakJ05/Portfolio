export default async (req) => {
  const host = new URL(req.url).hostname;
  const canonicalHost = host === "blog.samyak.space" ? "blog.samyak.space" : "samyak.space";

  const body = `User-agent: *
Allow: /
Disallow: /admin.html

Sitemap: https://${canonicalHost}/sitemap.xml
`;

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

export const config = { path: "/robots.txt" };
