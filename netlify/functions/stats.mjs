import { getStore } from "@netlify/blobs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function isAuthed(req) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  return req.headers.get("authorization") === `Bearer ${token}`;
}

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (!isAuthed(req)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  const statsStore = getStore("stats");
  const contactStore = getStore("contact-submissions");

  const [{ blobs: statBlobs }, { blobs: contactBlobs }] = await Promise.all([
    statsStore.list(),
    contactStore.list(),
  ]);

  const pageEntries = await Promise.all(
    statBlobs.map(async ({ key }) => ({ key, data: await statsStore.get(key, { type: 'json' }) }))
  );

  const pages = {};
  for (const { key, data } of pageEntries) {
    if (data) pages[key] = data;
  }

  // Return last 10 contact submissions sorted by date (newest first)
  const allContacts = await Promise.all(contactBlobs.map(({ key }) => contactStore.get(key, { type: 'json' })));
  const sortedContacts = allContacts
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return new Response(
    JSON.stringify({
      pages,
      totalContacts: contactBlobs.length,
      recentContacts: sortedContacts,
    }),
    { status: 200, headers: corsHeaders }
  );
};

export const config = { path: "/api/stats" };
