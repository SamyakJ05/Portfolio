import { getStore } from "@netlify/blobs";

export default async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
  }

  const { name, email, message } = body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return new Response(JSON.stringify({ error: "name, email, and message are required" }), { status: 400, headers: corsHeaders });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email address" }), { status: 400, headers: corsHeaders });
  }

  const store = getStore("contact-submissions");
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  await store.setJSON(id, {
    id,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  });

  return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: corsHeaders });
};

export const config = { path: "/api/contact" };
