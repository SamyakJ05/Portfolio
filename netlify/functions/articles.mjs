import { getStore } from "@netlify/blobs";
import { getAll } from "./_lib/articles.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function isAuthed(req) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${token}`;
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const store = getStore("articles");
  const url = new URL(req.url);

  if (req.method === "GET") {
    const all = await getAll(store);
    const adminMode = isAuthed(req);
    const result = adminMode ? all : all.filter((a) => a.published);
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders });
  }

  if (!isAuthed(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  if (req.method === "POST" || req.method === "PUT") {
    let article;
    try { article = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
    }
    if (!article.id) {
      article.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }
    if (!article.slug) {
      article.slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    await store.set(article.id, JSON.stringify(article));
    return new Response(JSON.stringify(article), { status: 200, headers: corsHeaders });
  }

  if (req.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400, headers: corsHeaders });
    await store.delete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
};

export const config = { path: "/api/articles" };
