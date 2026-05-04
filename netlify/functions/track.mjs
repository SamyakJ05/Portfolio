import { getStore } from "@netlify/blobs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  let page;
  try {
    ({ page } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
  }
  if (!page || typeof page !== "string") {
    return new Response(JSON.stringify({ error: "page required" }), { status: 400, headers: corsHeaders });
  }

  const store = getStore("stats");
  const key = `page:${page.slice(0, 120)}`;
  const today = new Date().toISOString().split("T")[0];

  const existing = (await store.getJSON(key)) ?? { total: 0, daily: {} };
  existing.total += 1;
  existing.daily[today] = (existing.daily[today] ?? 0) + 1;

  // Prune daily entries older than 30 days
  const sorted = Object.keys(existing.daily).sort();
  sorted.slice(0, Math.max(0, sorted.length - 30)).forEach((k) => delete existing.daily[k]);

  await store.setJSON(key, existing);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
};

export const config = { path: "/api/track" };
