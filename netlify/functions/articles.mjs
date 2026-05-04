import { getStore } from "@netlify/blobs";

const SEED = {
  id: "seed-retainiq",
  title: "Building RetainIQ: How I Won Amazon's AI Innovation Competition",
  slug: "building-retainiq-amazon-aideas-winner",
  date: "2026-05-01",
  tags: ["AWS", "AI", "Cloud", "Product"],
  excerpt: "A deep dive into the architecture, design decisions, and AI-driven approach behind RetainIQ — the product that won the Innovation Category at Amazon AIdeaS 2026.",
  content: `<p>Earlier this year, I entered Amazon's global AI Innovation competition — <strong>AIdeaS 2026</strong> — with a product called <strong>RetainIQ</strong>. We won the Innovation Category.</p>

<p>This is the full story: what we built, how we built it, and what I learned.</p>

<h2>The Problem</h2>
<p>Customer churn is expensive. Most businesses react to it — they notice a customer has left and then scramble. RetainIQ flips that model: it predicts churn before it happens and triggers personalised, AI-generated retention actions automatically.</p>

<h2>The Architecture</h2>
<p>RetainIQ is built cloud-native on AWS. The core stack:</p>
<ul>
  <li><strong>Amazon Bedrock</strong> — LLM backbone for generating personalised retention messages</li>
  <li><strong>Lambda + SQS</strong> — event-driven pipeline for churn signal processing</li>
  <li><strong>DynamoDB</strong> — storing customer state and action history</li>
  <li><strong>EventBridge</strong> — orchestrating scheduled re-engagement workflows</li>
</ul>

<h2>The AI Layer</h2>
<p>The intelligence sits in two places. First, a lightweight ML model scoring churn probability from behavioural signals. Second, a prompt pipeline that takes the churn score + customer context and generates a hyper-personalised message — tone, offer, channel all adapted per user.</p>

<h2>What Won It</h2>
<p>The judges cited the tight product-architecture fit and the clarity of the business case. But honestly? The thing that stood out was the demo. Seeing the system catch a churning customer in real-time and respond within seconds — that landed.</p>

<p>Full technical write-up is published on <a href="https://builder.aws.com/content/3CV2aFroWhni2e6MGlj8kLSDbCY/aideas-finalist-retainiq" target="_blank" rel="noopener">AWS Builder Center</a>.</p>`,
  published: true,
};

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

async function getAll(store) {
  const { blobs } = await store.list();
  if (blobs.length === 0) {
    await store.set(SEED.id, JSON.stringify(SEED));
    return [SEED];
  }
  const items = await Promise.all(blobs.map(({ key }) => store.get(key, { type: 'json' })));
  return items.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));
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
