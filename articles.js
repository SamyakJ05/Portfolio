/* ── Shared Article Store ─────────────────────────────────────────────
   Fetches from /api/articles (Netlify Blobs) on init, falls back to
   localStorage so the site works offline / during local dev without
   netlify dev running.
──────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = "sj_articles";

const SEED_ARTICLES = [
  {
    id: "seed-retainiq",
    title: "Building RetainIQ: How I Won Amazon's AI Innovation Competition",
    slug: "building-retainiq-amazon-aideas-winner",
    date: "2026-05-01",
    tags: ["AWS", "AI", "Cloud", "Product"],
    excerpt:
      "A deep dive into the architecture, design decisions, and AI-driven approach behind RetainIQ — the product that won the Innovation Category at Amazon AIdeaS 2026.",
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
  },
];

// ── Internal localStorage helpers ─────────────────────────────────────

function localLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ARTICLES));
  return SEED_ARTICLES;
}

function localSave(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

// ── Admin token (set after login) ─────────────────────────────────────

let _adminToken = null;

function setAdminToken(token) {
  _adminToken = token;
}

function authHeaders() {
  const h = { "Content-Type": "application/json" };
  if (_adminToken) h["Authorization"] = `Bearer ${_adminToken}`;
  return h;
}

// ── API helpers ───────────────────────────────────────────────────────

async function apiFetch(method, body, params) {
  const url = params ? `/api/articles?${new URLSearchParams(params)}` : "/api/articles";
  const opts = { method, headers: authHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`API ${method} failed: ${res.status}`);
  return res.json();
}

// ── Public API ────────────────────────────────────────────────────────

async function init(adminToken) {
  if (adminToken) setAdminToken(adminToken);
  try {
    const articles = await apiFetch(_adminToken ? "GET" : "GET");
    localSave(articles);
    return articles;
  } catch {
    return localLoad();
  }
}

function getAll() {
  return localLoad()
    .filter((a) => a.published)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getAllAdmin() {
  return localLoad().sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getBySlug(slug) {
  return localLoad().find((a) => a.slug === slug) || null;
}

async function upsert(article) {
  const saved = await apiFetch(article.id ? "PUT" : "POST", article);
  const all = localLoad();
  const idx = all.findIndex((a) => a.id === saved.id);
  if (idx >= 0) all[idx] = saved;
  else all.push(saved);
  localSave(all);
  return saved;
}

async function remove(id) {
  await apiFetch("DELETE", null, { id });
  localSave(localLoad().filter((a) => a.id !== id));
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

window.ArticleStore = {
  init,
  setAdminToken,
  getAll,
  getAllAdmin,
  getBySlug,
  upsert,
  remove,
  slugify,
  newId,
  formatDate,
};
