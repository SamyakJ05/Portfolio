import { getStore } from "@netlify/blobs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

async function sendEmail({ name, email, message }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set - email skipped");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: ["sj.samyakj@gmail.com"],
      reply_to: email,
      subject: `New message from ${name} - samyak.space`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#111">
          <div style="background:#0d0d0d;padding:24px 32px;border-radius:12px 12px 0 0">
            <p style="color:#4f98a3;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 4px">New message via</p>
            <p style="color:#fff;font-size:1.1rem;font-weight:700;margin:0">samyak.space</p>
          </div>
          <div style="background:#f9f9f9;padding:28px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e5e5;border-top:none">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr><td style="padding:6px 0;font-size:0.8rem;color:#888;width:80px">From</td><td style="padding:6px 0;font-size:0.9rem;font-weight:600">${name}</td></tr>
              <tr><td style="padding:6px 0;font-size:0.8rem;color:#888">Email</td><td style="padding:6px 0"><a href="mailto:${email}" style="color:#4f98a3">${email}</a></td></tr>
            </table>
            <div style="background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:16px 20px">
              <p style="margin:0;font-size:0.78rem;color:#888;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em">Message</p>
              <p style="margin:0;font-size:0.95rem;line-height:1.65;white-space:pre-wrap">${message}</p>
            </div>
            <p style="margin:24px 0 0;font-size:0.75rem;color:#aaa">
              Reply directly to this email to respond to ${name}.
            </p>
          </div>
        </div>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(unreadable)");
    console.error(`[contact] Resend error ${res.status}: ${body}`);
    throw new Error(`Resend API returned ${res.status}`);
  }
}

export default async (req) => {
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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email address" }), { status: 400, headers: corsHeaders });
  }

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const submission = {
    id,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  // Store to Blobs (non-critical - don't let it block email)
  try {
    const store = getStore("contact-submissions");
    await store.set(id, JSON.stringify(submission));
  } catch (err) {
    console.error("[contact] Blobs store failed (non-fatal):", err);
  }

  // Send email (critical)
  try {
    await sendEmail(submission);
  } catch (err) {
    console.error("[contact] Email send failed:", err);
    return new Response(JSON.stringify({ error: "Failed to send message. Please email sj.samyakj@gmail.com directly." }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: corsHeaders });
};

export const config = { path: "/api/contact" };
