// Old query-string article URLs (/article?slug=x, /article.html?slug=x) → clean canonical path.
export default async (req) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const dest = slug
    ? `https://blog.samyak.space/articles/${encodeURIComponent(slug)}`
    : "https://blog.samyak.space/";
  return Response.redirect(dest, 301);
};

export const config = { path: ["/article", "/article.html"] };
